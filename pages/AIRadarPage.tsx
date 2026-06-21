'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { getCachedSession } from '@/lib/authSessionCache'
import { ensureUserProfile } from '@/lib/profile'
import { getAuthCallbackUrl } from '@/lib/authRedirect'

import { AnimatePresence, motion } from 'framer-motion'

import { BrushCleaning, Mic, Sparkles } from 'lucide-react'

import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'
import { FakeUser } from '../data/fakeUsers'

import { MEMBERSHIP_URL, openLink } from '@/lib/links'

import AIRadarLoadingOverlay from '@/components/airadar/AIRadarLoadingOverlay'
import AIRadarMoreWall from '@/components/airadar/AIRadarMoreWall'

import AIRadarResultCard from '@/components/airadar/AIRadarResultCard'

import AIRadarTopBar from '@/components/airadar/AIRadarTopBar'
import AIRadarInputBar from '@/components/airadar/AIRadarInputBar'
import AIRadarInfoSheet from '@/components/ai-radar/AIRadarInfoSheet'

import EmailOtpLogin from '@/components/auth/EmailOtpLogin'

import OtherUserProfilePage from '../components/profile/OtherUserProfilePage'
import type { Locale } from '@/i18n'

import { getAIRadarText } from '@/lib/ai-radar/aiRadarI18n'

import AIRadarVoiceInput from '@/components/airadar/AIRadarVoiceInput'

type AIRadarPageProps = {
  locale: Locale
  hasLocalePreference: boolean
  onChangeLocale: (locale: Locale) => void
}

type AIRadarLoadingStage =
  | 'idle'
  | 'searching'
  | 'parsing'
  | 'generating'

type AIRadarUser = FakeUser & {
  humanFeeling?: string
  tags?: string[]
  vibe_tags?: string[]
  matchedReasons?: string[]
  displayName?: string
  username?: string
  avatar?: string
  image?: string
  images?: string[]
}

type AIRadarResponse = {
  ok?: boolean
  matchedUsers?: unknown[]
  aiReply?: string
}

type AIRadarStreamEvent = {
  type?: string
  stage?: AIRadarLoadingStage
  data?: AIRadarResponse
}

type SpeechRecognitionResultListLike = {
  length: number
  [index: number]:
    | {
        [index: number]: { transcript?: string } | undefined
      }
    | undefined
}

type SpeechRecognitionResultEventLike = {
  results: SpeechRecognitionResultListLike
}

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  onerror: ((event: unknown) => void) | null
  onend: (() => void) | null
  start: () => void
  abort?: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

type WindowWithSpeechRecognition = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

const EMPTY_SKY_IMAGES: string[] = []

type AIRadarResultsSectionProps = {
  showCandidates: boolean
  showWalls: boolean
  results: AIRadarUser[]
  refreshKey: number
  refreshCount: number
  getCandidateDescription: (user: AIRadarUser) => string
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void
  onOpenProfile: (user: AIRadarUser) => void
  onRefresh: () => void
}

const AIRadarResultsSection = memo(function AIRadarResultsSection({
  showCandidates,
  showWalls,
  results,
  refreshKey,
  refreshCount,
  getCandidateDescription,
  onTouchStart,
  onTouchMove,
  onPointerDown,
  onPointerMove,
  onWheel,
  onOpenProfile,
  onRefresh,
}: AIRadarResultsSectionProps) {
  const visibleResults = useMemo(() => results.slice(0, 2), [results])

  return (
    <>
      {showCandidates && visibleResults.length > 0 && (
        <div className="space-y-4">
          {visibleResults.map((user) => (
            <AIRadarResultCard
              key={user.id}
              user={user}
              getCandidateDescription={getCandidateDescription}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onWheel={onWheel}
              onOpenProfile={onOpenProfile}
            />
          ))}
        </div>
      )}

      {showWalls && (
        <div className="space-y-4 pt-4">
          <AIRadarMoreWall
            refreshKey={refreshKey}
            refreshCount={refreshCount}
            isSkySeedSearch={false}
            skyImages={EMPTY_SKY_IMAGES}
            onRefresh={onRefresh}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onWheel={onWheel}
          />
        </div>
      )}
    </>
  )
})

export default function AIRadarPage({
  locale,
  hasLocalePreference,
  onChangeLocale,
}: AIRadarPageProps) {
  const safeLocale: Locale = locale ?? 'zh-TW'
const text = useMemo(() => getAIRadarText(safeLocale), [safeLocale])
const FALLBACK_STARTER_PROMPTS_POOL = useMemo(() =>
  safeLocale === 'en'
    ? [
        'Find people who look emotionally warm and easy to talk to',
        'Find introverted people who love late-night conversations',
        'Find stylish people with a Korean vibe',
        'Find people who love techno, rave, and nightlife',
        'Find soft and healing personalities',
        'Find gym people with a sunny personality',
        'Find people who love fashion and outfit photos',
        'Find creative people into photography and art',
        'Find people who feel mysterious and hard to read',
        'Find cute people with anime or gamer vibes',
        'Find people who enjoy cafes and slow daily life',
        'Find extroverted social butterflies',
        'Find emotionally mature people',
        'Find people who feel like party girls or party boys',
        'Find people with a luxury rich-kid vibe',
        'Find people who love pets and cozy daily life',
        'Find chill people you can travel with',
        'Find people with a strong music taste',
        'Find emotionally healing personalities',
        'Find people who look good in black outfits',
      ]
    : [
        '幫我找感覺情緒穩定、好聊天的人',
        '幫我找喜歡深夜聊天的人',
        '幫我找韓系穿搭 vibe 的人',
        '幫我找喜歡 Techno、Rave、夜生活的人',
        '幫我找有療癒感的人',
        '幫我找陽光健身系的人',
        '幫我找很會穿搭的人',
        '幫我找喜歡攝影和創作的人',
        '幫我找有神秘感的人',
        '幫我找動漫或遊戲 vibe 的人',
        '幫我找喜歡咖啡廳和慢生活的人',
        '幫我找超愛社交的人',
        '幫我找情緒成熟的人',
        '幫我找 party girl / party boy vibe 的人',
        '幫我找有富二代感的人',
        '幫我找喜歡寵物的人',
        '幫我找適合一起旅行的人',
        '幫我找很懂音樂 vibe 的人',
        '幫我找有情緒療癒感的人',
        '幫我找穿黑色很好看的人',
      ], [safeLocale])

const getRandomStarterPrompts = useCallback(() => {
  const shuffled = [...FALLBACK_STARTER_PROMPTS_POOL].sort(
    () => Math.random() - 0.5
  )

  return shuffled.slice(0, 3)
}, [FALLBACK_STARTER_PROMPTS_POOL])

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshCount, setRefreshCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] =
    useState<AIRadarLoadingStage>('idle')

  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false)
