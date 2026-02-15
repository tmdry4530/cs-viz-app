"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  graphNodes,
  graphEdges,
  categories,
  type GraphNode,
  type Category,
} from "@/lib/cs-map-data"

const NODE_RADIUS = 28

export function KnowledgeGraph() {
  const router = useRouter()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const handleNodeClick = (node: GraphNode) => {
    if (node.moduleId) {
      router.push(`/session/${node.moduleId}`)
    }
  }

  const getCategoryColor = (category: string) => {
    return categories[category as Category]?.color ?? "hsl(0, 0%, 60%)"
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border/50 bg-card p-4">
      <svg
        viewBox="0 0 860 560"
        className="mx-auto h-auto w-full min-w-[600px]"
        role="img"
        aria-label="CS 선행지식 그래프"
      >
        {/* Edges */}
        {graphEdges.map((edge) => {
          const from = graphNodes.find((n) => n.id === edge.from)
          const to = graphNodes.find((n) => n.id === edge.to)
          if (!from || !to) return null

          const isHighlighted =
            hoveredNode === edge.from || hoveredNode === edge.to

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeOpacity={isHighlighted ? 1 : 0.5}
              markerEnd="url(#arrowhead)"
            />
          )
        })}

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.5}
            />
          </marker>
        </defs>

        {/* Nodes */}
        {graphNodes.map((node) => {
          const isHovered = hoveredNode === node.id
          const hasModule = !!node.moduleId
          const color = getCategoryColor(node.category)

          return (
            <g
              key={node.id}
              className={hasModule ? "cursor-pointer" : "cursor-default"}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              role={hasModule ? "link" : undefined}
              tabIndex={hasModule ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hasModule) handleNodeClick(node)
              }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? NODE_RADIUS + 4 : NODE_RADIUS}
                fill={color}
                fillOpacity={isHovered ? 0.9 : hasModule ? 0.7 : 0.4}
                stroke={isHovered ? "hsl(var(--foreground))" : "transparent"}
                strokeWidth={2}
                className="transition-all duration-150"
              />
              {hasModule && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  strokeOpacity={0.5}
                />
              )}
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none select-none fill-foreground text-[11px] font-medium"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        {Object.entries(categories).map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color, opacity: 0.7 }}
            />
            <span>{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-dashed border-muted-foreground/50" />
          <span>모듈 연결됨</span>
        </div>
      </div>
    </div>
  )
}
