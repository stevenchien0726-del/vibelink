'use client'

import { useEffect } from 'react'

export default function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem('vibelink-dark-mode')
    document.documentElement.classList.toggle('dark', saved !== 'light')
  }, [])

  return null
}