const [voiceTranscript, setVoiceTranscript] = useState('')
const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
const [showAIRadarInfo, setShowAIRadarInfo] = useState(false)

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
const [authLoading, setAuthLoading] = useState(false)
const [authErrorMessage, setAuthErrorMessage] = useState('')
const [showEmailLogin, setShowEmailLogin] = useState(false)

  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)

  const [loading, setLoading] = useState(false)
const [results, setResults] = useState<AIRadarUser[]>([])
const [aiText, setAiText] = useState('')
const [errorType, setErrorType] = useState('')
const [lastQuery, setLastQuery] = useState('')

const [selectedProfileUser, setSelectedProfileUser] =
  useState<AIRadarUser | null>(null)

const [displayedAiText, setDisplayedAiText] = useState('')
const [showCandidates, setShowCandidates] = useState(false)
const [showWalls, setShowWalls] = useState(false)

const [starterPrompts, setStarterPrompts] = useState<string[]>([])
const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(true)

const [showTopBar, setShowTopBar] = useState(true)
const [showNewUserUploadGuide, setShowNewUserUploadGuide] = useState(false)

  const [isPeopleLibraryOpen, setIsPeopleLibraryOpen] = useState(false)
  const [selectedLibraryUser, setSelectedLibraryUser] = useState<{
  id: string
  name: string
  avatar: string
} | null>(null)

const [flyingUser, setFlyingUser] = useState<{
  user: { id: string; name: string; avatar: string }
  sourceRect: {
    top: number
    left: number
    width: number
    height: number
  }
  targetRect: {
    top: number
    left: number
    width: number
    height: number
  }
} | null>(null)

const targetRef = useRef<HTMLDivElement | null>(null)

const mainScrollRef = useRef<HTMLElement | null>(null)
const handleSubmitRef = useRef<((queryOverride?: string) => Promise<void>) | null>(
  null
)
const touchStartRef = useRef({ x: 0, y: 0 })
const pointerStartRef = useRef({ x: 0, y: 0 })
const inFlightRef = useRef(false)
const activeQueryRef = useRef('')
const activeAbortControllerRef = useRef<AbortController | null>(null)
const requestSequenceRef = useRef(0)
const requestTimersRef = useRef<number[]>([])
const typingTimerRef = useRef<number | null>(null)
const hasShownUploadGuideRef = useRef(false)
const uploadGuideSessionKey = 'vibelink_ai_radar_upload_guide_shown'

function clearRequestTimers() {
  requestTimersRef.current.forEach((timer) => {
    window.clearTimeout(timer)
  })
  requestTimersRef.current = []

  if (typingTimerRef.current !== null) {
    window.clearInterval(typingTimerRef.current)
    typingTimerRef.current = null
  }
}

function scheduleRequestTimer(
  callback: () => void,
  delay: number,
  requestId: number
) {
  const timer = window.setTimeout(() => {
    if (requestSequenceRef.current === requestId) {
      callback()
    }
  }, delay)

  requestTimersRef.current.push(timer)
  return timer
}

function withTimeout<T>(
  promise: PromiseLike<T>,
  ms = 10000,
  label = 'request'
): Promise<T | null> {
  let timeoutId: number | null = null

  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => {
      timeoutId = window.setTimeout(() => {
        console.warn(`${label} timeout`)
        resolve(null)
      }, ms)
    }),
  ]).finally(() => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
    }
  })
}

async function safeTask<T>(
  task: () => PromiseLike<T>,
  label: string
): Promise<T | null> {
  try {
    return await withTimeout(task(), 10000, label)
  } catch (error) {
    console.warn(`${label} failed:`, error)
    return null
  }
}

