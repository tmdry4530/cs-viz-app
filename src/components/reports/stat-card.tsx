"use client"

import { Card, CardContent } from "@/components/ui/card"
import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change?: number
  suffix?: string
}

export function StatCard({ icon: Icon, label, value, change, suffix }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">
              {value}
              {suffix && (
                <span className="ml-0.5 text-sm font-normal text-muted-foreground">
                  {suffix}
                </span>
              )}
            </p>
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-2">
            <span
              className={`text-xs font-medium ${
                change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change}% 지난달 대비
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
