'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'

export function useProfileUIState() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isLinkPortOpen, setIsLinkPortOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const [showSettingsPage, setShowSettingsPage] = useState(false)
  const [showAnalyticsPage, setShowAnalyticsPage] = useState(false)
  const [showTrafficReportPage, setShowTrafficReportPage] = useState(false)

  const [showArchivedPage, setShowArchivedPage] = useState(false)
  const [showNotificationsPage, setShowNotificationsPage] = useState(false)
  const [showShareProfilePage, setShowShareProfilePage] = useState(false)
  const [showPostInsightsPage, setShowPostInsightsPage] = useState(false)

  const [showAccountManagePage, setShowAccountManagePage] = useState(false)
  const [isFavoritesPublic, setIsFavoritesPublic] = useState(true)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true

    const saved = localStorage.getItem('vibelink-dark-mode')

    return saved !== 'light'
  })

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('vibelink-dark-mode')
    const next = saved !== 'light'

    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
  }, [])

  useEffect(() => {
    function handleOpenUpload() {
      setIsMenuOpen(false)
      setActiveTab(0)
      setIsUploadOpen(true)
    }

    window.addEventListener(
      'vibelink-open-upload',
      handleOpenUpload
    )

    return () => {
      window.removeEventListener(
        'vibelink-open-upload',
        handleOpenUpload
      )
    }
  }, [])

  return {
    isMenuOpen,
    setIsMenuOpen,
    isUploadOpen,
    setIsUploadOpen,
    isLinkPortOpen,
    setIsLinkPortOpen,
    activeTab,
    setActiveTab,
    showSettingsPage,
    setShowSettingsPage,
    showAnalyticsPage,
    setShowAnalyticsPage,
    showTrafficReportPage,
    setShowTrafficReportPage,
    showArchivedPage,
    setShowArchivedPage,
    showNotificationsPage,
    setShowNotificationsPage,
    showShareProfilePage,
    setShowShareProfilePage,
    showPostInsightsPage,
    setShowPostInsightsPage,
    showAccountManagePage,
    setShowAccountManagePage,
    isFavoritesPublic,
    setIsFavoritesPublic,
    darkMode,
    setDarkMode,
    isEditProfileOpen,
    setIsEditProfileOpen,
    avatarUploading,
    setAvatarUploading,
  }
}
