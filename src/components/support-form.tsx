"use client";

import { useState } from "react";
import { Check, MessageSquare, Send } from "lucide-react";
import { apiRequest } from "@/lib/client-api";

export function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res = await apiRequest<{ success: boolean; ticketNumber: string; message: string }>("/api/support", {
        name,
        email,
        phone,
        category,
        subject,
        message,
      });

      setTicketNumber(res.ticketNumber);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (ticketNumber) {
    return (
      <div className="quote-success" style={{ padding: "2rem", textAlign: "center", background: "#fbf8f5", borderRadius: "8px", border: "1px solid #eadecf" }}>
        <span className="success-mark"><Check size={30} /></span>
        <h2>Your message has been received!</h2>
        <p>Reference Ticket Number: <strong>{ticketNumber}</strong></p>
        <p>Our gifting specialists have logged your request in the system and will contact you promptly.</p>
        <button className="button button-outline" onClick={() => setTicketNumber("")} style={{ marginTop: "1rem" }}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="corporate-form" onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
      <div className="section-heading" style={{ marginBottom: "1rem" }}>
        <div>
          <span className="eyebrow">DIRECT INQUIRY & SUPPORT</span>
          <h2>Send a <em>message.</em></h2>
        </div>
      </div>
      <p style={{ marginBottom: "1.5rem", color: "#666" }}>
        Have a question about an existing order, custom branding, or delivery? Submit your inquiry directly into our system.
      </p>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-grid">
        <label>
          Your name
          <input
            placeholder="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Phone number (optional)
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <label>
          Inquiry category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="OTHER">General inquiry</option>
            <option value="CORPORATE">Corporate bulk order</option>
            <option value="ORDER">Existing order status</option>
            <option value="CUSTOMIZATION">Branding & customization</option>
            <option value="DELIVERY">Delivery & shipping</option>
            <option value="PAYMENT">Invoice & payment</option>
          </select>
        </label>

        <label className="span-two">
          Subject
          <input
            placeholder="What can we help you with?"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>

        <label className="span-two">
          Message details
          <textarea
            rows={4}
            placeholder="Share your requirements or questions..."
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
      </div>

      <button className="button button-primary full-width" disabled={busy} style={{ marginTop: "1rem" }}>
        <Send size={18} />
        {busy ? "Sending ticket..." : "Submit Inquiry to RUVAANI"}
      </button>
    </form>
  );
}
