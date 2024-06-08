import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import Provider from "./providers"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Toaster } from "react-hot-toast"

const roobert = localFont({
  src: [
    {
      path: "/fonts/Roobert-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "/fonts/Roobert-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
  ],
})

export const metadata: Metadata = {
  title: "Toob Finance: Buy ANY ERC-20 Token",
  description: "Toob Finance",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`bg-white dark:bg-black ${roobert.className}`}>
        <Provider>
          <Header />
          <main className="relative min-h-[calc(100vh-96px)] pb-[290px]">
            {children}
            <Footer />
          </main>
          <Toaster position="top-right" />
        </Provider>
      </body>
    </html>
  )
}
