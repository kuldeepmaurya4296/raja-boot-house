import { Star } from "lucide-react";
import type { Review } from "@/data/reviews";

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <section className="mt-16 md:mt-24 max-w-3xl">
      <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">What customers say</h2>
      <div className="space-y-5">
        {reviews.length === 0 && <p className="text-muted-foreground text-sm">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">
                  {r.userName}
                  {r.verified && (
                    <span className="text-[10px] text-emerald-700 ml-1 font-normal bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </p>
                <div className="flex mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating ? "fill-brass text-brass" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{r.createdAt}</span>
            </div>
            <h4 className="mt-3 font-semibold text-sm">{r.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
