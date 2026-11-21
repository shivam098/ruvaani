"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Gift, RotateCcw, Sparkles } from "lucide-react";
import { MINIMUM_QUOTE_BUDGET, occasions, quoteHref, recipients } from "@/lib/catalog-data";
import { formatPrice } from "@/lib/commerce";
import { useStore } from "./store-provider";
import { ProductCard } from "./product-card";
import { apiRequest } from "@/lib/client-api";

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  personalizable: boolean;
  image: string;
  subtitle: string;
  description: string;
  estimatedTotalForQuantity?: number;
}

export function GiftFinder() {
  const { products } = useStore();
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState(1499);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<RecommendedProduct[]>([]);

  async function handleCreateBrief() {
    setLoadingAi(true);
    setStep(3);

    try {
      const prompt = `Gift for ${recipient} on ${occasion} with budget under ${budget}`;
      const result = await apiRequest<{
        summary: string;
        recommendations: RecommendedProduct[];
        count: number;
      }>("/api/ai/gift-assistant", {
        prompt,
        sessionId: `session-${Date.now()}`,
      });

      setAiSummary(result.summary);
      setAiRecommendations(result.recommendations || []);
    } catch {
      // Graceful fallback to catalogue featured items
    } finally {
      setLoadingAi(false);
    }
  }

  // Find products matching AI recommendations, or fallback to featured catalogue gifts
  const displayProducts = aiRecommendations.length > 0
    ? aiRecommendations.map((r) => {
        const found = products.find((p) => p.id === r.id);
        if (found) return found;
        return {
          id: r.id,
          slug: r.slug,
          name: r.name,
          subtitle: r.subtitle,
          description: r.description,
          category: r.category as any,
          image: r.image,
          imageAlt: r.name,
          cataloguePrice: r.price * 100,
          personalizable: r.personalizable,
          featured: true,
          source: "Database AI Recommendation",
        };
      })
    : products.filter((product) => product.featured);

  return (
    <section className="wrap finder-page">
      <div className="finder-intro">
        <span className="finder-icon"><Sparkles size={28} strokeWidth={1.4} /></span>
        <span className="eyebrow">YOUR THOUGHTFUL GIFTING BRIEF</span>
        <h1>A little about them.<br /><em>A lovely gift from you.</em></h1>
        <p>Start with three details. Let&apos;s make the rest personal.</p>
      </div>

      {step < 3 ? (
        <div className="finder-card">
          <div className="finder-progress">
            {["Your people", "The moment", "Your budget"].map((label, index) => (
              <span key={label} className={step === index ? "active" : step > index ? "complete" : ""}>
                <b>{step > index ? <Check size={14} /> : index + 1}</b>{label}
              </span>
            ))}
          </div>

          {step === 0 && (
            <>
              <h2>Who are you celebrating?</h2>
              <p>The people behind the thoughtful gesture.</p>
              <div className="finder-options">
                {recipients.map((value) => (
                  <button
                    key={value}
                    className={recipient === value ? "selected" : ""}
                    onClick={() => setRecipient(value)}
                    aria-pressed={recipient === value}
                  >
                    <Gift size={25} strokeWidth={1.3} />
                    <span>{value}</span>
                    {recipient === value && <Check size={15} />}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2>What&apos;s the occasion?</h2>
              <p>The milestones, the thank-yous and the moments in between.</p>
              <div className="finder-options">
                {occasions.map((value) => (
                  <button
                    key={value}
                    className={occasion === value ? "selected" : ""}
                    onClick={() => setOccasion(value)}
                    aria-pressed={occasion === value}
                  >
                    <Sparkles size={23} strokeWidth={1.3} />
                    <span>{value}</span>
                    {occasion === value && <Check size={15} />}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Your starting point.</h2>
              <p>Choose an indicative budget per gift for your enquiry.</p>
              <div className="finder-options budget-options">
                {[MINIMUM_QUOTE_BUDGET, 149, 299, 499, 999, 1499, 2199].map((value) => (
                  <button
                    key={value}
                    className={budget === value ? "selected" : ""}
                    onClick={() => setBudget(value)}
                    aria-pressed={budget === value}
                  >
                    <span>Around <strong>{formatPrice(value * 100)}</strong></span>
                    {budget === value && <Check size={15} />}
                  </button>
                ))}
              </div>
              <p className="helper-text">A planning preference, matched against real MongoDB catalogue inventory. Minimum enquiry: 10 gifts.</p>
            </>
          )}

          <div className="finder-navigation">
            <button className="text-link" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} />Back
            </button>
            <button
              className="button button-primary"
              disabled={step === 0 ? !recipient : step === 1 ? !occasion : false}
              onClick={() => {
                if (step === 2) {
                  handleCreateBrief();
                } else {
                  setStep(step + 1);
                }
              }}
            >
              {step === 2 ? "Create my brief" : "Continue"}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      ) : (
        <div className="finder-results">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A THOUGHTFUL START</span>
              <h2>Let&apos;s make it <em>yours.</em></h2>
              <p>{recipient} · {occasion} · Budget around {formatPrice(budget * 100)} per gift</p>
            </div>
            <button className="text-link" onClick={() => { setStep(0); setAiRecommendations([]); setAiSummary(""); }}>
              <RotateCcw size={15} />Start again
            </button>
          </div>

          <Link href={quoteHref({ recipient, occasion, budget })} className="button button-primary">
            Continue to my gifting enquiry <ArrowRight size={17} />
          </Link>

          <p className="helper-text">
            {loadingAi
              ? "Connecting to database and finding matching gifts..."
              : aiSummary || "These gift recommendations are matched from our live database catalogue. Our team will confirm all customization in your quotation."}
          </p>

          <div className="product-grid signature-grid">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      <p className="finder-disclaimer">
        <Sparkles size={14} />A guided enquiry builder powered by MongoDB catalogue inventory and recommendations.
      </p>
    </section>
  );
}
