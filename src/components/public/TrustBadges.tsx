import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export function TrustBadges() {
  const items = [
    { icon: Truck, label: "Free shipping" },
    { icon: RotateCcw, label: "30-day returns" },
    { icon: ShieldCheck, label: "1-yr warranty" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 pt-4">
      {items.map(({ icon: Icon, label }, i) => (
        <div key={i} className="bg-muted/40 rounded-lg p-3 text-center">
          <Icon className="h-4 w-4 mx-auto text-cognac" />
          <p className="text-[11px] mt-1 font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
}
