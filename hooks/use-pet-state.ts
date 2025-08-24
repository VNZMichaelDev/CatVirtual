"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface PetState {
  id?: string
  name: string
  hunger: number // 0-100, 0 = very hungry, 100 = full
  happiness: number // 0-100, 0 = sad, 100 = very happy
  lastFed: number
  lastPetted: number
  isAlive: boolean
}

const INITIAL_STATE: PetState = {
  name: "Anlo",
  hunger: 80,
  happiness: 80,
  lastFed: Date.now(),
  lastPetted: Date.now(),
  isAlive: true,
}

const HUNGER_DECAY_RATE = 1 // points per minute
const HAPPINESS_DECAY_RATE = 0.5 // points per minute
const FEED_AMOUNT = 25
const PET_AMOUNT = 20

export function usePetState() {
  const [petState, setPetState] = useState<PetState>(INITIAL_STATE)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadPetState = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (!user) {
          // Si no hay usuario, usar localStorage como fallback
          if (typeof window !== "undefined") {
            const saved = localStorage.getItem("tamagotchi-state")
            if (saved) {
              setPetState(JSON.parse(saved))
            }
          }
          setIsLoading(false)
          return
        }

        // Cargar desde Supabase
        const { data, error } = await supabase.from("pet_state").select("*").eq("user_id", user.id).single()

        if (error && error.code !== "PGRST116") {
          console.error("Error loading pet state:", error)
          setIsLoading(false)
          return
        }

        if (data) {
          setPetState({
            id: data.id,
            name: data.name,
            hunger: data.hunger,
            happiness: data.happiness,
            lastFed: new Date(data.last_fed).getTime(),
            lastPetted: new Date(data.last_petted).getTime(),
            isAlive: data.is_alive,
          })
        } else {
          // Crear nuevo estado para el usuario
          await createInitialPetState(user.id)
        }
      } catch (error) {
        console.error("Error in loadPetState:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPetState()
  }, [])

  const createInitialPetState = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("pet_state")
        .insert({
          user_id: userId,
          name: INITIAL_STATE.name,
          hunger: INITIAL_STATE.hunger,
          happiness: INITIAL_STATE.happiness,
          last_fed: new Date().toISOString(),
          last_petted: new Date().toISOString(),
          is_alive: INITIAL_STATE.isAlive,
        })
        .select()
        .single()

      if (error) throw error

      setPetState({
        id: data.id,
        name: data.name,
        hunger: data.hunger,
        happiness: data.happiness,
        lastFed: new Date(data.last_fed).getTime(),
        lastPetted: new Date(data.last_petted).getTime(),
        isAlive: data.is_alive,
      })
    } catch (error) {
      console.error("Error creating initial pet state:", error)
    }
  }

  const savePetState = useCallback(
    async (newState: PetState) => {
      if (!user || !newState.id) {
        // Fallback to localStorage if no user
        if (typeof window !== "undefined") {
          localStorage.setItem("tamagotchi-state", JSON.stringify(newState))
        }
        return
      }

      try {
        const { error } = await supabase
          .from("pet_state")
          .update({
            hunger: newState.hunger,
            happiness: newState.happiness,
            last_fed: new Date(newState.lastFed).toISOString(),
            last_petted: new Date(newState.lastPetted).toISOString(),
            is_alive: newState.isAlive,
          })
          .eq("id", newState.id)

        if (error) throw error
      } catch (error) {
        console.error("Error saving pet state:", error)
      }
    },
    [user, supabase],
  )

  // Update pet state based on time passage
  const updatePetState = useCallback(() => {
    setPetState((prev) => {
      const now = Date.now()
      const minutesSinceLastFed = (now - prev.lastFed) / (1000 * 60)
      const minutesSinceLastPetted = (now - prev.lastPetted) / (1000 * 60)

      const newHunger = Math.max(0, prev.hunger - minutesSinceLastFed * HUNGER_DECAY_RATE)
      const newHappiness = Math.max(0, prev.happiness - minutesSinceLastPetted * HAPPINESS_DECAY_RATE)

      const newState = {
        ...prev,
        hunger: newHunger,
        happiness: newHappiness,
        isAlive: newHunger > 0 && newHappiness > 0,
      }

      savePetState(newState)
      return newState
    })
  }, [savePetState])

  // Feed the pet
  const feedPet = useCallback(() => {
    setPetState((prev) => {
      const newState = {
        ...prev,
        hunger: Math.min(100, prev.hunger + FEED_AMOUNT),
        lastFed: Date.now(),
      }
      savePetState(newState)
      return newState
    })
  }, [savePetState])

  // Pet the cat
  const petCat = useCallback(() => {
    setPetState((prev) => {
      const newState = {
        ...prev,
        happiness: Math.min(100, prev.happiness + PET_AMOUNT),
        lastPetted: Date.now(),
      }
      savePetState(newState)
      return newState
    })
  }, [savePetState])

  // Reset pet to initial state
  const resetPet = useCallback(() => {
    const newState = { ...INITIAL_STATE, id: petState.id }
    setPetState(newState)
    savePetState(newState)
  }, [petState.id, savePetState])

  // Auto-update every minute
  useEffect(() => {
    if (isLoading) return

    const interval = setInterval(updatePetState, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [updatePetState, isLoading])

  return {
    petState,
    feedPet,
    petCat,
    resetPet,
    updatePetState,
    isLoading,
    user,
  }
}
