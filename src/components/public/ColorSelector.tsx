interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

export function ColorSelector({ colors, selectedColor, onSelect }: ColorSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold mb-2">
        Color: <span className="font-normal text-muted-foreground">{selectedColor}</span>
      </p>
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`px-4 py-2 rounded-full border-2 text-xs font-medium transition ${
              selectedColor === c ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
