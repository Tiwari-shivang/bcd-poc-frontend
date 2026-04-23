export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="rounded-lg border border-[var(--oip-card-border)] bg-white p-5 shadow-sm">
      <h1 className="text-[20px] font-bold tracking-tight text-[#111827]">
        {title}
      </h1>
      <p className="mt-2 text-[13px] text-[#6B7280]">
        This section is a placeholder in the mock OIP shell.
      </p>
      </div>
    </div>
  )
}

