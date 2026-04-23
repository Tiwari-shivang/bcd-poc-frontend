import { useQuery } from '@tanstack/react-query'

import { fetchDemoQueries } from '@/lib/api-client'

export function useDemoQueries() {
  return useQuery({
    queryKey: ['demo-queries'],
    queryFn: fetchDemoQueries,
  })
}
