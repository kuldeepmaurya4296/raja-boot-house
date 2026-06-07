interface SalesChartProps {
  data?: number[];
  labels?: string[];
}

export function SalesChart({ 
  data = [42, 58, 51, 73, 65, 88, 79], 
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
}: SalesChartProps) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-gradient-to-t from-primary to-cognac rounded-t-md transition-all hover:opacity-85"
            style={{ height: `${(v / max) * 100}%` }}
          />
          <span className="text-[10px] text-muted-foreground">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
