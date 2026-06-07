interface CheckoutStepsHeaderProps {
  step: 1 | 2 | 3;
}

export function CheckoutStepsHeader({ step }: CheckoutStepsHeaderProps) {
  const steps = ["Address", "Shipping", "Payment"];
  return (
    <div className="flex gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`h-7 w-7 rounded-full grid place-items-center text-xs font-semibold ${
              i + 1 <= step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-sm ${i + 1 === step ? "font-semibold" : "text-muted-foreground"}`}>
            {s}
          </span>
          {i < steps.length - 1 && <span className="text-muted-foreground mx-2">·</span>}
        </div>
      ))}
    </div>
  );
}
