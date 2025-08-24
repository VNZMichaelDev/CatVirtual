"use client"

import { cn } from "@/lib/utils"

interface PetStatusBarProps {
  label: string
  value: number
  maxValue: number
  icon: string
  color: "primary" | "secondary"
  className?: string
}

export function PetStatusBar({ label, value, maxValue, icon, color, className }: PetStatusBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100))

  const getBarColor = () => {
    if (color === "primary") {
      if (percentage > 60) return "bg-gradient-to-r from-pink-400 to-pink-500"
      if (percentage > 30) return "bg-gradient-to-r from-yellow-400 to-orange-400"
      return "bg-gradient-to-r from-red-400 to-red-500"
    } else {
      if (percentage > 60) return "bg-gradient-to-r from-orange-400 to-orange-500"
      if (percentage > 30) return "bg-gradient-to-r from-yellow-400 to-orange-400"
      return "bg-gradient-to-r from-red-400 to-red-500"
    }
  }

  const getStatusText = () => {
    if (percentage > 80) return "¡Perfecto!"
    if (percentage > 60) return "Bien"
    if (percentage > 40) return "Regular"
    if (percentage > 20) return "Mal"
    return "¡Crítico!"
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-gray-700">{label}</span>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getStatusText()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className={cn("h-full transition-all duration-700 ease-out rounded-full", getBarColor())}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-2 text-center font-medium">
            {Math.round(value)}/{maxValue}
          </div>
        </div>
      </div>
    </div>
  )
}
