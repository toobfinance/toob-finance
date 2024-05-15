import Link from "next/link"
import React, { useEffect } from "react"
import { Toast, toast, useToaster } from "react-hot-toast"
import ExternalLink from "./svgs/ExternalLink"
import Spinner from "./Spinner"
import Close from "./svgs/Close"

interface CustomToastProps {
  t: Toast
  type: "success" | "info"
  text: string
  hash: string
}

const CustomToast: React.FC<CustomToastProps> = ({ t, type, text, hash }) => {
  const { toasts } = useToaster()

  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .slice(1)
      .forEach((t) => toast.dismiss(t.id))
  }, [toasts])

  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } min-w-[300px] py-3 px-4 flex items-center justify-between rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] ${
        type === "info" ? "bg-white" : type === "success" ? "bg-[#71bd98]" : ""
      }`}
    >
      <div
        className={`mr-4 ${
          type === "info"
            ? "text-[#1f1d1a]"
            : type === "success"
            ? "text-white"
            : ""
        }`}
      >
        <div className="font-semibold whitespace-nowrap">{text}</div>
        <Link
          href={`https://arbiscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center opacity-75 hover:opacity-50 hover:underline transition-all mt-1"
        >
          View on Arbiscan <ExternalLink className="w-4 h-4 ml-2" />
        </Link>
      </div>
      {type === "info" ? (
        <Spinner className="text-[#1f1d1a]" />
      ) : type === "success" ? (
        <button
          className="flex items-center justify-center rounded-full w-[30px] h-[30px] hover:bg-white/5 transition-all"
          onClick={() => toast.dismiss(t.id)}
        >
          <Close className="w-2.5 h-2.5 text-white" />
        </button>
      ) : null}
    </div>
  )
}

export default CustomToast
