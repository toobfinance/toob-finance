import Link from "next/link"
import React from "react"
import X from "../svgs/X"
import Telegram from "../svgs/Telegram"
import Globe from "../svgs/Globe"
import Github from "../svgs/Github"
import Image from "next/image"
import Logo from "@/assets/logo.png"

function Footer() {
  return (
    <div className="absolute bottom-0 left-0 w-full flex flex-col justify-center items-center gap-3 pt-10 pb-6">
      <h2 className="text-xl font-bold text-[#1f1d1a]">Toob Finance</h2>
      <div className="flex items-center gap-4">
        <Link
          href={"https://toob.dog"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-[#ebd8bb] rounded-full text-white hover:bg-[#e2cdae] transition-all"
        >
          <Globe className="w-5 h-5" />
        </Link>
        <Link
          href={"https://x.com/thetoobdog?s=21&t=QYd3sdnmj6S0oEl_tQzGqg"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-[#ebd8bb] rounded-full text-white hover:bg-[#e2cdae] transition-all"
        >
          <X className="w-5 h-5" />
        </Link>
        <Link
          href={"https://t.me/tooobdog"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-[#ebd8bb] rounded-full text-white hover:bg-[#e2cdae] transition-all"
        >
          <Telegram className="w-5 h-5" />
        </Link>
        <Link
          href={"https://github.com/Toobdog"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-[#ebd8bb] rounded-full text-white hover:bg-[#e2cdae] transition-all"
        >
          <Github className="w-5 h-5" />
        </Link>
      </div>
      <Image
        src={Logo.src}
        width={Logo.width}
        height={Logo.height}
        alt="logo"
        className="w-20"
      />
      <p className="text-[#1f1d1a] text-sm">All rights toobed 2024.</p>
    </div>
  )
}

export default Footer
