/**
 * Metric Card Component
 *
 * Displays a single metric with title, value, and optional trend
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
  }
  icon?: React.ReactNode
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
          {description && (
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-100" />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <span
              className={
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              }
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="ml-1 text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
