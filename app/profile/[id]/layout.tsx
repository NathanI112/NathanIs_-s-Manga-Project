import type React from "react"
import Header from "@/components/header"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="container py-6">
        <Breadcrumbs />
        {children}
      </div>
    </>
  )
}

