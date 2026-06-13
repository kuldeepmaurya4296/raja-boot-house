"use client";

import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useSettings } from "@/lib/settings-context";

// Shared and sub-components
import { OrderSummary } from "@/components/shared/OrderSummary";
import { CheckoutStepsHeader } from "@/modules/checkout/components/CheckoutStepsHeader";
import { OrderConfirmation } from "@/modules/orders/components/OrderConfirmation";
import { Input } from "@/components/shared/Input";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { lines, subtotal, clear } = useCart();
  const settings = useSettings();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Address State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // Stock validation state
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({});
  const [checkingStock, setCheckingStock] = useState(false);

  useEffect(() => {
    if (lines.length === 0) return;

    const checkStock = async () => {
      setCheckingStock(true);
      try {
        const errors: Record<string, string> = {};
        for (const line of lines) {
          const res = await fetch(`/api/products/${line.productId}`);
          if (res.ok) {
            const product = await res.json();
            const variant = product.variants?.find((v: any) => v.size === line.size && v.color === line.color);
            const key = `${line.productId}-${line.size}-${line.color}`;
            if (!variant) {
              errors[key] = "Variant unavailable";
            } else if (variant.stock === 0) {
              errors[key] = "Out of Stock";
            } else if (variant.stock < line.quantity) {
              errors[key] = `Only ${variant.stock} left in stock`;
            }
          }
        }
        setStockErrors(errors);
      } catch (err) {
        console.error("Failed to validate stock:", err);
      } finally {
        setCheckingStock(false);
      }
    };

    checkStock();
  }, [lines]);

  useEffect(() => {
    if (!session?.user?.id) {
      setFullName("");
      setPhone("");
      setLine1("");
      setLine2("");
      setCity("");
      setState("");
      setZip("");
      return;
    }

    fetch("/api/user/addresses")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSavedAddresses(data);
          const def = data.find(a => a.isDefault);
          if (def) {
            setSelectedAddressId(def._id);
            setFullName(def.fullName || "");
            setPhone(def.phone || "");
            setLine1(def.line1 || "");
            setLine2(def.line2 || "");
            setCity(def.city || "");
            setState(def.state || "");
            setZip(def.pin || "");
          } else if (data.length > 0) {
            setSelectedAddressId(data[0]._id);
            setFullName(data[0].fullName || "");
            setPhone(data[0].phone || "");
            setLine1(data[0].line1 || "");
            setLine2(data[0].line2 || "");
            setCity(data[0].city || "");
            setState(data[0].state || "");
            setZip(data[0].pin || "");
          } else {
            setFullName(session.user.name || "");
          }
        }
      })
      .catch(console.error);
  }, [session?.user?.id, session?.user?.name]);

  const handleSelectAddress = (addr: any) => {
    if (addr === "new") {
      setSelectedAddressId("new");
      setFullName("");
      setPhone("");
      setLine1("");
      setLine2("");
      setCity("");
      setState("");
      setZip("");
    } else {
      setSelectedAddressId(addr._id);
      setFullName(addr.fullName || "");
      setPhone(addr.phone || "");
      setLine1(addr.line1 || "");
      setLine2(addr.line2 || "");
      setCity(addr.city || "");
      setState(addr.state || "");
      setZip(addr.pin || "");
    }
  };

  // Shipping State
  const [shippingMethod, setShippingMethod] = useState("Standard");
  const [shippingCost, setShippingCost] = useState(0);

  // Update default shipping method once settings are loaded
  useEffect(() => {
    if (settings?.shippingMethods?.length > 0) {
      const firstMethod = settings.shippingMethods[0];
      setShippingMethod(firstMethod.name);
      setShippingCost(firstMethod.price);
    }
  }, [settings]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"Online" | "COD">("Online");

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartValue: subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        setCouponApplied(true);
        setCouponMessage(data.message);
        let discount = 0;
        if (data.type === "percent") {
          discount = Math.round(subtotal * (data.value / 100));
        } else if (data.type === "fixed") {
          discount = data.value;
        }
        setCouponDiscount(discount);
        toast.success("Coupon applied successfully!");
      } else {
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponMessage(data.message || "Invalid coupon code");
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (err) {
      toast.error("Failed to validate coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode("");
    setCouponDiscount(0);
    setCouponMessage("");
    toast.info("Coupon removed");
  };

  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(taxableAmount * (settings.taxRate / 100));
  const total = Math.max(0, taxableAmount + shippingCost + tax);

  const handleShippingChange = (name: string, price: number) => {
    setShippingMethod(name);
    setShippingCost(price);
  };

  const handlePlaceOrder = async () => {
    if (loading) return;
    if (!fullName || !phone || !line1 || !city || !state || !zip) {
      toast.error("Please fill in all address details");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      // 1. Create order in our Database (in PENDING state)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id || null,
          items: lines.map(l => ({
            productId: l.productId,
            name: l.name,
            image: l.image,
            size: l.size,
            color: l.color,
            price: l.price,
            qty: l.quantity,
          })),
          shippingAddress: {
            fullName,
            phone,
            line1,
            line2,
            city,
            state,
            pin: zip,
            country: "India",
          },
          pricing: {
            subtotal,
            shipping: shippingCost,
            couponDiscount,
            total,
          },
          coupon: couponApplied ? {
            code: couponCode,
            discountAmount: couponDiscount,
          } : undefined,
          payment: {
            method: paymentMethod === "COD" ? "COD" : "UPI",
            status: "PENDING",
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Order placement failed");
      }

      const localOrder = orderData.order;
      const orderId = localOrder?.orderId || `RBH-${Date.now()}`;

      // 2. Handle payment based on paymentMethod
      if (paymentMethod === "COD") {
        toast.success("Order placed successfully (Cash on Delivery)!");
        setPlacedOrderId(orderId);
        clear();
        setDone(true);
        return;
      }

      // Digital payment (UPI or Card) using Razorpay
      // 2A. Request Razorpay order from backend
      const rzpOrderRes = await fetch("/api/orders/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total, // Pass amount in INR directly (backend will convert to paise)
          receipt: orderId,
        }),
      });

      const rzpOrderData = await rzpOrderRes.json();
      if (!rzpOrderRes.ok) {
        throw new Error(rzpOrderData.error || "Failed to create Razorpay transaction");
      }

      // 2B. Trigger Razorpay checkout flow
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || rzpOrderData.key_id || "rzp_test_dummykey";

      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: razorpayKey,
          amount: rzpOrderData.amount,
          currency: rzpOrderData.currency || "INR",
          name: "Raja Boot House",
          description: "Order Checkout Payment",
          order_id: rzpOrderData.id,
          handler: async function (response: any) {
            setLoading(true);
            try {
              // Verify signature
              const verifyRes = await fetch("/api/orders/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                toast.success("Payment verified and order confirmed!");
                setPlacedOrderId(orderId);
                clear();
                setDone(true);
              } else {
                toast.error(verifyData.error || "Payment verification failed");
              }
            } catch (err: any) {
              toast.error(err.message || "Verification request failed");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: fullName,
            contact: phone,
            email: session?.user?.email || "customer@example.com",
          },
          theme: {
            color: "#1E3A5F",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Razorpay SDK missing fallback (sandbox/dev simulation)
        toast.info("Razorpay script not ready. Simulating payment success...");
        setTimeout(async () => {
          try {
            const verifyRes = await fetch("/api/orders/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: rzpOrderData.id,
                razorpay_payment_id: `pay_${Math.random().toString(36).substring(7)}`,
                razorpay_signature: "simulated_signature",
                orderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success("Payment simulated successfully! Order confirmed.");
              setPlacedOrderId(orderId);
              clear();
              setDone(true);
            } else {
              toast.error("Failed to verify simulated payment");
            }
          } catch (err: any) {
            toast.error("Simulation verification request failed");
          } finally {
            setLoading(false);
          }
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during checkout");
      setLoading(false);
    }
  };

  if (lines.length === 0 && !done) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-muted-foreground mb-4">Your bag is empty.</p>
        <Link href="/shop" className="underline font-semibold text-primary">
          Shop now
        </Link>
      </div>
    );
  }

  if (done) {
    return <OrderConfirmation orderId={placedOrderId || undefined} />;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-2">Checkout</h1>

        {/* Wizard Steps Header */}
        <CheckoutStepsHeader step={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 md:p-8 space-y-5 shadow-sm">
            {step === 1 && (
              <>
                <h2 className="font-serif text-xl font-bold">Shipping address</h2>

                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Select a saved address
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {savedAddresses.map((a) => (
                        <div
                          key={a._id}
                          onClick={() => handleSelectAddress(a)}
                          className={`border rounded-xl p-4 cursor-pointer hover:border-primary transition ${selectedAddressId === a._id
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border bg-card"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-xs text-cognac uppercase tracking-wider">
                              {a.label}
                            </span>
                            {a.isDefault && (
                              <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-xs mb-0.5 text-foreground">{a.fullName}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pin}
                          </p>
                        </div>
                      ))}

                      <div
                        onClick={() => handleSelectAddress("new")}
                        className={`border border-dashed rounded-xl p-4 cursor-pointer hover:border-primary flex flex-col justify-center items-center text-center transition min-h-[96px] ${selectedAddressId === "new"
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border bg-card"
                          }`}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="font-semibold text-xs text-muted-foreground">Deliver to a new address</span>
                      </div>
                    </div>
                  </div>
                )}

                {savedAddresses.length > 0 && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                    {selectedAddressId === "new" ? "Enter address details" : "Confirm or edit details"}
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input label="Address line 1" value={line1} onChange={(e) => setLine1(e.target.value)} wide />
                  <Input label="Address line 2" value={line2} onChange={(e) => setLine2(e.target.value)} wide />
                  <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
                  <Input label="ZIP" value={zip} onChange={(e) => setZip(e.target.value)} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-serif text-xl font-bold">Shipping method</h2>
                <div className="space-y-2">
                  {settings.shippingMethods.map(({ name, desc, price }) => (
                    <label
                      key={name}
                      className="flex items-center justify-between border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="ship"
                          checked={shippingMethod === name}
                          onChange={() => handleShippingChange(name, price)}
                        />
                        <div>
                          <div className="font-semibold text-sm">{name}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                      </div>
                      <span className="font-semibold">{price === 0 ? "Free" : formatINR(price)}</span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-border pt-6 mt-6">
                  <h3 className="font-serif text-lg font-bold mb-3">Apply Coupon</h3>
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      placeholder="Enter coupon code (e.g. RAJA10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponApplied}
                      className="flex-1 px-4 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                    <button
                      type="button"
                      onClick={couponApplied ? handleRemoveCoupon : handleApplyCoupon}
                      className={`px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                        couponApplied
                          ? "bg-red-50 text-red-600 hover:bg-red-100/50"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {couponApplied ? "Remove" : "Apply"}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-xs mt-1.5 font-medium ${couponApplied ? "text-green-600 animate-in fade-in" : "text-destructive animate-in fade-in"}`}>
                      {couponMessage}
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="font-serif text-xl font-bold">Payment</h2>
                <div className="space-y-2 mb-4">
                  {[
                    { key: "Online", name: "Pay Online (Card, UPI, Net Banking, Wallet)" },
                    { key: "COD", name: "Cash on delivery" },
                  ].map(({ key, name }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition"
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === key}
                        onChange={() => setPaymentMethod(key as any)}
                      />
                      <span className="font-semibold text-sm">{name}</span>
                    </label>
                  ))}
                </div>
                {paymentMethod !== "COD" && (
                  <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground">
                    Secured payment via Razorpay. Supported options include Card, Net Banking, and instant UPI.
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-4 border-t border-border mt-6">
              <button
                disabled={step === 1 || loading}
                onClick={() => setStep(((step - 1) || 1) as 1 | 2 | 3)}
                className="text-sm font-semibold disabled:opacity-30 px-4 py-2 hover:bg-muted rounded-full transition cursor-pointer"
              >
                ← Back
              </button>

              <button
                disabled={loading || Object.keys(stockErrors).length > 0}
                onClick={() => {
                  if (Object.keys(stockErrors).length > 0) {
                    toast.error("Please remove out of stock items from your cart to proceed.");
                    return;
                  }
                  if (step === 1) {
                    if (!fullName.trim()) { toast.error("Full name is required"); return; }
                    if (!phone.trim()) { toast.error("Phone number is required"); return; }
                    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ""))) { toast.error("Enter a valid 10-digit Indian mobile number"); return; }
                    if (!line1.trim()) { toast.error("Address line 1 is required"); return; }
                    if (!city.trim()) { toast.error("City is required"); return; }
                    if (!state.trim()) { toast.error("State is required"); return; }
                    if (!zip.trim()) { toast.error("ZIP/PIN code is required"); return; }
                    if (!/^\d{6}$/.test(zip.trim())) { toast.error("Enter a valid 6-digit Indian PIN code"); return; }
                    setStep(2);
                  } else if (step === 2) {
                    setStep(3);
                  } else {
                    handlePlaceOrder();
                  }
                }}
                className="bg-primary text-primary-foreground rounded-full px-7 py-3 text-sm font-semibold hover:opacity-95 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? "Processing..." : step < 3 ? "Continue" : "Place order"}
              </button>
            </div>
          </div>
          <aside className="h-fit">
            <OrderSummary
              subtotal={subtotal}
              shipping={shippingCost}
              tax={tax}
              couponDiscount={couponDiscount}
              couponCode={couponCode}
              actionButton={
                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Items ({lines.length})
                  </p>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {lines.map(l => {
                      const key = `${l.productId}-${l.size}-${l.color}`;
                      const errorMsg = stockErrors[key];
                      return (
                        <div key={l.productId + l.size + l.color} className="flex gap-3 text-sm">
                          <img src={l.image} alt="" className="h-12 w-12 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium leading-tight truncate">{l.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">×{l.quantity} · {l.size}</div>
                            {errorMsg && (
                              <div className="text-[10px] font-bold text-destructive mt-1 animate-pulse">
                                {errorMsg}
                              </div>
                            )}
                          </div>
                          <div className="font-semibold">{formatINR(l.price * l.quantity)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              }
            />
          </aside>
        </div>
      </div>
    </>
  );
}
