import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { SupportTicketModel } from "@/lib/models";
import { apiError, rateLimit, requestIp } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await rateLimit(`support-ticket:${requestIp(request)}`, 10);
    const body = await request.json();
    const { name, email, phone, subject, category, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Name, email, subject, and message are required." }, { status: 400 });
    }

    await connectDb();
    const user = await currentUser();

    const ticketNumber = `TKT-${randomBytes(3).toString("hex").toUpperCase()}`;

    const ticket = await SupportTicketModel.create({
      ticketNumber,
      userId: user?.id,
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      subject,
      category: category || "OTHER",
      message,
      status: "OPEN",
      priority: "MEDIUM",
    });

    return NextResponse.json({
      success: true,
      ticketNumber: ticket.ticketNumber,
      message: "Your support request has been received. Our team will contact you promptly.",
    }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to view tickets." }, { status: 401 });
    }

    await connectDb();
    const query = user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? {} : { email: user.email.toLowerCase() };
    const tickets = await SupportTicketModel.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ tickets });
  } catch (error) {
    return apiError(error);
  }
}