async function checkUserHasUploadedContent(
  userId: string
): Promise<boolean | null> {
  const [postsResult, postImagesResult, shortVideosResult, profileResult] =
    await Promise.allSettled([
      withTimeout(
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .limit(1),
        6000,
        'ai_radar_posts_exists'
      ),
      withTimeout(
        supabase
          .from('posts')
          .select(`
            id,
            post_images (
              image_url
            )
          `)
          .eq('user_id', userId)
          .limit(5),
        6000,
        'ai_radar_post_images_exists'
      ),
      withTimeout(
        supabase
          .from('short_videos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .limit(1),
        6000,
        'ai_radar_short_videos_exists'
      ),
      withTimeout(
        supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .maybeSingle(),
        6000,
        'ai_radar_profile_avatar_exists'
      ),
    ])

  let hadUnknownResult = false

  function unwrapResult<T>(
    result: PromiseSettledResult<T | null>,
    label: string
  ): T | null {
    if (result.status === 'rejected') {
      console.warn(`${label} failed:`, result.reason)
      hadUnknownResult = true
      return null
    }

    if (result.value === null) {
      hadUnknownResult = true
      return null
    }

    return result.value
  }

  const posts = unwrapResult(postsResult, 'ai_radar_posts_exists')
  const postImages = unwrapResult(
    postImagesResult,
    'ai_radar_post_images_exists'
  )
  const shortVideos = unwrapResult(
    shortVideosResult,
    'ai_radar_short_videos_exists'
  )
  const profile = unwrapResult(profileResult, 'ai_radar_profile_avatar_exists')

  if (posts?.error || postImages?.error || shortVideos?.error || profile?.error) {
    console.warn('AI Radar upload check skipped because a query failed', {
      posts: posts?.error,
      postImages: postImages?.error,
      shortVideos: shortVideos?.error,
      profile: profile?.error,
    })
    return null
  }

  const hasPosts = (posts?.count ?? 0) > 0
  const hasPostImages = Boolean(
    postImages?.data?.some(
      (post: { post_images?: { image_url?: string | null }[] | null }) =>
        (post.post_images?.length ?? 0) > 0
    )
  )
  const hasShortVideos = (shortVideos?.count ?? 0) > 0
  const hasAvatar = Boolean(profile?.data?.avatar_url)

  if (hasPosts || hasPostImages || hasShortVideos || hasAvatar) {
    return true
  }

  return hadUnknownResult ? null : false
}

function hasUploadGuideBeenShownThisSession() {
  if (hasShownUploadGuideRef.current) return true
  if (typeof window === 'undefined') return false

  return window.sessionStorage.getItem(uploadGuideSessionKey) === 'true'
}

function markUploadGuideShownThisSession() {
  hasShownUploadGuideRef.current = true

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(uploadGuideSessionKey, 'true')
  }
}

async function updateUploadGuideForUser(userId: string) {
  const hasUploadedContent = await checkUserHasUploadedContent(userId)

  if (hasUploadedContent !== false) {
    setShowNewUserUploadGuide(false)
    return
  }

  if (hasUploadGuideBeenShownThisSession()) {
    setShowNewUserUploadGuide(false)
    return
  }

  markUploadGuideShownThisSession()
  setShowNewUserUploadGuide(true)
}

async function readAIRadarStreamResponse(
  response: Response,
  onStage: (stage: AIRadarLoadingStage) => void
): Promise<AIRadarResponse> {
  if (!response.body) {
    return response.json()
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let resultData: AIRadarResponse | null = null
  let rawText = ''

  const handleEvent = (event: AIRadarStreamEvent) => {
    if (event?.type === 'progress') {
      if (
        event.stage === 'searching' ||
        event.stage === 'parsing' ||
        event.stage === 'generating'
      ) {
        onStage(event.stage)
      }

      return
    }

    if (event?.type === 'result') {
      resultData = event.data ?? null
    }
  }

  const consumeChunk = (chunk: string) => {
    rawText += chunk
    buffer += chunk

    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      const dataLines = part
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())

      if (dataLines.length === 0) continue

      try {
        handleEvent(JSON.parse(dataLines.join('\n')) as AIRadarStreamEvent)
      } catch (error) {
        console.error('[AI Radar Frontend] stream event parse failed:', error)
      }
    }
  }

  while (true) {
    const { value, done } = await reader.read()

    if (done) break

    consumeChunk(decoder.decode(value, { stream: true }))
  }

  consumeChunk(decoder.decode())

  if (buffer.trim()) {
    consumeChunk('\n\n')
  }

  if (resultData) {
    return resultData
  }

  try {
    return JSON.parse(rawText) as AIRadarResponse
  } catch (error) {
    console.error('[AI Radar Frontend] JSON parse failed:', error)
    throw Object.assign(new Error('JSON_PARSE_FAILED'), {
      cause: error,
    })
  }
}

useEffect(() => {
  return () => {
    requestSequenceRef.current += 1
    activeAbortControllerRef.current?.abort()
    activeAbortControllerRef.current = null
    inFlightRef.current = false
    clearRequestTimers()
  }
}, [])

useEffect(() => {
  let cancelled = false

  async function loadStarterPrompts() {
    setIsGeneratingPrompts(true)

    try {
      const response = await withTimeout(
        fetch(`/api/ai-radar/starter-prompts?locale=${safeLocale}`),
        5000,
        'ai_radar_starter_prompts'
      )

      if (cancelled) return

      if (!response) {
        console.warn('starter prompts timed out, using fallback prompts')
        setStarterPrompts(getRandomStarterPrompts())
        return
      }

      if (!response.ok) {
        setStarterPrompts(getRandomStarterPrompts())
        return
      }

      const data = await response.json()

      setStarterPrompts(
        Array.isArray(data?.prompts) && data.prompts.length > 0
          ? data.prompts.slice(0, 3)
          : getRandomStarterPrompts()
      )
    } catch (error) {
      console.warn('starter prompts failed:', error)

      if (!cancelled) {
      setStarterPrompts(getRandomStarterPrompts())
      }
    } finally {
      if (!cancelled) {
        setIsGeneratingPrompts(false)
      }
    }
  }

  void loadStarterPrompts()

  return () => {
    cancelled = true
  }
}, [safeLocale])

useEffect(() => {
  let cancelled = false
  let ensuredProfileForUserId: string | null = null

  function showLoggedOutEntryFlow() {
    if (hasLocalePreference) {
      setIsLanguageModalOpen(false)
      setIsAuthModalOpen(true)
      return
    }

    setIsAuthModalOpen(false)
    setIsLanguageModalOpen(true)
  }

  function ensureAIRadarProfileOnce(userId: string) {
    if (ensuredProfileForUserId === userId) return

    ensuredProfileForUserId = userId

    void safeTask(
      () => ensureUserProfile(),
      'ai_radar_auth_ensure_profile'
    )
  }

  async function initAuth() {
    const session = await withTimeout(
      getCachedSession(),
      6000,
      'ai_radar_auth_session'
    )

const user = session?.user

    if (cancelled) return

    if (!user) {
      showLoggedOutEntryFlow()
      return
    }

    setIsLanguageModalOpen(false)
    setIsAuthModalOpen(false)

ensureAIRadarProfileOnce(user.id)

await updateUploadGuideForUser(user.id)

if (cancelled) return
  }

  initAuth()

  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (cancelled) return

      if (session) {
  setIsLanguageModalOpen(false)
  setIsAuthModalOpen(false)

  const user = session.user

  ensureAIRadarProfileOnce(user.id)

  await updateUploadGuideForUser(user.id)

  if (cancelled) return
}
      else {
        showLoggedOutEntryFlow()
      }
    }
  )

  return () => {
    cancelled = true
    listener.subscription.unsubscribe()
  }
}, [hasLocalePreference])

