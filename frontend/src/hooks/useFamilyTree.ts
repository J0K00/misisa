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

export function useCreatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (personData: any) => {
      const { data } = await api.post("/persons/", personData)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["familyTree", variables.family_id] })
      queryClient.invalidateQueries({ queryKey: ["familyMembers", variables.family_id] })
    }
  })
}

export function useCreateUnion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (unionData: any) => {
      const { data } = await api.post("/unions/", unionData)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["familyTree", variables.family_id] })
    }
  })
}

export function useAddChildToUnion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { union_id: string, child_id: string, family_id: string }) => {
      const response = await api.post(`/unions/${data.union_id}/children`, { child_id: data.child_id })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["familyTree", variables.family_id] })
    }
  })
}
