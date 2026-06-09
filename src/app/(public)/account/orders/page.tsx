"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/modules/admin/shared/components/DataTable";
import { formatINR, formatDate } from "@/lib/format";
import Link from "next/link";
import { ChevronDown, ChevronUp, X, RotateCcw, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const RETURN_REASONS = [
  "Size doesn't fit",
  "Defective / Damaged product",
  "Wrong item received",
  "Quality not as expected",
  "Changed my mind",
  "Other",
];

const getTimelineSteps = (order: any): string[] => {
  const history = order.statusHistory || [];
  const occurred = history.map((h: any) => h.status);
  
  const standardOrder = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStatus = order.status || "PLACED";
  const curIdx = standardOrder.indexOf(currentStatus);
  
  if (curIdx === -1) {
    return occurred;
  }
  
  const steps = [...occurred];
  for (let i = curIdx + 1; i < standardOrder.length; i++) {
    const futureStep = standardOrder[i];
    if (!steps.includes(futureStep)) {
      steps.push(futureStep);
    }
  }
  
  return steps;
};

/** Calculate return eligibility for an order */
function getReturnEligibility(order: any): { eligible: boolean; daysRemaining: number; maxReturnDays: number; daysElapsed: number } {
  if (order.status !== "DELIVERED") {
    return { eligible: false, daysRemaining: 0, maxReturnDays: 0, daysElapsed: 0 };
  }

  const deliveredStep = order.statusHistory?.find((h: any) => h.status === "DELIVERED");
  if (!deliveredStep) {
    return { eligible: false, daysRemaining: 0, maxReturnDays: 0, daysElapsed: 0 };
  }

  const deliveredAt = new Date(deliveredStep.timestamp);
  const diffTime = Math.abs(Date.now() - deliveredAt.getTime());
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const maxReturnDays = (order.items || []).reduce((max: number, item: any) => {
    const itemDays = typeof item.returnDays === "number" ? item.returnDays : 7;
    return itemDays > max ? itemDays : max;
  }, 0);

  const daysRemaining = Math.max(0, maxReturnDays - daysElapsed);
  const eligible = daysElapsed <= maxReturnDays && maxReturnDays > 0;

  return { eligible, daysRemaining, maxReturnDays, daysElapsed };
}

/* ─── Return Request Modal ─── */
function ReturnModal({
  order,
  daysRemaining,
  onClose,
  onSuccess,
}: {
  order: any;
  daysRemaining: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a return reason.");
      return;
    }
    setSubmitting(true);
    try {
      const note = `Return requested: ${reason}${details.trim() ? ` — ${details.trim()}` : ""}`;
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId, status: "RETURN_REQUESTED", note }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Return request failed.");
        return;
      }
      toast.success("Return request submitted! Our team will review it shortly.");
      onSuccess();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-orange-500/10 flex items-center justify-center">
              <RotateCcw className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base">Request Return</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Order {order.orderId}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Countdown notice */}
          <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              You have <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong> remaining to request a return. Your request will be reviewed by our team before approval.
            </p>
          </div>

          {/* Items preview */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items in this order</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {order.items.map((it: any, i: number) => (
                <div key={i} className="flex items-center gap-2.5">
                  <img src={it.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{it.name}</p>
                    <p className="text-[10px] text-muted-foreground">Size {it.size} · {it.color}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Reason for return <span className="text-destructive">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none cursor-pointer"
            >
              <option value="">Select a reason…</option>
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Additional details <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Describe the issue in more detail…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 pt-3 border-t border-border">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition font-medium cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="px-5 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                Submit Return Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [returnModalOrder, setReturnModalOrder] = useState<any>(null);
  const [returnModalDaysLeft, setReturnModalDaysLeft] = useState(0);

  const fetchOrders = useCallback(() => {
    if (!session?.user?.id) return;
    fetch(`/api/orders?userId=${session.user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const openReturnModal = (order: any, daysRemaining: number) => {
    setReturnModalOrder(order);
    setReturnModalDaysLeft(daysRemaining);
  };

  const closeReturnModal = () => {
    setReturnModalOrder(null);
    setReturnModalDaysLeft(0);
  };

  const handleReturnSuccess = () => {
    closeReturnModal();
    fetchOrders();
  };

  const handleCancelOrder = (orderId: string) => {
    toast("Are you sure you want to cancel this order? This cannot be undone.", {
      action: {
        label: "Cancel Order",
        onClick: async () => {
          try {
            const res = await fetch("/api/orders", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, status: "CANCELLED", note: "Cancelled by customer." })
            });
            const data = await res.json();
            if (res.ok) {
              toast.success("Order cancelled successfully!");
              fetchOrders();
            } else {
              toast.error(data.error || "Failed to cancel order");
            }
          } catch (err) {
            toast.error("An error occurred. Please try again.");
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <h2 className="font-serif text-2xl font-bold">My orders</h2>
        {[1, 2].map(i => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between pb-4 border-b border-border">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-3 w-32 bg-muted rounded"></div>
              </div>
              <div className="h-6 w-20 bg-muted rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted rounded"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold">My orders</h2>
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Link href="/shop" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold inline-block">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">My orders</h2>
      {orders.map(o => {
        const returnInfo = getReturnEligibility(o);

        return (
          <div key={o._id || o.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <p className="font-semibold text-sm sm:text-base">{o.orderId || o.number}</p>
                <p className="text-xs text-muted-foreground">Placed {formatDate(o.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <p className="font-serif font-bold text-sm sm:text-base">{formatINR(o.pricing?.total || o.total)}</p>
              </div>
            </div>
            <div className="pt-4 space-y-3">
              {o.items.map((it: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={it.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground">Size {it.size} · {it.color} · ×{it.quantity || it.qty}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap">{formatINR(it.price * (it.quantity || it.qty))}</p>
                </div>
              ))}
            </div>

            {/* Return Eligibility Section */}
            {o.status === "DELIVERED" && (
              <div className="mt-4 pt-3 border-t border-border">
                {returnInfo.eligible ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>
                        Return window: <strong className="text-foreground">{returnInfo.daysRemaining} day{returnInfo.daysRemaining !== 1 ? "s" : ""} remaining</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => openReturnModal(o, returnInfo.daysRemaining)}
                      className="text-xs font-semibold flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white transition cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Request Return
                    </button>
                  </div>
                ) : returnInfo.maxReturnDays > 0 ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span>Return window expired ({returnInfo.maxReturnDays}-day policy ended {returnInfo.daysElapsed - returnInfo.maxReturnDays} day{(returnInfo.daysElapsed - returnInfo.maxReturnDays) !== 1 ? "s" : ""} ago)</span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Return Request Pending Banner */}
            {o.status === "RETURN_REQUESTED" && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <Clock className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">Return Request Under Review</p>
                    <p className="text-[11px] text-yellow-700 dark:text-yellow-400 mt-0.5 leading-relaxed">
                      Your return request has been submitted and is being reviewed by our team. We'll update the status once it's processed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-border flex justify-between items-center gap-3">
              <div>
                {(o.status === "PLACED" || o.status === "CONFIRMED") && (
                  <button
                    onClick={() => handleCancelOrder(o.orderId)}
                    className="text-xs font-semibold px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              <button
                onClick={() => toggleExpand(o._id || o.id)}
                className="text-xs font-semibold flex items-center gap-1 hover:text-primary transition cursor-pointer text-muted-foreground border border-border px-3.5 py-1.5 rounded-full hover:bg-muted"
              >
                {expandedOrders[o._id || o.id] ? (
                  <>Hide Tracking <ChevronUp className="h-3 w-3" /></>
                ) : (
                  <>Track Order <ChevronDown className="h-3 w-3" /></>
                )}
              </button>
            </div>

            {/* Timeline Tracking Details */}
            {expandedOrders[o._id || o.id] && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-cognac">Order Tracking Timeline</h4>
                  <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                    Current Status: <span className="font-bold text-foreground capitalize">{o.status.toLowerCase().replace(/_/g, " ")}</span>
                  </span>
                </div>
                
                <div className="relative border-l border-border pl-6 ml-3 py-1 space-y-6">
                  {(() => {
                    const steps = getTimelineSteps(o);
                    return steps.map((step: string, idx: number) => {
                      const h = o.statusHistory?.find((x: any) => x.status === step);
                      const isCompleted = !!h;
                      const lastCompletedIdx = steps.reduce(
                        (acc: number, s: string, i: number) => o.statusHistory?.some((x: any) => x.status === s) ? i : acc,
                        0
                      );
                      const isActive = idx === lastCompletedIdx;
                      
                      return (
                        <div key={idx} className="relative">
                          {/* Bullet marker */}
                          <span className={`absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold shadow-sm ${
                            isCompleted
                              ? isActive 
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                                : "bg-muted text-muted-foreground"
                              : "bg-background border border-border text-muted-foreground/40"
                          }`}>
                            {isCompleted ? "✓" : idx + 1}
                          </span>
                          <div className={isCompleted ? "" : "opacity-50"}>
                            <p className={`text-sm font-semibold capitalize ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.toLowerCase().replace(/_/g, " ")}
                            </p>
                            {isCompleted && h ? (
                              <>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {new Date(h.timestamp).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                  })}
                                </p>
                                {h.note && (
                                  <p className="text-xs text-muted-foreground mt-1.5 bg-muted/70 p-2.5 rounded-lg border border-border/40 leading-relaxed">
                                    {h.note}
                                  </p>
                                )}
                                {step === "REFUNDED" && o.refundDetails && (
                                  <div className="text-xs mt-1.5 bg-primary/5 p-2.5 rounded-lg border border-primary/10 space-y-1">
                                    <p className="font-semibold text-primary">Refund Details:</p>
                                    <p className="text-muted-foreground">
                                      <span className="font-medium">Method:</span> {o.refundDetails.method === "ONLINE" ? "Online (Razorpay / UPI)" : "Cash / Offline"}
                                    </p>
                                    {o.refundDetails.transactionId && (
                                      <p className="text-muted-foreground">
                                        <span className="font-medium">Transaction ID:</span> <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] select-all">{o.refundDetails.transactionId}</code>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-[11px] text-muted-foreground/60 mt-0.5 italic">Pending</p>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Return Request Modal */}
      {returnModalOrder && (
        <ReturnModal
          order={returnModalOrder}
          daysRemaining={returnModalDaysLeft}
          onClose={closeReturnModal}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}