async function handleGoogleLogin() {
  if (authLoading) return

  setAuthLoading(true)
  setAuthErrorMessage('')

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl(),
    },
  })

  if (error) {
    console.error('Google 登入失敗:', error)
    setAuthErrorMessage(text.googleLoginFailed)
    setAuthLoading(false)
  }
}

function handleSelectLoginLanguage(nextLocale: Locale) {
  onChangeLocale(nextLocale)
  setIsLanguageModalOpen(false)
  setIsAuthModalOpen(true)
}

const hasInput = inputValue.trim().length > 0 || !!selectedLibraryUser

  function typeText(
    value: string,
    requestId: number,
    onDone?: () => void
  ) {
  if (typingTimerRef.current !== null) {
    window.clearInterval(typingTimerRef.current)
  }

  setDisplayedAiText('')
  let index = 0

  typingTimerRef.current = window.setInterval(() => {
    if (requestSequenceRef.current !== requestId) {
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
      }
      return
    }

    index += 1
    setDisplayedAiText(value.slice(0, index))

    if (index >= value.length) {
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
      }
      onDone?.()
    }
  }, 22)
}

const stopSwipePropagation = useCallback(
  (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]

    if (!touch) return

    if (e.type === 'touchstart') {
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      }
      return
    }

    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    if (Math.abs(deltaY) >= Math.abs(deltaX)) return
    if (Math.abs(deltaX) < 10) return

    e.stopPropagation()
  },
  []
)

const stopPointerPropagation = useCallback(
  (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointerdown') {
      pointerStartRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
      return
    }

    const deltaX = e.clientX - pointerStartRef.current.x
    const deltaY = e.clientY - pointerStartRef.current.y

    if (Math.abs(deltaY) >= Math.abs(deltaX)) return
    if (Math.abs(deltaX) < 10) return

    e.stopPropagation()
  },
  []
)

const stopWheelPropagation = useCallback(
  (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) return
    e.stopPropagation()
  },
  []
)

function handlePickLibraryUser(payload: {
  user: { id: string; name: string; avatar: string }
  sourceRect: DOMRect
}) {
  const targetEl = targetRef.current

  if (!targetEl) {
    setSelectedLibraryUser(payload.user)
    setIsPeopleLibraryOpen(false)
    return
  }

  const targetRect = targetEl.getBoundingClientRect()

  setFlyingUser({
    user: payload.user,
    sourceRect: {
      top: payload.sourceRect.top,
      left: payload.sourceRect.left,
      width: payload.sourceRect.width,
      height: payload.sourceRect.height,
    },
    targetRect: {
      top: targetRect.top,
      left: targetRect.left,
      width: targetRect.width,
      height: targetRect.height,
    },
  })

  setIsPeopleLibraryOpen(false)
}

function handleClearInput() {
  setInputValue('')
  setSelectedLibraryUser(null)
}

const handleOpenProfile = useCallback((user: AIRadarUser) => {
  setSelectedProfileUser(user)
}, [])

const handleRefreshMoreWall = useCallback(() => {
  if (refreshCount >= 2) return

  setIsLoading(true)
  setLoadingStage('searching')

  window.setTimeout(() => {
    setRefreshKey((prev) => prev + 1)
    setRefreshCount((prev) => prev + 1)

    setIsLoading(false)
    setLoadingStage('idle')
  }, 1000)
}, [refreshCount])

const handleOpenPeopleLibrary = useCallback(() => {
  setIsPeopleLibraryOpen(true)
}, [])

const handleOpenAIRadarInfo = useCallback(() => {
  setShowAIRadarInfo(true)
}, [])

const handleOpenVibePlus = useCallback(() => {
  openLink(MEMBERSHIP_URL)
}, [])

function handleRetry() {
  if (!lastQuery) return

  setInputValue(lastQuery)
  void handleSubmit(lastQuery)
}

function handleVoiceInput() {
  const speechWindow = window as WindowWithSpeechRecognition
  const SpeechRecognition =
    speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

  if (!SpeechRecognition) {
    alert(text.voiceNotSupported)
    return
  }

  try {
    recognitionRef.current?.abort?.()
  } catch {}

  const recognition = new SpeechRecognition()
  recognitionRef.current = recognition

  recognition.lang =
  safeLocale === 'en'
    ? 'en-US'
    : 'zh-TW'
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  setIsListening(true)

  recognition.onresult = (event) => {
    let nextTranscript = ''

    for (let i = 0; i < event.results.length; i += 1) {
      const result = event.results[i]
      const transcriptPart = result?.[0]?.transcript ?? ''

      if (transcriptPart) {
        nextTranscript += transcriptPart
      }
    }

    nextTranscript = nextTranscript.trim()

    console.log('voice transcript:', nextTranscript)

    if (!nextTranscript) return

    setVoiceTranscript(nextTranscript)
    setInputValue(nextTranscript)
  }

  recognition.onerror = (event) => {
    console.warn('voice recognition error:', event)
    setIsListening(false)
  }

  recognition.onend = () => {
  setIsListening(false)
}

  try {
    setIsListening(true)
    recognition.start()
  } catch (error) {
    console.warn('voice recognition start failed:', error)
    setIsListening(false)
    alert(text.voiceNotSupported)
  }
}

