"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Heart, PenLine, Star } from "lucide-react";
import { formatCataloguePrice, MINIMUM_QUOTE_QUANTITY, quoteHref, type CatalogueItem } from "@/lib/catalog-data";
import { ProductImage } from "./product-image";
import { useStore } from "./store-provider";
import type { QuoteContext } from "@/lib/validation";
import { useEffect } from "react";
import { apiRequest } from "@/lib/client-api";

interface ReviewItem {
  _id: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
  verifiedPurchase?: boolean;
}

export function ProductDetails({ product, quoteContext = {} }: { product: CatalogueItem; quoteContext?: QuoteContext }) {
  const { wishlist, toggleWishlist } = useStore();
  const [quantity, setQuantity] = useState(String(MINIMUM_QUOTE_QUANTITY));
  const [sheet, setSheet] = useState(false);
  const [error, setError] = useState("");
  const saved = wishlist.includes(product.id);
  const occasion = quoteContext.occasion ?? product.occasion;

  // MongoDB Reviews integration
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data) {
          setReviews(data.reviews || []);
          setAvgRating(data.averageRating || 5.0);
          setReviewCount(data.totalReviews || 0);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [product.id]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    setReviewNotice("");
    try {
      await apiRequest("/api/reviews", {
        productId: product.id,
        rating: reviewRating,
        name: reviewerName.trim() || "Thoughtful Gifter",
        title: reviewTitle.trim() || "Wonderful Gifting Experience",
        comment: reviewComment.trim(),
      });
      setReviewNotice("Thank you! Your review has been saved to the database.");
      setReviewComment("");
      setReviewTitle("");
      // Refresh reviews list
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating || 5.0);
        setReviewCount(data.totalReviews || 0);
      }
    } catch (err) {
      setReviewNotice(err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }

  function validateQuantity(event: React.FormEvent<HTMLFormElement>) {
    if (!Number.isSafeInteger(Number(quantity)) || Number(quantity) < MINIMUM_QUOTE_QUANTITY || Number(quantity) > 100000) {
      event.preventDefault();
      setError("Please enter a whole-number quantity between 10 and 100,000.");
    }
  }

  return (
    <div className="product-detail-grid">
      <div className="product-gallery">
        <div className="main-artwork">
          {sheet && product.sheet ? (
            <Image
              className="catalogue-sheet"
              src={product.sheet}
              alt={`${product.name}: original supplied catalogue sheet with contents and price`}
              width={product.sheetSize?.width ?? 1055}
              height={product.sheetSize?.height ?? 1491}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          ) : (
            <ProductImage product={product} sizes="(max-width: 760px) 100vw, 50vw" />
          )}
        </div>
        {product.sheet && (
          <div className="gallery-thumbnails">
            <button className={!sheet ? "selected" : ""} aria-pressed={!sheet} onClick={() => setSheet(false)}>
              Gift view
            </button>
            <button className={sheet ? "selected" : ""} aria-pressed={sheet} onClick={() => setSheet(true)}>
              Full catalogue sheet
            </button>
          </div>
        )}
        <p className="image-note">Imagery from the supplied RUVAANI catalogue. Final contents, colours and packaging are confirmed before ordering.</p>
        {product.sheet && (
          <a className="text-link" href={product.sheet} target="_blank" rel="noopener noreferrer">
            Open original catalogue sheet <ArrowUpRight size={15} />
          </a>
        )}
      </div>

      <div className="product-info">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="product-tagline">{product.subtitle}</p>

        <div className="detail-price">
          <strong>{formatCataloguePrice(product)}</strong>
          <span>
            {product.priceType === "starting"
              ? "Advertised starting price · Final quote required"
              : product.cataloguePrice
              ? "As listed in the supplied catalogue"
              : "Quoted according to customisation"}
          </span>
        </div>

        {reviewCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0", color: "#6a7b63" }}>
            <span style={{ display: "inline-flex", gap: "2px" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={15} fill={i < Math.round(avgRating) ? "#e2a93b" : "none"} color="#e2a93b" />
              ))}
            </span>
            <small style={{ fontWeight: 600 }}>{avgRating} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</small>
          </div>
        )}

        <div className="quote-detail-note">
          <PenLine size={20} />
          <p>
            <strong>Made for you, from 10 gifts.</strong><br />
            Your final quote confirms availability, branding, tax and delivery. No online checkout.
          </p>
        </div>

        <form action="/corporate#enquiry" className="quote-product-form" onSubmit={validateQuantity}>
          <input type="hidden" name="product" value={product.id} />
          {occasion && <input type="hidden" name="occasion" value={occasion} />}
          {quoteContext.collection && <input type="hidden" name="collection" value={quoteContext.collection} />}
          {quoteContext.recipient && <input type="hidden" name="recipient" value={quoteContext.recipient} />}
          <label>
            Quantity for your quote
            <input
              type="number"
              name="quantity"
              min={10}
              max={100000}
              step={1}
              value={quantity}
              onChange={(event) => { setQuantity(event.target.value); setError(""); }}
              required
            />
          </label>
          <button className="button button-primary">Request a quote <ArrowUpRight size={18} /></button>
          <button
            type="button"
            className="button button-outline detail-wishlist save-gift"
            aria-label={saved ? "Saved gift. Remove from wishlist" : "Save gift to wishlist"}
            aria-pressed={saved}
            onClick={() => toggleWishlist(product.id)}
          >
            <Heart size={20} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save gift"}
          </button>
        </form>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="product-accordions">
          <details><summary>About this gift</summary><p>{product.description}</p></details>
          {product.contents && (
            <details open>
              <summary>Inside the hamper</summary>
              <ul>
                {product.contents.map((item) => (
                  <li key={item}><Check size={14} />{item}</li>
                ))}
              </ul>
            </details>
          )}
          <details open={!product.contents}>
            <summary>Make it yours</summary>
            <p>
              {product.personalizable
                ? "Discuss company branding, names, messages and presentation with our team. Artwork and customisation are approved before production."
                : "Include this item in a bespoke hamper and discuss the available finishes and presentation with our team."} No personalisation fee is assumed.
            </p>
          </details>
          <details>
            <summary>Pricing & delivery</summary>
            <p>
              {product.priceType === "starting"
                ? "This is the starting price advertised on the supplied poster, not a fixed final price. "
                : product.cataloguePrice
                ? "The displayed price is transcribed from the supplied product sheet. "
                : "A fixed price was not supplied for this item. "}
              Quantity, exact contents, taxes, branding and delivery are confirmed in writing. No online payment is collected here. <Link href="/policies/shipping">Delivery information</Link>.
            </p>
          </details>

          {/* Database-backed Reviews Accordion */}
          <details>
            <summary>Customer Reviews ({reviews.length})</summary>
            <div style={{ marginTop: "1rem" }}>
              {reviews.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                  {reviews.map((rev) => (
                    <div key={rev._id} style={{ borderBottom: "1px solid #e5e0d8", paddingBottom: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>{rev.userName}</strong>
                        <span style={{ display: "inline-flex", gap: "1px" }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={13} fill={i < rev.rating ? "#e2a93b" : "none"} color="#e2a93b" />
                          ))}
                        </span>
                      </div>
                      {rev.title && <p style={{ fontWeight: 600, fontSize: "0.95rem", margin: "0.2rem 0" }}>{rev.title}</p>}
                      <p style={{ margin: "0.2rem 0", fontSize: "0.9rem" }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontStyle: "italic", color: "#666", marginBottom: "1rem" }}>No reviews yet. Be the first to share your experience!</p>
              )}

              {/* Review Form */}
              <form onSubmit={handleReviewSubmit} style={{ background: "#fbf8f5", padding: "1rem", borderRadius: "8px", border: "1px solid #eadecf" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Share your review</h4>
                {reviewNotice && <p className="notice" style={{ margin: "0.5rem 0" }}>{reviewNotice}</p>}
                <div style={{ display: "grid", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem" }}>
                    Rating:
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      style={{ marginLeft: "0.5rem", padding: "0.2rem 0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                      <option value={5}>5 Stars - Exceptional</option>
                      <option value={4}>4 Stars - Very Good</option>
                      <option value={3}>3 Stars - Good</option>
                      <option value={2}>2 Stars - Fair</option>
                      <option value={1}>1 Star - Poor</option>
                    </select>
                  </label>
                  <input
                    placeholder="Your name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    style={{ padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                  <input
                    placeholder="Review headline (optional)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    style={{ padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                  <textarea
                    placeholder="Tell us about the presentation, packaging, and gifting moment..."
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    style={{ padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="button button-outline"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </details>
        </div>

        <div className="bulk-note">
          Building a bespoke collection? <Link href={quoteHref(quoteContext)}>Share your complete gifting brief <ArrowUpRight size={14} /></Link>
        </div>
      </div>
    </div>
  );
}
