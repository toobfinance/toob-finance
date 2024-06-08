import { Scanner } from "@yudiel/react-qr-scanner"
import QR from "../svgs/QR"
import { useRef } from "react"
import { isAddress } from "viem"

interface CCRecipientProps {
  value: string
  setValue: any
}

const CCRecipient: React.FC<CCRecipientProps> = ({ value, setValue }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleScan = (data: any) => {
    if (data) {
      const address = data.text.split(":")[1]
      if (isAddress(address)) setValue(address)
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-12 max-sm:data-[fast=true]:h-[72px] outline-none text-[20px] sm:text-[30px] bg-transparent text-white font-semibold placeholder:white/70 pr-8"
        placeholder="Recipient Address"
      />
      <button className="absolute top-1/2 -translate-y-1/2 right-1.5 hover:scale-105 transition-all">
        <QR className="text-white" />
      </button>
      <Scanner onScan={handleScan} />
    </div>
  )
}

export default CCRecipient