function handleVoiceSubmit() {
  const finalVoiceText = voiceTranscript.trim() || inputValue.trim()

  if (!finalVoiceText) return

  setInputValue(finalVoiceText)
  setIsVoicePanelOpen(false)
  void handleSubmit(finalVoiceText)
}

const getCandidateDescription = useCallback((user: AIRadarUser) => {
  if (user?.humanFeeling) {
    return user.humanFeeling
  }

  const tags = user.tags ?? user.vibe_tags ?? []

  const reasons = (user.matchedReasons ?? []).filter(
    (reason: string) =>
      !reason.toLowerCase().includes('vector similarity')
  )

  const isEnglish =
    /[a-zA-Z]/.test(lastQuery) &&
    !/[一-龥]/.test(lastQuery)

  const name =
    user.displayName ||
    user.username ||
    (isEnglish ? 'this user' : '這位用戶')

  if (isEnglish) {
    if (reasons.length > 0) {
  const topTags = tags.slice(0, 3).join(', ')

  if (topTags) {
    return `${name}'s content connects with ${topTags}. Their posts feel close to your search direction, with lifestyle signals that make the recommendation feel more specific than a simple profile match.`
  }

  return `${name}'s posts overlap with your search direction, with a natural lifestyle vibe that could be easy to start a conversation with.`
}

    if (
      tags.includes('nightlife') ||
      tags.includes('techno') ||
      tags.includes('rave') ||
      tags.includes('dj')
    ) {
      return `${name} has a nightlife and music-party vibe, with strong social energy and event-driven content.`
    }

    if (
      tags.includes('gym') ||
      tags.includes('fitness') ||
      tags.includes('workout')
    ) {
      return `${name}'s content feels sporty and outdoorsy, with a disciplined, active, and sunny vibe.`
    }

    if (
      tags.includes('coffee') ||
      tags.includes('cafe') ||
      tags.includes('book')
    ) {
      return `${name}'s photos include cafe and daily-life moments, creating a calm and artsy lifestyle vibe.`
    }

    if (
      tags.includes('dance') ||
      tags.includes('kpop')
    ) {
      return `${name} has a dance and Korean-style vibe, with lively and influencer-like energy.`
    }

    if (
      tags.includes('cat') ||
      tags.includes('dog') ||
      tags.includes('pet')
    ) {
      return `${name}'s content includes pets and cozy daily-life moments, giving off a soft and healing vibe.`
    }

    if (
      tags.includes('beach') ||
      tags.includes('travel')
    ) {
      return `${name}'s photos lean toward travel and outdoor exploration, like someone who enjoys freedom and new experiences.`
    }

    return `${name}'s content overlaps with your search direction and has a natural, comfortable lifestyle vibe.`
  }

  if (reasons.length > 0) {
    const topTags = tags.slice(0, 3).join(' / ')

    if (topTags) {
      return `${name} 的內容和 ${topTags} 有關，整體貼文方向和你的搜尋比較接近。`
    }

    return `${name} 的貼文和你的搜尋方向有部分重疊，整體 vibe 自然舒服。`
  }

  if (
    tags.includes('nightlife') ||
    tags.includes('techno') ||
    tags.includes('rave') ||
    tags.includes('dj')
  ) {
    return `${name} 偏音樂派對與夜生活 vibe，照片裡有不少活動感與社交氛圍。`
  }

  if (
    tags.includes('gym') ||
    tags.includes('fitness') ||
    tags.includes('workout')
  ) {
    return `${name} 的內容偏運動與戶外生活感，整體給人比較自律、有活力。`
  }

  if (
    tags.includes('coffee') ||
    tags.includes('cafe') ||
    tags.includes('book')
  ) {
    return `${name} 的照片有咖啡廳與生活日常感，整體氛圍偏安靜、慢節奏。`
  }

  if (
    tags.includes('dance') ||
    tags.includes('kpop')
  ) {
    return `${name} 偏舞蹈與韓系 vibe，內容看起來比較活潑。`
  }

  if (
    tags.includes('cat') ||
    tags.includes('dog') ||
    tags.includes('pet')
  ) {
    return `${name} 的內容有寵物與日常生活感，整體氛圍比較柔和。`
  }

  if (
    tags.includes('beach') ||
    tags.includes('travel')
  ) {
    return `${name} 的照片偏旅行與戶外探索感，像是喜歡自由生活與新體驗的人。`
  }

  return `${name} 的內容和你的搜尋方向有部分重疊，整體 vibe 看起來自然舒服。`
}, [lastQuery])

    const handleSubmit = async (queryOverride?: string) => {
  const currentInput =
    typeof queryOverride === 'string'
      ? queryOverride.trim()
      : inputValue.trim()
  const finalQuery =
    currentInput ||
    (selectedLibraryUser
      ? text.similarToUserPrompt(selectedLibraryUser.name)
      : '')

  if (!finalQuery) return

  if (
    inFlightRef.current &&
    activeQueryRef.current === finalQuery
  ) {
    return
  }

  activeAbortControllerRef.current?.abort()
  clearRequestTimers()

  const requestId = requestSequenceRef.current + 1
  requestSequenceRef.current = requestId
  inFlightRef.current = true
  activeQueryRef.current = finalQuery

  const controller = new AbortController()
  activeAbortControllerRef.current = controller

  let timeoutId: number | null = null

const finishRequest = () => {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
    timeoutId = null
  }

  setLoading(false)
  setIsLoading(false)
  setLoadingStage('idle')

  inFlightRef.current = false

  if (activeAbortControllerRef.current === controller) {
    activeAbortControllerRef.current = null
  }
}

    setIsLoading(true)
    setLoadingStage('searching')

  setShowTopBar(true)

  setLoading(true)
  setResults([])
  setRefreshCount(0)
  setAiText('')
  setDisplayedAiText('')
  setErrorType('')

  setShowCandidates(false)
  setShowWalls(false)

  setLastQuery(finalQuery)

    let data: AIRadarResponse | null = null

