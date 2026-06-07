interface SizeSelectorProps {
  sizes: number[];
  selectedSize: number | null;
  onSelect: (size: number) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <p className="text-sm font-semibold">Size</p>
        <button className="text-xs underline">Size guide</button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={`h-12 rounded-lg border-2 text-sm font-semibold transition ${
              selectedSize === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-charcoal"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
