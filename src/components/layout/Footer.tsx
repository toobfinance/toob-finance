import Link from "next/link"
import React from "react"
import X from "../svgs/X"
import Globe from "../svgs/Globe"
import Github from "../svgs/Github"
import Docs from "../svgs/Docs"

function Footer() {
  return (
    <div className="absolute bottom-0 left-0 w-full flex flex-col justify-center items-center gap-3 pt-10 pb-6">
      <h2 className="text-xl font-bold text-black dark:text-white">
        Toob Finance
      </h2>
      <div className="flex items-center gap-4">
        <Link
          href={"https://toob.finance"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-black dark:bg-white rounded-full text-white dark:text-black hover:bg-black/60 dark:hover:bg-white/80 transition-all"
        >
          <Globe className="w-5 h-5" />
        </Link>
        <Link
          href={"https://x.com/ToobFinance"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-black dark:bg-white rounded-full text-white dark:text-black hover:bg-black/60 dark:hover:bg-white/80 transition-all"
        >
          <X className="w-5 h-5" />
        </Link>
        <Link
          href={"https://docs.toob.finance"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-black dark:bg-white rounded-full text-white dark:text-black hover:bg-black/60 dark:hover:bg-white/80 transition-all"
        >
          <Docs className="w-5 h-5" />
        </Link>
        <Link
          href={"https://github.com/toobfinance"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-black dark:bg-white rounded-full text-white dark:text-black hover:bg-black/60 dark:hover:bg-white/80 transition-all"
        >
          <Github className="w-5 h-5" />
        </Link>
      </div>
      <p className="text-black dark:text-white text-sm">
        All rights reserved ©2024
      </p>
    </div>
  )
}

export default Footer