try {
  timeoutId = scheduleRequestTimer(() => {
  controller.abort()
  finishRequest()
}, 25000, requestId)

  const radarSession = await withTimeout(
    getCachedSession(),
    6000,
    'ai_radar_submit_session'
  )

  if (requestSequenceRef.current !== requestId) {
  setLoading(false)
  setIsLoading(false)
  setLoadingStage('idle')

  inFlightRef.current = false

  return
}

  if (!radarSession?.access_token) {
    clearTimeout(timeoutId)
    setErrorType('UNAUTHORIZED')

    data = {
      ok: false,
      matchedUsers: [],
      aiReply: text.loginRequired,
    }
  } else {
  const queryLocale =
  /[a-zA-Z]/.test(finalQuery) && !/[一-龥]/.test(finalQuery)
    ? 'en'
    : safeLocale

const response = await fetch('/api/ai-radar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${radarSession.access_token}`,
  },
  body: JSON.stringify({
    query: finalQuery,
    locale: queryLocale,
    referenceUserId: selectedLibraryUser?.id ?? null,
    referenceUserName: selectedLibraryUser?.name ?? null,
  }),
  signal: controller.signal,
})

  clearTimeout(timeoutId)

  if (requestSequenceRef.current !== requestId) {
  setLoading(false)
  setIsLoading(false)
  setLoadingStage('idle')

  inFlightRef.current = false

  return
}

  console.log('[AI Radar Frontend] response status:', response.status)

try {
  data = await readAIRadarStreamResponse(response, (stage) => {
    if (requestSequenceRef.current === requestId) {
      setLoadingStage(stage)
    }
  })
} catch (jsonError: unknown) {
  if (!(jsonError instanceof Error) || jsonError.message !== 'JSON_PARSE_FAILED') {
    throw jsonError
  }

  setErrorType('JSON_PARSE_FAILED')

  data = {
    ok: false,
    matchedUsers: [],
    aiReply: text.invalidResponse,
  }
}

if (timeoutId !== null) {
  window.clearTimeout(timeoutId)
  timeoutId = null
}

if (requestSequenceRef.current !== requestId) {
  finishRequest()
return
}

console.log('[AI Radar Frontend] parsed data:', data)
}
} catch (error: unknown) {
  if (requestSequenceRef.current !== requestId) {
  setLoading(false)
  setIsLoading(false)
  setLoadingStage('idle')

  inFlightRef.current = false

  return
}

  console.error('[AI Radar Frontend] API failed:', error)

  const errorName = error instanceof Error ? error.name : ''

  if (errorName === 'AbortError') {
    setErrorType('TIMEOUT')
  } else {
    setErrorType('NETWORK_FAILED')
  }

  data = {
    ok: false,
    matchedUsers: [],
    aiReply:
      errorName === 'AbortError'
        ? text.timeoutError
        : text.networkError,
  }
}

scheduleRequestTimer(() => {
  if (requestSequenceRef.current !== requestId) {
  setLoading(false)
  setIsLoading(false)
  setLoadingStage('idle')

  inFlightRef.current = false

  return
}

  try {
  const matchedUsers = data?.matchedUsers ?? []

  const aiReplyText = data?.aiReply ?? ''

    let nextAiText = ''

if (matchedUsers.length > 0) {
  nextAiText = aiReplyText
} else {
  nextAiText =
    aiReplyText ||
    `目前沒有找到和「${finalQuery}」相關的真實用戶，請換個描述再試一次。`
}

    setAiText(nextAiText)
    setLoading(false)
        setIsLoading(false)
        setLoadingStage('idle')

    if (matchedUsers.length > 0) {
  setResults(matchedUsers as AIRadarUser[])

  scheduleRequestTimer(() => {
    setShowCandidates(true)
  }, 120, requestId)

  scheduleRequestTimer(() => {
    setShowWalls(true)
  }, 260, requestId)

  
} else {
  
}

typeText(nextAiText, requestId)
    inFlightRef.current = false
    activeAbortControllerRef.current = null
    } catch (renderError) {
    if (requestSequenceRef.current !== requestId) {
  finishRequest()
  return
}

    console.error('AI Radar render failed:', renderError)
    setLoading(false)
    setIsLoading(false)
    setLoadingStage('idle')
    setErrorType('RENDER_FAILED')
    setAiText('AI 雷達顯示結果時發生問題，請再試一次。')
    setDisplayedAiText('AI 雷達顯示結果時發生問題，請再試一次。')
    inFlightRef.current = false
    activeAbortControllerRef.current = null
  }
}, 320, requestId)
}

handleSubmitRef.current = handleSubmit

