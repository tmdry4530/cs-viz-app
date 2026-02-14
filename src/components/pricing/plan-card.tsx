"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ProBadge } from "@/components/pro-badge"

interface PlanFeature {
  text: string
  included: boolean
}

interface PlanCardProps {
  name: string
  price: string
  period: string
  description: string
  features: PlanFeature[]
  isPro?: boolean
  isCurrentPlan?: boolean
  children?: React.ReactNode
  className?: string
}

export function PlanCard({
  name,
  price,
  period,
  description,
  features,
  isPro = false,
  isCurrentPlan = false,
  children,
  className,
}: PlanCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col",
        isPro && "border-violet-500 shadow-lg shadow-violet-500/10",
        className
      )}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <ProBadge size="md" />
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground ml-1">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              {feature.included ? (
                <span className="text-green-500 shrink-0">&#10003;</span>
              ) : (
                <span className="text-muted-foreground/40 shrink-0">&#10007;</span>
              )}
              <span
                className={cn(
                  !feature.included && "text-muted-foreground/60"
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {isCurrentPlan && (
          <p className="text-sm text-muted-foreground">현재 사용 중인 플랜</p>
        )}
        {children}
      </CardFooter>
    </Card>
  )
}
