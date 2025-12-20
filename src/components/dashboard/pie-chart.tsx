/**
 * Simple Pie Chart Component
 *
 * Displays data as a pie/donut chart
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PieChartProps {
  title: string
  data: Array<{
    label: string
    value: number
    color: string
  }>
  loading?: boolean
}

export function PieChart({ title, data, loading = false }: PieChartProps) {
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

  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  let currentAngle = 0

  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    currentAngle += angle

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
    }
  })

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(' ')
  }

  const centerX = 100
  const centerY = 100
  const radius = 80
  const innerRadius = 50

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <svg
            viewBox="0 0 200 200"
            className="h-64 w-64"
          >
            {slices.map((slice, index) => {
              if (slice.value === 0) return null

              const outerPath = describeArc(
                centerX,
                centerY,
                radius,
                slice.startAngle,
                slice.endAngle
              )
              const innerPath = describeArc(
                centerX,
                centerY,
                innerRadius,
                slice.endAngle,
                slice.startAngle
              )

              return (
                <g key={index}>
                  <path
                    d={`${outerPath} L ${innerPath.split(' ').slice(1).join(' ')} Z`}
                    fill={slice.color}
                    className="transition-opacity hover:opacity-80"
                  >
                    <title>
                      {slice.label}: {slice.value} ({slice.percentage.toFixed(1)}%)
                    </title>
                  </path>
                </g>
              )
            })}
          </svg>

          <div className="flex flex-col gap-2">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="text-sm">
                  <span className="font-medium">{slice.label}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    ({slice.value} - {slice.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
