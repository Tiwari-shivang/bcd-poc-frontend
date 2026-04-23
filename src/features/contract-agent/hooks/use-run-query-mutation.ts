import { useMutation } from '@tanstack/react-query'

import { postQuery } from '@/lib/api-client'

export function useRunQueryMutation() {
  return useMutation({
    mutationKey: ['query'],
    mutationFn: postQuery,
  })
}
