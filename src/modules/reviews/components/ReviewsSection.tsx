"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Star, MessageSquarePlus, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Review } from "@/data/reviews";

interface ReviewsSectionProps {
  reviews: Review[];
  productId: string;
}

export function ReviewsSection({ reviews, productId }: ReviewsSectionProps) {
  const { data: session, status } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter your review comment.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit review.");
        return;
      }

      toast.success("Review submitted! It will appear once approved by moderator.");
      setSubmitted(true);
      setTitle("");
      setComment("");
      setRating(5);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1.5">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = interactive
            ? starValue <= (hoverRating ?? rating)
            : starValue <= count;

          return (
            <Star
              key={i}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              onClick={() => interactive && setRating(starValue)}
              className={`h-5 w-5 transition-all duration-150 ${
                interactive ? "cursor-pointer hover:scale-110" : "h-3.5 w-3.5"
              } ${
                isFilled
                  ? "fill-brass text-brass"
                  : "text-muted hover:text-brass/75"
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section className="mt-16 md:mt-24 max-w-3xl">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">Customer Reviews</h2>
        {status === "authenticated" && !submitted && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-border text-xs font-semibold hover:bg-muted transition cursor-pointer"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            {showForm ? "Cancel" : "Write a review"}
          </button>
        )}
      </div>

      {/* Auth Prompt / Info */}
      {status !== "authenticated" && (
        <div className="bg-card border border-border rounded-xl p-5 text-center mb-8 shadow-sm">
          <p className="text-sm text-muted-foreground mb-3">Have you purchased this product? Sign in to share your thoughts.</p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`}
            className="inline-block bg-primary text-primary-foreground px-5 py-2 rounded-full text-xs font-semibold hover:bg-primary/95 transition"
          >
            Sign In to Review
          </Link>
        </div>
      )}

      {/* Review Submission Form */}
      {showForm && !submitted && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 mb-8 space-y-4.5 shadow-sm">
          <h3 className="font-serif font-bold text-base">Write a Review</h3>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Overall Rating <span className="text-destructive">*</span>
            </label>
            {renderStars(rating, true)}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Review Title <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Summarize your experience (e.g. Extremely comfortable, Great fit!)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Review Details <span className="text-destructive">*</span>
            </label>
            <textarea
              placeholder="What did you like or dislike? How was the size and quality?"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4.5 py-2 text-xs rounded-full border border-border hover:bg-muted font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5.5 py-2.5 text-xs rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Review Submitted Banner */}
      {submitted && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-8 flex items-start gap-3.5 shadow-sm">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-800">Thank You for Your Feedback!</h4>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
              Your review was submitted successfully. To keep our community safe and high quality, all reviews require admin approval before going public. It should appear online shortly.
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-5">
        {reviews.length === 0 && (
          <p className="text-muted-foreground text-sm italic py-4">No reviews yet for this style. Be the first to write one!</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  <span>{r.userName}</span>
                  {r.verified && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/50">
                      ✓ Verified Purchase
                    </span>
                  )}
                </p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating ? "fill-brass text-brass" : "text-muted/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{r.createdAt}</span>
            </div>
            {r.title && <h4 className="mt-3.5 font-semibold text-sm text-charcoal">{r.title}</h4>}
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
