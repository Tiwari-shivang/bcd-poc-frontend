import { Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

export function ChatAssistantAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#5B4AE6] text-white shadow-md ring-2 ring-white/30',
        className
      )}
      aria-hidden
    >
      <Sparkles className="size-4" strokeWidth={2} />
    </div>
  )
}
