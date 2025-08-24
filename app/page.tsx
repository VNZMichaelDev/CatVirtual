"use client"

import { usePetState } from "@/hooks/use-pet-state"
import { PetStatusBar } from "@/components/pet-status-bar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function TamagotchiPage() {
  const { petState, feedPet, petCat, resetPet, isLoading, user } = usePetState()
  const [catImage, setCatImage] = useState("/images/normal.png")
  const [isFeeding, setIsFeeding] = useState(false)
  const [isPetting, setIsPetting] = useState(false)

  useEffect(() => {
    if (!petState.isAlive) {
      setCatImage("/images/hambre.png")
    } else if (isPetting) {
      setCatImage("/images/caricia.png")
    } else if (petState.hunger < 30) {
      setCatImage("/images/hambre.png")
    } else if (petState.hunger > 80 && petState.happiness > 80) {
      setCatImage("/images/feliz-acostado.png")
    } else if (petState.happiness > 70) {
      setCatImage("/images/feliz.png")
    } else {
      setCatImage("/images/normal.png")
    }
  }, [petState.hunger, petState.happiness, petState.isAlive, isPetting])

  const handleFeed = () => {
    setIsFeeding(true)
    feedPet()
    setTimeout(() => setIsFeeding(false), 1000)
  }

  const handlePet = () => {
    setIsPetting(true)
    petCat()
    setTimeout(() => setIsPetting(false), 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600">Cargando a Anlo...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-3 sm:p-4 relative"
      style={{
        backgroundImage: "url('/images/fondo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>

      <div className="relative z-10 max-w-sm mx-auto space-y-4 sm:space-y-6">
        <div className="text-center space-y-2 sm:space-y-3">
          <p className="text-gray-800 text-lg sm:text-xl font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            Cuida a Anlo
          </p>
          {!user && (
            <p className="text-xs text-gray-600 bg-yellow-100/80 px-3 py-1 rounded-full">
              💡 Inicia sesión para sincronizar en todos tus dispositivos
            </p>
          )}
        </div>

        <Card className="p-4 sm:p-8 text-center space-y-4 sm:space-y-6 bg-white/90 backdrop-blur-md border-2 border-pink-200 shadow-2xl rounded-3xl">
          <div className="relative">
            <div
              className={`transition-all duration-500 ${
                isFeeding ? "animate-bounce" : isPetting ? "animate-pulse scale-110" : ""
              }`}
            >
              <Image
                src={catImage || "/placeholder.svg"}
                alt="Anlo - Tu gatito virtual"
                width={200}
                height={200}
                className="mx-auto drop-shadow-2xl sm:w-[220px] sm:h-[220px]"
                priority
              />
            </div>
            {isFeeding && (
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 animate-bounce">
                <Image
                  src="/images/comida.png"
                  alt="Comida"
                  width={50}
                  height={50}
                  className="drop-shadow-lg sm:w-[70px] sm:h-[70px]"
                />
              </div>
            )}
            {isPetting && (
              <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 text-3xl sm:text-4xl animate-pulse">💕</div>
            )}
          </div>

          {!petState.isAlive && (
            <div className="text-center space-y-3 bg-red-50/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border-2 border-red-200">
              <p className="text-red-600 font-semibold text-base sm:text-lg">¡Anlo necesita cuidados urgentes!</p>
              <Button
                onClick={resetPet}
                className="bg-red-500 hover:bg-red-600 text-white px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                💖 Revivir a Anlo
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white/90 backdrop-blur-md border-2 border-pink-200 shadow-xl rounded-3xl">
          <PetStatusBar label="Hambre" value={petState.hunger} maxValue={100} icon="🍽️" color="secondary" />
          <PetStatusBar label="Felicidad" value={petState.happiness} maxValue={100} icon="💖" color="primary" />
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          <Button
            onClick={handleFeed}
            disabled={!petState.isAlive || petState.hunger >= 95}
            className="h-18 sm:h-22 text-base sm:text-lg bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-2xl shadow-xl border-0 disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
                <Image src="/images/comida.png" alt="Comida" fill className="object-contain" />
              </div>
              <span className="text-sm sm:text-base font-semibold">Alimentar</span>
            </div>
          </Button>
          <Button
            onClick={handlePet}
            disabled={!petState.isAlive || petState.happiness >= 95}
            className="h-18 sm:h-22 text-base sm:text-lg bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white rounded-2xl shadow-xl border-0 disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl sm:text-3xl">🐾</span>
              <span className="text-sm sm:text-base font-semibold">Acariciar</span>
            </div>
          </Button>
        </div>

        <Card className="p-4 sm:p-5 bg-white/80 backdrop-blur-md border-2 border-purple-200 rounded-2xl shadow-lg">
          <div className="text-xs sm:text-sm text-gray-700 space-y-2">
            <div className="flex items-center gap-2">
              <span>💡</span>
              <span>Anlo pierde hambre y felicidad con el tiempo</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🍽️</span>
              <span>Aliméntalo cuando tenga hambre</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💖</span>
              <span>Acarícialo para mantenerlo feliz</span>
            </div>
            {user && (
              <div className="flex items-center gap-2 text-green-600">
                <span>☁️</span>
                <span>Sincronizado en todos tus dispositivos</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