const handleInputSubmit = useCallback(() => {
  void handleSubmitRef.current?.()
}, [])

  const promptPillClassName =
    'min-h-[52px] rounded-[18px] border border-white/[0.12] bg-white/[0.08] px-5 py-3 text-center font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.06)] active:scale-[0.98] transition'

  return (
  <>
<AIRadarLoadingOverlay
  open={isLoading}
  text={loadingStage === 'idle' ? '' : text.loading[loadingStage]}
/>

      {isLanguageModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-6">
    <div className="w-full max-w-[360px] rounded-[36px] bg-[var(--app-card)] px-7 py-10 text-center shadow-[0_10px_34px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4">
        <h2 className="text-[28px] font-semibold text-[var(--app-text)]">
          {text.languageTitle}
        </h2>

        <p className="text-[16px] text-[var(--app-muted)]">
          {text.languageSubtitle}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-[13px]">
        <button
          type="button"
          onClick={() => handleSelectLoginLanguage('zh-TW')}
          className="flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--app-text)] text-[17px] font-medium text-[var(--app-bg)] shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition hover:opacity-90 active:scale-[0.98]"
        >
          繁體中文
        </button>

        <button
          type="button"
          onClick={() => handleSelectLoginLanguage('en')}
          className="flex h-[52px] w-full items-center justify-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-surface)]/55 text-[17px] font-medium text-[var(--app-text)] shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition hover:bg-[var(--app-surface)]/75 active:scale-[0.98]"
        >
          English
        </button>
      </div>
    </div>
  </div>
)}

      {isAuthModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-6">
    <div className="w-full max-w-[360px] rounded-[36px] bg-[var(--app-card)] px-7 py-10 text-center shadow-[0_10px_34px_rgba(0,0,0,0.18)]">

      <div className="flex flex-col gap-4">
        <h2 className="text-[28px] font-semibold text-[var(--app-text)]">
          {text.loginTitle}
        </h2>

        <p className="text-[16px] text-[var(--app-muted)]">
          {text.loginSubtitle}
        </p>
      </div>

      {authErrorMessage && (
        <p className="mt-6 rounded-[18px] bg-red-500/10 px-4 py-3 text-[14px] font-medium text-red-500">
          {authErrorMessage}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-[13px]">
        <button
          type="button"
          disabled={authLoading}
          onClick={handleGoogleLogin}
          className="flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--app-text)] text-[17px] font-medium text-[var(--app-bg)] shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {authLoading
    ? text.loggingIn
    : text.googleLoginButton}
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthErrorMessage('')
            setShowEmailLogin((prev) => !prev)
          }}
          className="flex h-[52px] w-full items-center justify-center rounded-full border border-[var(--app-card-border)] bg-[var(--app-surface)]/55 text-[17px] font-medium text-[var(--app-text)] shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition hover:bg-[var(--app-surface)]/75 active:scale-[0.98]"
        >
          {text.emailLoginButton}
        </button>
      </div>

      {showEmailLogin && (
        <div className="mt-6">
          <EmailOtpLogin />
        </div>
      )}
    </div>
  </div>
)}

<AIRadarTopBar
  showTopBar={showTopBar}
  onClickAIRadarInfo={handleOpenAIRadarInfo}
  onClickVibePlus={handleOpenVibePlus}
/>

<AnimatePresence>
  {showNewUserUploadGuide && !isAuthModalOpen && (
    <motion.div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
          y: 24,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 12,
        }}
        transition={{
          duration: 0.28,
        }}
        className="
          w-full
          max-w-[360px]
          rounded-[34px]
          bg-[var(--app-card)]
          px-7
          py-8
          text-center
          shadow-[0_10px_34px_rgba(0,0,0,0.22)]
        "
      >
        <div className="mb-5 text-[52px]">
          ✨
        </div>

        <h2 className="text-[24px] font-semibold text-[var(--app-text)]">
          {text.uploadGuideTitle}
        </h2>

        <p className="mt-4 text-[15px] leading-[1.7] text-[var(--app-muted)]">
          {text.uploadGuideSubtitle}
        </p>

        <button
          type="button"
          onClick={() => {
            setShowNewUserUploadGuide(false)

            window.dispatchEvent(
              new CustomEvent('vibelink-open-upload')
            )
          }}
          className="
            mt-7
            h-[54px]
            w-full
            rounded-full
            bg-[#c86cff]
            text-[16px]
            font-semibold
            text-white
            shadow-[0_10px_26px_rgba(200,108,255,0.35)]
            transition
            active:scale-[0.98]
          "
        >
          {text.uploadContent}
        </button>

        <button
          type="button"
          onClick={() =>
            setShowNewUserUploadGuide(false)
          }
          className="
            mt-4
            text-[14px]
            text-[var(--app-muted)]
          "
        >
          {text.later}
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Main content */}
      <main
  style={{
    touchAction: 'pan-y',
    scrollPaddingTop: 'calc(env(safe-area-inset-top) + 112px)',
  }}
  ref={mainScrollRef}
  className="h-[100dvh] min-h-[100dvh] touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain bg-[var(--app-bg)] px-4 pt-[calc(env(safe-area-inset-top)+112px)] pb-[calc(210px+env(safe-area-inset-bottom))] text-[var(--app-text)] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
        <div className="flex min-h-[calc(100vh-76px)] flex-col">
         
          {/* suggestions */}

