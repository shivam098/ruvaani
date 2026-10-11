import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { ProductModel, AIConversationModel } from "@/lib/models";
import { apiError, rateLimit, requestIp } from "@/lib/http";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

interface ParsedIntent {
  occasion?: string;
  quantity?: number;
  budgetPerGift?: number;
  recipient?: string;
  category?: string;
}

function parseUserIntent(prompt: string): ParsedIntent {
  const lower = prompt.toLowerCase();
  const intent: ParsedIntent = {};

  // Detect Occasion
  const knownOccasions = [
    "diwali", "navratri", "holi", "rakhi", "raksha bandhan",
    "christmas", "new year", "wedding", "anniversary", "birthday",
    "employee appreciation", "welcome", "farewell",
  ];
  for (const occ of knownOccasions) {
    if (lower.includes(occ)) {
      intent.occasion = occ === "raksha bandhan" ? "Rakhi" : occ.charAt(0).toUpperCase() + occ.slice(1);
      break;
    }
  }

  // Detect Quantity (e.g. "100 employees", "50 pieces", "quantity 200", "500 logo")
  const qtyMatch = lower.match(/(\d+)\s*(?:employees|people|gifts|hampers|pieces|pcs|clients|kits|log|units)?/);
  if (qtyMatch && parseInt(qtyMatch[1], 10) >= 1 && parseInt(qtyMatch[1], 10) <= 50000) {
    intent.quantity = parseInt(qtyMatch[1], 10);
  }

  // Detect Budget per gift (e.g. "₹1000", "under 1500", "budget 800", "1000 ke andar", "rs 1200", "inr 2000")
  const budgetMatch = lower.match(/(?:₹|rs\.?|inr|under|below|andar|budget\s*of?)\s*(\d{2,6})/i) ||
                      lower.match(/(\d{2,6})\s*(?:rs|inr|rupees|ke\s*andar|tak)/i);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[1], 10);
    // Ignore if matched the same number as quantity when quantity is small
    if (val !== intent.quantity || val >= 100) {
      intent.budgetPerGift = val;
    }
  }

  // Detect Recipient
  if (lower.includes("employee") || lower.includes("staff") || lower.includes("team")) {
    intent.recipient = "Employees";
  } else if (lower.includes("client") || lower.includes("customer")) {
    intent.recipient = "Clients";
  } else if (lower.includes("partner") || lower.includes("vendor")) {
    intent.recipient = "Partners";
  } else if (lower.includes("friend") || lower.includes("family")) {
    intent.recipient = "Friends & family";
  }

  // Detect Category
  if (lower.includes("hamper") || lower.includes("box")) intent.category = "Hampers";
  else if (lower.includes("desk") || lower.includes("diary") || lower.includes("pen") || lower.includes("bottle")) intent.category = "Desk essentials";
  else if (lower.includes("wellness") || lower.includes("candle") || lower.includes("tea")) intent.category = "Wellness";
  else if (lower.includes("sweet") || lower.includes("chocolate") || lower.includes("dry fruit") || lower.includes("gourmet")) intent.category = "Gourmet";
  else if (lower.includes("eco") || lower.includes("sustainable") || lower.includes("bamboo")) intent.category = "Eco-friendly";

  return intent;
}

export async function POST(request: Request) {
  try {
    await rateLimit(`ai-assistant:${requestIp(request)}`, 30);
    const body = await request.json();
    const prompt = (body.prompt || "").trim();
    const sessionId = (body.sessionId || "guest-session").trim();

    if (!prompt) {
      return NextResponse.json({ error: "Please enter your gifting requirements." }, { status: 400 });
    }

    await connectDb();
    const user = await currentUser();

    const intent = parseUserIntent(prompt);
    const budgetLimitPaise = intent.budgetPerGift ? intent.budgetPerGift * 100 : undefined;

    // Deterministic Product Query verified against actual MongoDB inventory
    const query: Record<string, unknown> = { active: true };
    if (budgetLimitPaise) {
      query.price = { $lte: budgetLimitPaise };
    }
    if (intent.category) {
      query.category = new RegExp(intent.category, "i");
    }

    const matchedProducts = await ProductModel.find(query).limit(10).lean();

    // Secondary scoring based on occasion and recipient keywords
    const scoredProducts = matchedProducts.map((prod) => {
      let score = 0;
      if (budgetLimitPaise && prod.price <= budgetLimitPaise) score += 5;
      if (intent.occasion && prod.occasions?.some((o: string) => o.toLowerCase().includes(intent.occasion!.toLowerCase()))) score += 4;
      if (intent.recipient && prod.recipients?.some((r: string) => r.toLowerCase().includes(intent.recipient!.toLowerCase()))) score += 3;
      if (intent.category && prod.category.toLowerCase().includes(intent.category.toLowerCase())) score += 2;
      return { ...prod, score };
    }).sort((a, b) => b.score - a.score || a.price - b.price);

    const recommendations = scoredProducts.slice(0, 6).map((item) => {
      const priceInRupees = Math.round(item.price / 100);
      const qty = intent.quantity || 1;
      const totalEstimatedCost = priceInRupees * qty;

      return {
        id: item.id,
        name: item.name,
        slug: item.slug,
        category: item.category,
        price: priceInRupees,
        compareAtPrice: item.compareAtPrice ? Math.round(item.compareAtPrice / 100) : undefined,
        stock: item.stock,
        personalizable: item.personalizable,
        image: item.images?.[0] || `/catalogue/${item.slug}-sheet.webp`,
        subtitle: item.subtitle,
        description: item.description,
        estimatedTotalForQuantity: totalEstimatedCost,
      };
    });

    let summary = `I found ${recommendations.length} suitable gift options matching your request`;
    if (intent.budgetPerGift) summary += ` within ₹${intent.budgetPerGift} each`;
    if (intent.occasion) summary += ` for ${intent.occasion}`;
    if (intent.quantity) summary += ` (for ${intent.quantity} recipients)`;
    summary += ".";

    // Save conversation log in MongoDB
    try {
      await AIConversationModel.create({
        sessionId,
        userId: user?.id,
        messages: [
          { role: "user", content: prompt, timestamp: new Date() },
          { role: "assistant", content: summary, timestamp: new Date() },
        ],
        extractedIntent: {
          occasion: intent.occasion,
          quantity: intent.quantity,
          budgetPerGift: intent.budgetPerGift,
          totalBudget: intent.quantity && intent.budgetPerGift ? intent.quantity * intent.budgetPerGift : undefined,
          recipient: intent.recipient,
          category: intent.category,
        },
        recommendations: recommendations.map((r) => r.id),
      });
    } catch {
      // Non-blocking log persistence
    }

    return NextResponse.json({
      intent,
      summary,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    return apiError(error);
  }
}
