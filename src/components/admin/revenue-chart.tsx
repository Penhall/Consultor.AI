/**
 * Revenue Chart Component
 *
 * Simple SVG bar chart showing revenue over last 7 days.
 */

'use client';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  profit: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sem dados de receita disponíveis
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const chartHeight = 160;
  const barWidth = Math.min(40, (100 / data.length) * 0.6);
  const gap = (100 - barWidth * data.length) / (data.length + 1);

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-sm font-medium text-muted-foreground">Receita dos últimos 7 dias</h3>

      <svg viewBox={`0 0 400 ${chartHeight + 30}`} className="mt-4 w-full">
        {data.map((point, i) => {
          const barHeight = (point.revenue / maxRevenue) * chartHeight;
          const x = ((gap + barWidth) * i + gap) * 4;
          const y = chartHeight - barHeight;

          return (
            <g key={point.date}>
              <rect
                x={x}
                y={y}
                width={barWidth * 4}
                height={barHeight}
                rx={4}
                className="fill-primary/80"
              />
              <text
                x={x + (barWidth * 4) / 2}
                y={chartHeight + 16}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {new Date(point.date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
