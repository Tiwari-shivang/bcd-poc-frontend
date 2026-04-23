import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

export interface AnalysisMarkdownProps {
  content: string
  className?: string
}

export function AnalysisMarkdown({ content, className }: AnalysisMarkdownProps) {
  return (
    <div
      className={cn(
        'text-[13px] leading-relaxed text-[#1F2937] [&_strong]:font-semibold [&_strong]:text-[#111827]',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-2.5 list-disc space-y-1 pl-5 last:mb-0 marker:text-[#5B4AE6]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2.5 list-decimal space-y-1 pl-5 last:mb-0 marker:font-medium marker:text-[#5B4AE6]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          h1: ({ children }) => (
            <h4 className="mb-1.5 mt-3 text-[14px] font-semibold text-[#111827] first:mt-0">
              {children}
            </h4>
          ),
          h2: ({ children }) => (
            <h4 className="mb-1.5 mt-3 text-[14px] font-semibold text-[#111827] first:mt-0">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h4 className="mb-1.5 mt-2.5 text-[13px] font-semibold text-[#111827] first:mt-0">
              {children}
            </h4>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className?.startsWith('language-'))
            if (isBlock) {
              return (
                <code
                  className="block font-mono text-[13px] text-[#E5E7EB]"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className="rounded bg-emerald-50 px-1 py-0.5 font-mono text-[12px] text-emerald-900"
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-2.5 overflow-x-auto rounded-lg bg-[#111827] p-2.5 last:mb-0">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2.5 border-l-4 border-[#5B4AE6]/40 pl-3 text-[#4B5563] italic last:mb-0">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-[#3B82F6] underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-3 border-[#E5E7EB]" />,
          table: ({ children }) => (
            <div className="mb-2.5 overflow-x-auto rounded-lg border border-[#E5E7EB] last:mb-0">
              <table className="w-full min-w-[240px] border-collapse text-left text-[13px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#F9FAFB] text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-[#E5E7EB] px-2.5 py-2">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[#E5E7EB] px-2.5 py-2 text-[#374151]">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
