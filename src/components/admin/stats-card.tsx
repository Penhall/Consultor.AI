/**
 * Stats Card Component
 *
 * Displays a metric with value, delta indicator, and optional icon.
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  delta?: number;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, delta, icon }: StatsCardProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {delta !== undefined && (
          <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
