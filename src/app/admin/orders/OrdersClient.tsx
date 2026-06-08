"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTable, StatusBadge, type Column } from "@/modules/admin/shared/components/DataTable";
import { TableSearch, TablePagination } from "@/modules/admin/shared/components/DataTableControls";
import { formatINR, formatDate } from "@/lib/format";
import { Suspense } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useDragScroll } from "@/lib/useDragScroll";

const standardOrder = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

const getAllowedTransitions = (currentStatus: string) => {
  if (currentStatus === "REFUNDED") return [];
  if (currentStatus === "CANCELLED") return [];
  if (currentStatus === "RETURN_REQUESTED") return [
    { label: "Approve Return", value: "RETURNED" },
    { label: "Reject Return (Back to Delivered)", value: "DELIVERED" },
  ];
  if (currentStatus === "RETURNED") return [{ label: "Refunded", value: "REFUNDED" }];

  const curIdx = standardOrder.indexOf(currentStatus);
  if (curIdx === -1) return [];

  const allowed = [];

  const standardStages = [
    { label: "Placed", value: "PLACED" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Packed", value: "PACKED" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
  ];

  for (let i = curIdx + 1; i < standardStages.length; i++) {
    allowed.push(standardStages[i]);
  }

  if (currentStatus !== "DELIVERED") {
    allowed.push({ label: "Cancelled", value: "CANCELLED" });
  }

  return allowed;
};

const ALL_STAGES = [
  { label: "Placed", value: "PLACED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Packed", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Return Requested", value: "RETURN_REQUESTED" },
  { label: "Returned", value: "RETURNED" },
  { label: "Refunded", value: "REFUNDED" },
];

export function OrdersClient({ orders, totalItems, statusCounts = {} }: { orders: any[]; totalItems: number; statusCounts?: Record<string, number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeStatus = searchParams.get("status") || "ALL";
  const dragScroll = useDragScroll();

  const handleTabClick = (statusVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (statusVal === "ALL") {
      params.delete("status");
    } else {
      params.set("status", statusVal);
    }
    params.delete("page"); // Reset page when filtering
    router.push(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    { label: "All Orders", value: "ALL" },
    { label: "Placed", value: "PLACED" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Packed", value: "PACKED" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Return Requested", value: "RETURN_REQUESTED" },
    { label: "Returned", value: "RETURNED" },
    { label: "Refunded", value: "REFUNDED" },
  ];

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [status, setStatus] = useState("PLACED");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [refundMethod, setRefundMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [refundTransactionId, setRefundTransactionId] = useState("");
  const [codPaymentReceived, setCodPaymentReceived] = useState(false);

  const handleOpenUpdateModal = (o: any) => {
    setSelectedOrder(o);
    const currentStatus = o.status || "PLACED";
    setStatus(currentStatus);
    setNote("");
    setRefundMethod("ONLINE");
    setRefundTransactionId("");
    setCodPaymentReceived(false);
    setIsOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (status === "REFUNDED" && refundMethod === "ONLINE" && !refundTransactionId.trim()) {
      toast.error("Refund Transaction ID is required for online refunds.");
      return;
    }

    if (status === "DELIVERED" && selectedOrder.paymentMethod === "COD" && !codPaymentReceived) {
      toast.error("Confirmation of payment received is required for Cash on Delivery orders.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          status,
          note,
          refundMethod: status === "REFUNDED" ? refundMethod : undefined,
          refundTransactionId: status === "REFUNDED" ? refundTransactionId : undefined,
          codPaymentReceived: (status === "DELIVERED" && selectedOrder.paymentMethod === "COD") ? codPaymentReceived : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order status");

      toast.success("Order status updated successfully!");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const cols: Column<any>[] = [
    { key: "n", header: "Order", sortKey: "orderId", render: o => <span className="font-semibold text-sm">{o.orderId}</span> },
    { key: "c", header: "Customer", render: o => <span className="text-sm">{o.customerName}</span> },
    { key: "i", header: "Items", render: o => <span className="text-sm">{o.itemCount}</span> },
    { key: "p", header: "Payment", sortKey: "payment", render: o => <span className="text-sm uppercase text-xs">{o.paymentMethod}</span> },
    { key: "d", header: "Date", sortKey: "createdAt", render: o => <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span> },
    { key: "s", header: "Status", sortKey: "status", render: o => <StatusBadge status={o.status} /> },
    { key: "t", header: "Total", sortKey: "total", render: o => <span className="font-semibold">{formatINR(o.total)}</span>, className: "text-right" },
    {
      key: "actions",
      header: "Actions",
      render: o => (
        <button
          onClick={() => handleOpenUpdateModal(o)}
          className="text-xs bg-primary text-primary-foreground hover:bg-primary/95 px-3 py-1.5 rounded-full font-semibold cursor-pointer transition shadow-sm"
        >
          Update Status
        </button>
      )
    }
  ];

  const allowedNext = selectedOrder ? getAllowedTransitions(selectedOrder.status) : [];

  return (
    <div className="space-y-4 relative">
      <div 
        ref={dragScroll.ref}
        onMouseDown={dragScroll.onMouseDown}
        onMouseLeave={dragScroll.onMouseLeave}
        onMouseUp={dragScroll.onMouseUp}
        onMouseMove={dragScroll.onMouseMove}
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }}
        style={dragScroll.style}
        className="flex border-b border-border overflow-x-auto scrollbar-hide gap-2 pb-px"
      >
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.value;
          const count = statusCounts[tab.value] || 0;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap -mb-px cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Suspense fallback={null}>
          <TableSearch placeholder="Search order number..." />
        </Suspense>
      </div>
      <div>
        <DataTable columns={cols} rows={orders} empty="No orders found." />
        <Suspense fallback={null}>
          <TablePagination totalItems={totalItems} itemsPerPage={10} />
        </Suspense>
      </div>

      {/* Modal Dialog */}
      {isOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/20">
              <div>
                <h3 className="font-serif text-lg font-bold">Update Order Status</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Order ID: {selectedOrder.orderId}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
              {allowedNext.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs font-semibold leading-relaxed">
                  This order is in the final "{selectedOrder.status.toLowerCase().replace(/_/g, " ")}" stage and no further transition steps are allowed.
                </div>
              ) : (
                <>
                  <div className="bg-muted/30 border border-border rounded-xl p-3 flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted-foreground uppercase tracking-wider">Current Status</span>
                    <span className="capitalize text-foreground font-bold">{selectedOrder.status.toLowerCase().replace(/_/g, " ")}</span>
                  </div>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Lifecycle Stage *</span>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition font-medium"
                    >
                      {ALL_STAGES.map(opt => {
                        const isAllowed = allowedNext.some((x: any) => x.value === opt.value);
                        return (
                          <option key={opt.value} value={opt.value} disabled={!isAllowed}>
                            {opt.label} {!isAllowed ? "(Locked)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  {status === "REFUNDED" && (
                    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-4">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-primary">Refund Details</h4>
                      
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Refund Method *</span>
                        <div className="flex gap-4 mt-1">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name="refundMethod"
                              value="ONLINE"
                              checked={refundMethod === "ONLINE"}
                              onChange={() => setRefundMethod("ONLINE")}
                              className="accent-primary"
                            />
                            <span>Online (Razorpay / UPI)</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name="refundMethod"
                              value="CASH"
                              checked={refundMethod === "CASH"}
                              onChange={() => setRefundMethod("CASH")}
                              className="accent-primary"
                            />
                            <span>Cash / Offline</span>
                          </label>
                        </div>
                      </div>

                      {refundMethod === "ONLINE" && (
                        <label className="block">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Refund Transaction ID *</span>
                          <input
                            type="text"
                            value={refundTransactionId}
                            onChange={e => setRefundTransactionId(e.target.value)}
                            placeholder="Enter Razorpay Refund / UPI transaction ID"
                            required
                            className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {status === "DELIVERED" && selectedOrder.paymentMethod === "COD" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-amber-800 flex items-center gap-1.5">
                        ⚠️ Payment Verification Required
                      </h4>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        This is a Cash on Delivery (COD) order. Before updating to Delivered, please verify that you have collected the total payment amount from the customer.
                      </p>
                      <label className="flex items-start gap-2.5 text-xs font-semibold text-amber-900 cursor-pointer select-none border-t border-amber-200/50 pt-2.5 mt-1">
                        <input
                          type="checkbox"
                          checked={codPaymentReceived}
                          onChange={e => setCodPaymentReceived(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-amber-800 rounded"
                        />
                        <span>I confirm that the cash payment of <strong className="font-bold">{formatINR(selectedOrder.total)}</strong> has been collected and received in full.</span>
                      </label>
                    </div>
                  )}

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking Note / Logs</span>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder={status === "REFUNDED" ? "e.g. Refunded via payment gateway. Reaches in 5-7 days." : "e.g. Shipped via Delhivery. Tracking ID: DLV-12345"}
                      rows={3}
                      className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </label>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-border mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-background border border-input text-foreground hover:bg-muted rounded-full px-5 py-2 text-sm font-semibold cursor-pointer transition"
                >
                  Close
                </button>
                {allowedNext.length > 0 && (
                  <button
                    type="submit"
                    disabled={
                      saving || 
                      status === selectedOrder.status || 
                      (status === "DELIVERED" && selectedOrder.paymentMethod === "COD" && !codPaymentReceived)
                    }
                    className="bg-primary text-primary-foreground hover:bg-primary/95 rounded-full px-6 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50 transition shadow"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

