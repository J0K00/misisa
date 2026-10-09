import { useQuery } from "@tanstack/react-query"
import { api } from "../services/api"

export function useFamilyTree(familyId: string) {
  return useQuery({
    queryKey: ["familyTree", familyId],
    queryFn: async () => {
      // Pour l'instant si on a le mock family "dupont", on evite le 404 en mockant un peu,
      // sinon on appelle la vraie API.
      try {
        const { data } = await api.get(`/family/${familyId}/tree`)
        return data
      } catch (error: any) {
        if (error.response?.status === 404) {
           return { family: null, persons: [], unions: [], children: [] }
        }
        throw error
      }
    }
  })
}

export function useFamilyMembers(familyId: string) {
  return useQuery({
    queryKey: ["familyMembers", familyId],
    queryFn: async () => {
      const { data } = await api.get(`/persons/family/${familyId}`)
      return data
    }
  })
}

import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post("/family/", { name })
      return data
    },
    onSuccess: () => {
      // Refresh cache if needed
    }
  })
}