{!loading && !aiText && results.length === 0 && (
  <div className="fixed left-1/2 top-[40%] z-[55] w-full max-w-[430px] -translate-x-1/2 -translate-y-1/2 px-8">
    <AnimatePresence mode="wait">
      {isGeneratingPrompts ? (
        <motion.div
          key="generating-prompts"
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[22px] bg-[var(--app-card)] px-5 py-4 text-center text-[15px] font-semibold text-purple-700 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        >
          {text.loadingPrompts}
        </motion.div>
      ) : (
        <motion.div
          key="starter-prompts"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{
            duration: 0.42,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowAIRadarInfo(true)}
              className={`flex w-full items-center justify-center gap-2 text-[15px] text-[#a855f7] ${promptPillClassName}`}
            >
              <Sparkles size={17} fill="currentColor" />
              <span>{text.heroTitle}</span>
            </button>

            {starterPrompts.map((item, index) => (
              <motion.button
                key={item}
                type="button"
                onClick={() => setInputValue(item)}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.36,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`min-h-[52px] w-full text-[14px] text-[var(--app-text)] ${promptPillClassName}`}
              >
                <span className="block leading-[1.35]">
                  {item}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)}

{/* AI Result 區 */}
<div className="mb-3 space-y-3">
  

  {displayedAiText && (
  <div className="rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] px-4 py-10 text-[14px] leading-[1.45] text-[var(--app-text)] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
    {displayedAiText}
  </div>
)}

{errorType && (
  <div className="rounded-[14px] bg-red-50 px-4 py-3 text-[12px] text-red-500">
    <div>
      {safeLocale === 'en'
        ? 'AI Radar could not complete this search. Please try again.'
        : 'AI 雷達暫時無法完成這次搜尋，請再試一次。'}
    </div>

    <button
      type="button"
      onClick={handleRetry}
      className="mt-2 rounded-full bg-red-100 px-3 py-1 text-[12px] font-medium text-red-600 active:scale-95"
    >
      {text.retry}
    </button>
  </div>
)}


  <AIRadarResultsSection
    showCandidates={showCandidates}
    showWalls={showWalls}
    results={results}
    refreshKey={refreshKey}
    refreshCount={refreshCount}
    getCandidateDescription={getCandidateDescription}
    onTouchStart={stopSwipePropagation}
    onTouchMove={stopSwipePropagation}
    onPointerDown={stopPointerPropagation}
    onPointerMove={stopPointerPropagation}
    onWheel={stopWheelPropagation}
    onOpenProfile={handleOpenProfile}
    onRefresh={handleRefreshMoreWall}
  />
</div>
</div>
</main>
          

<div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-1/2 z-[70] flex w-full max-w-[430px] -translate-x-1/2 flex-col gap-2">
  <div className="flex w-full justify-end gap-4 px-6 pb-1.5">
    <button
      type="button"
      onClick={handleClearInput}
      className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--app-card)]/80 border border-white/10 text-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition active:scale-95"
    >
      <BrushCleaning
  size={22}
  style={{ strokeWidth: 2.2 }}
  className="text-[var(--ai-tool-icon)]"
/>
    </button>

    <button
  type="button"
  onClick={() => {
    setVoiceTranscript('')
    setIsVoicePanelOpen(true)
  }}
      className={`flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--app-card)]/80 border border-white/10 text-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition active:scale-95 ${
  isListening ? 'ring-2 ring-purple-400' : ''
}`}
    >
      <Mic
  size={22}
  style={{ strokeWidth: 2.2 }}
  className="text-[var(--ai-tool-icon)]"
/>
    </button>
  </div>

  <div className="[&_button.h-\[22px\].w-\[22px\]]:!text-black [&_button.h-\[22px\].w-\[22px\]_svg]:!text-black">
    <AIRadarInputBar
      inputValue={inputValue}
      locale={safeLocale}
      setInputValue={setInputValue}
      selectedLibraryUser={selectedLibraryUser}
      setSelectedLibraryUser={setSelectedLibraryUser}
      onOpenPeopleLibrary={handleOpenPeopleLibrary}
      onSubmit={handleInputSubmit}
      hasInput={hasInput}
      targetRef={targetRef}
    />
  </div>
</div>

      {/* People Library */}
      {isPeopleLibraryOpen && (
  <PeopleLibraryPage
  query="People Library"
  locale={safeLocale}
  onClose={() => setIsPeopleLibraryOpen(false)}
  onPickUser={handlePickLibraryUser}
/>
)}
    
    <AnimatePresence>
  {flyingUser && (
    <motion.div
      initial={{
        position: 'fixed',
        top: flyingUser.sourceRect.top,
        left: flyingUser.sourceRect.left,
        width: flyingUser.sourceRect.width,
        height: flyingUser.sourceRect.height,
        borderRadius: 999,
        zIndex: 999,
        opacity: 1,
      }}
      animate={{
        top: flyingUser.targetRect.top,
        left: flyingUser.targetRect.left,
        width: flyingUser.targetRect.width,
        height: flyingUser.targetRect.height,
        borderRadius: 999,
        opacity: 1,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        setSelectedLibraryUser(flyingUser.user)
        setFlyingUser(null)
      }}
      className="pointer-events-none overflow-hidden border border-[var(--app-card-border)] bg-[var(--app-card)] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      <div className="flex h-full w-full items-center gap-2 px-[12px]">
        {flyingUser.user.avatar ? (
  <img
    src={flyingUser.user.avatar}
    alt={flyingUser.user.name}
    className="h-[30px] w-[30px] rounded-full object-cover"
  />
) : (
  <div className="h-[30px] w-[30px] shrink-0 rounded-full bg-[#c893cf]" />
)}
        <span className="min-w-0 truncate text-[13px] text-[var(--app-text)]">
          {flyingUser.user.name}
        </span>
      </div>
    </motion.div>
  )}
</AnimatePresence>

<AIRadarVoiceInput
  open={isVoicePanelOpen}
  transcript={voiceTranscript}
  onClose={() => {
    try {
      recognitionRef.current?.abort?.()
    } catch {}

    setIsListening(false)
    setIsVoicePanelOpen(false)
  }}
  onStart={() => {
    handleVoiceInput()
  }}
  onSend={handleVoiceSubmit}
/>

<AnimatePresence mode="wait">
  {selectedProfileUser && (
    <motion.div
      key={selectedProfileUser.id}
      data-block-page-swipe="true"
      data-no-page-swipe="true"
      className="fixed inset-0 z-[999] bg-[var(--app-bg)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'spring',
        stiffness: 360,
        damping: 34,
      }}
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{
        left: 0,
        right: 0.22,
      }}
      style={{
        touchAction: 'pan-y',
      }}
      onDragEnd={(_, info) => {
        const shouldClose =
          info.offset.x > 80 ||
          info.velocity.x > 420

        if (shouldClose) {
          setSelectedProfileUser(null)
        }
      }}
    >
      <OtherUserProfilePage
        user={selectedProfileUser}
        userId={selectedProfileUser.id}
        locale={safeLocale}
        onClose={() => setSelectedProfileUser(null)}
      />
    </motion.div>
  )}
</AnimatePresence>

<AIRadarInfoSheet
  open={showAIRadarInfo}
  locale={safeLocale}
  onClose={() => setShowAIRadarInfo(false)}
/>
    </>
  )
}
