/**
 * Simple Bar Chart Component
 *
 * Displays data as a vertical bar chart
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BarChartProps {
  title: string
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  loading?: boolean
}

export function BarChart({ title, data, loading = false }: BarChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded bg-gray-100" />
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-end justify-around gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-full w-full items-end justify-center">
                <div
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || '#3b82f6',
                    minHeight: item.value > 0 ? '4px' : '0',
                  }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium">{item.value}</div>
                <div className="text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
