import { useQuery } from '@tanstack/react-query'

import { fetchContractsData } from '@/lib/api-client'

export function useContractsData() {
  return useQuery({
    queryKey: ['contracts-data'],
    queryFn: fetchContractsData,
    staleTime: 5 * 60 * 1000,
  })
}
