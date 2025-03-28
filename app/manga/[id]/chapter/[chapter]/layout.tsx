import type React from "react"
export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="chapter-layout">{children}</div>
}

