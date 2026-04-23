interface ChartContainerProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function ChartContainer({ title, children, className = '' }: ChartContainerProps) {
  return (
    <div
      className={[
        'rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]',
        className,
      ].join(' ')}
    >
      <h3 className="mb-4 text-[15px] font-semibold text-[#1F2937]">{title}</h3>
      <div className="min-h-[260px]">{children}</div>
    </div>
  )
}
