"use client"

import { useEffect, useState } from "react"
import Moon from "./svgs/Moon"
import Sun from "./svgs/Sun"

interface ThemeSwitcherProps {
  className?: string
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const [darkMode, setDarkMode] = useState(true)

  const onChangeMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
    setDarkMode(!darkMode)
  }

  return (
    <button
      className={`border border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black py-3 px-3 rounded-xl ${
        className ?? ""
      }`}
      onClick={onChangeMode}
    >
      {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  )
}

export default ThemeSwitcher
