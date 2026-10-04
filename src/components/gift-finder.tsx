"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Gift, Heart, RotateCcw, Sparkles, Users } from "lucide-react";
import { filterProducts, formatPrice } from "@/lib/commerce";
import { useStore } from "./store-provider";
import { ProductCard } from "./product-card";

export function GiftFinder() {
  const { products } = useStore();
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState(250000);
  const matches = filterProducts(products, { recipient, occasion, maxPrice: budget }).filter((p) => p.stock > 0);
  return <section className="wrap finder-page"><div className="finder-intro"><span className="finder-icon"><Sparkles size={28} strokeWidth={1.4} /></span><span className="eyebrow">YOUR LITTLE GIFTING COMPANION</span><h1>A little about them.<br /><em>A lovely gift from you.</em></h1><p>Three thoughtful questions. A collection that feels just right.</p></div>
    {step < 3 ? <div className="finder-card"><div className="finder-progress">{["Their people", "The moment", "Your budget"].map((label, index) => <span key={label} className={step === index ? "active" : step > index ? "complete" : ""}><b>{step > index ? <Check size={14} /> : index + 1}</b>{label}</span>)}</div>
      {step === 0 && <><h2>Who&apos;s the lucky one?</h2><p>Let&apos;s start with the person behind the present.</p><div className="finder-options">{["Employees", "Clients", "Partners", "Friends & family"].map((value, i) => <button key={value} className={recipient === value ? "selected" : ""} onClick={() => setRecipient(value)} aria-pressed={recipient === value}>{i === 3 ? <Heart size={27} strokeWidth={1.3} /> : i === 0 ? <Users size={27} strokeWidth={1.3} /> : <Gift size={27} strokeWidth={1.3} />}<span>{value}</span>{recipient === value && <Check size={15} />}</button>)}</div></>}
      {step === 1 && <><h2>What&apos;s the little occasion?</h2><p>The big milestones and the just-because moments. We love them all.</p><div className="finder-options">{["Diwali", "Welcome aboard", "Thank you", "Celebrations", "Just because"].map((value) => <button key={value} className={occasion === value ? "selected" : ""} onClick={() => setOccasion(value)} aria-pressed={occasion === value}><Sparkles size={23} strokeWidth={1.3} /><span>{value}</span>{occasion === value && <Check size={15} />}</button>)}</div></>}
      {step === 2 && <><h2>Something thoughtful, within reach.</h2><p>What would you like to spend per gift?</p><div className="finder-options budget-options">{[100000, 150000, 250000, 500000].map((value) => <button key={value} className={budget === value ? "selected" : ""} onClick={() => setBudget(value)} aria-pressed={budget === value}><span>Up to <strong>{formatPrice(value)}</strong></span>{budget === value && <Check size={15} />}</button>)}</div><p className="helper-text">Based on gift prices, before optional personalization and shipping.</p></>}
      <div className="finder-navigation"><button className="text-link" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={16} />A little step back</button><button className="button button-primary" disabled={step === 0 ? !recipient : step === 1 ? !occasion : false} onClick={() => setStep(step + 1)}>{step === 2 ? "Find my thoughtful" : "A little further"}<ArrowRight size={17} /></button></div>
    </div> : <div className="finder-results"><div className="section-heading"><div><span className="eyebrow">CHOSEN FOR YOUR LITTLE MOMENT</span><h2>{matches.length ? "These feel like " : "A little more "}<em>{matches.length ? "them." : "room?"}</em></h2><p>{recipient} · {occasion} · Up to {formatPrice(budget)}</p></div><button className="text-link" onClick={() => setStep(0)}><RotateCcw size={15} />Start again</button></div>{matches.length ? <div className="product-grid">{matches.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="empty-state"><Gift size={33} /><h3>No exact matches in this little collection.</h3><p>Try a higher budget or a different occasion. We won&apos;t recommend something outside your choices.</p><button className="button button-primary" onClick={() => setStep(2)}>Adjust my budget <ArrowRight size={17} /></button></div>}</div>}
    <p className="finder-disclaimer"><Sparkles size={14} />A guided, catalogue-based finder. No AI-generated prices, stock, or promises.</p>
  </section>;
}
