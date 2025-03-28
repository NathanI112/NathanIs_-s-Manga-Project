import type React from "react"
export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col min-h-screen">{children}</div>
}

