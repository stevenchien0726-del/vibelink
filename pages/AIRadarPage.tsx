'use client'

import { useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/profile'

import { AnimatePresence, motion } from 'framer-motion'

import { BrushCleaning, Mic, Sparkles } from 'lucide-react'

import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'
import { FakeUser } from '../data/fakeUsers'

import { MEMBERSHIP_URL, openLink } from '@/lib/links'

import AIRadarLoadingOverlay from '@/components/airadar/AIRadarLoadingOverlay'
import AIRadarMoreWall from '@/components/airadar/AIRadarMoreWall'

import AIRadarResultCard from '@/components/airadar/AIRadarResultCard'
import AIRadarPromptList from '@/components/airadar/AIRadarPromptList'

import AIRadarTopBar from '@/components/airadar/AIRadarTopBar'
import AIRadarInputBar from '@/components/airadar/AIRadarInputBar'

import EmailOtpLogin from '@/components/auth/EmailOtpLogin'

import { generateAIRadarRewriteQueries } from '@/lib/ai-radar/generateAIRadarRewriteQueries'
import OtherUserProfilePage from '../components/profile/OtherUserProfilePage'
import type { Locale } from '@/i18n'

import { getAIRadarText } from '@/lib/ai-radar/aiRadarI18n'

import AIRadarVoiceInput from '@/components/airadar/AIRadarVoiceInput'

type AIRadarPageProps = {
  locale: Locale
}

export default function AIRadarPage({ locale }: AIRadarPageProps) {
  const safeLocale: Locale = locale ?? 'zh-TW'
const text = getAIRadarText(safeLocale)
const FALLBACK_STARTER_PROMPTS_POOL =
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
      ]

function getRandomStarterPrompts() {
  const shuffled = [...FALLBACK_STARTER_PROMPTS_POOL].sort(
    () => Math.random() - 0.5
  )

  return shuffled.slice(0, 3)
}

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshCount, setRefreshCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false)
const [voiceTranscript, setVoiceTranscript] = useState('')

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
const [authLoading, setAuthLoading] = useState(false)

  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)

  const [loading, setLoading] = useState(false)
const [results, setResults] = useState<FakeUser[]>([])
const [aiText, setAiText] = useState('')
const [errorType, setErrorType] = useState('')
const [lastQuery, setLastQuery] = useState('')

const [selectedProfileUser, setSelectedProfileUser] =
  useState<any | null>(null)

const [displayedAiText, setDisplayedAiText] = useState('')
const [showCandidates, setShowCandidates] = useState(false)
const [showWalls, setShowWalls] = useState(false)
const [showMorePrompts, setShowMorePrompts] = useState(false)
const [rewritePrompts, setRewritePrompts] = useState<string[]>([])

const [starterPrompts, setStarterPrompts] = useState<string[]>([])
const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(true)

const [warmImages, setWarmImages] = useState<string[]>([])

const [homeWarmImages, setHomeWarmImages] = useState<string[]>([])
const [homeWarmVideos, setHomeWarmVideos] = useState<string[]>([])

const [showTopBar, setShowTopBar] = useState(true)
const [showNewUserUploadGuide, setShowNewUserUploadGuide] = useState(false)

  const loadingTexts =
  safeLocale === 'en'
    ? [
        'AI is scanning new vibes...',
        'Matched users found...',
        'Preparing results...',
      ]
    : [
        'AI 正在掃描新的 vibe...',
        '已找到匹配用戶...',
        '準備生成中...',
      ]

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
const inFlightRef = useRef(false)
const activeQueryRef = useRef('')
const activeAbortControllerRef = useRef<AbortController | null>(null)
const requestSequenceRef = useRef(0)
const requestTimersRef = useRef<number[]>([])
const typingTimerRef = useRef<number | null>(null)

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
  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => {
      window.setTimeout(() => {
        console.warn(`${label} timeout`)
        resolve(null)
      }, ms)
    }),
  ])
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
  const timer = window.setTimeout(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          post_images (
            image_url
          )
        `)
        .not('post_images', 'is', null)
        .limit(40)

      if (error) {
        console.warn('AI Radar warm images failed:', error)
        return
      }

      const images =
        data
          ?.flatMap((post: any) =>
            post.post_images?.map((img: any) => img.image_url) ?? []
          )
          .filter(Boolean)
          .slice(0, 12) ?? []

      setWarmImages(images)
    } catch (error) {
      console.warn('AI Radar warm image preload failed:', error)
    }
  }, 900)

  return () => window.clearTimeout(timer)
}, [])

useEffect(() => {
  const timer = window.setTimeout(async () => {
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          post_images (
            image_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      const { data: videosData } = await supabase
        .from('short_videos')
        .select(`
          id,
          video_url,
          thumbnail_url
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      const images =
        postsData
          ?.flatMap((post: any) =>
            post.post_images?.map((img: any) => img.image_url) ?? []
          )
          .filter(Boolean)
          .slice(0, 12) ?? []

      const videoUrls =
        videosData
          ?.map((video: any) => video.video_url)
          .filter(Boolean)
          .slice(0, 3) ?? []

      setHomeWarmImages(images)
      setHomeWarmVideos(videoUrls)
    } catch (error) {
      console.warn('Home feed warmup failed:', error)
    }
  }, 900)

  return () => window.clearTimeout(timer)
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

      if (!response?.ok) {
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
  async function initAuth() {
    const {
  data: { session },
} = await supabase.auth.getSession()

const user = session?.user

    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    setIsAuthModalOpen(false)

void safeTask(
  () => ensureUserProfile(),
  'ai_radar_ensure_profile'
)

const { count, error } = await supabase
  .from('posts')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', user.id)

if (!error && (count ?? 0) === 0) {
  setShowNewUserUploadGuide(true)
} else {
  setShowNewUserUploadGuide(false)
}
  }

  initAuth()

  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session) {
  setIsAuthModalOpen(false)

  void safeTask(
    () => ensureUserProfile(),
    'ai_radar_auth_ensure_profile'
  )

  const user = session.user

  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (!error && (count ?? 0) === 0) {
    setShowNewUserUploadGuide(true)
  } else {
    setShowNewUserUploadGuide(false)
  }
}
      else {
        setIsAuthModalOpen(true)
      }
    }
  )

  return () => {
    listener.subscription.unsubscribe()
  }
}, [])

async function handleGoogleLogin() {
  setAuthLoading(true)

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })

  if (error) {
    console.error('Google 登入失敗:', error)
    setAuthLoading(false)
  }
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

const stopSwipePropagation = (e: React.TouchEvent<HTMLDivElement>) => {
  e.stopPropagation()
}

const stopPointerPropagation = (e: React.PointerEvent<HTMLDivElement>) => {
  e.stopPropagation()
}

const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => {
  e.stopPropagation()
}

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

function handleRetry() {
  if (!lastQuery) return

  setInputValue(lastQuery)
  void handleSubmit(lastQuery)
}

function handleVoiceInput() {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    alert(text.voiceNotSupported)
    return
  }

  const recognition = new SpeechRecognition()

  recognition.lang =
  safeLocale === 'en'
    ? 'en-US'
    : 'zh-TW'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  setIsListening(true)

  recognition.onresult = (event: any) => {
    const transcript = event.results?.[0]?.[0]?.transcript ?? ''

    if (transcript) {
  setVoiceTranscript(transcript)
  setInputValue(transcript)
}
  }

  recognition.onerror = () => {
    setIsListening(false)
  }

  recognition.onend = () => {
  setIsListening(false)
}

  recognition.start()
}

function handleVoiceSubmit() {
  const finalVoiceText = voiceTranscript.trim()

  if (!finalVoiceText) return

  setInputValue(finalVoiceText)
  setIsVoicePanelOpen(false)
  void handleSubmit(finalVoiceText)
}

function getCandidateDescription(user: any) {
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
}

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

  const finishRequest = () => {
  window.clearTimeout(loadingTimer1)
  window.clearTimeout(loadingTimer2)

  setLoading(false)
  setIsLoading(false)

  inFlightRef.current = false

  if (activeAbortControllerRef.current === controller) {
    activeAbortControllerRef.current = null
  }
}

    setIsLoading(true)

    setLoadingStep(0)

const loadingTimer1 = scheduleRequestTimer(() => {
  setLoadingStep(1)
}, 1200, requestId)

const loadingTimer2 = scheduleRequestTimer(() => {
  setLoadingStep(2)
}, 2600, requestId)

  setShowTopBar(true)

  setLoading(true)
  setResults([])
  setRefreshCount(0)
  setAiText('')
  setDisplayedAiText('')
  setErrorType('')

  setShowCandidates(false)
  setShowWalls(false)
  setShowMorePrompts(false)
  setRewritePrompts([])

  setLastQuery(finalQuery)

    let data: any = null

try {
  const timeoutId = scheduleRequestTimer(() => {
    controller.abort()
  }, 20000, requestId)

  const {
    data: { session: radarSession },
  } = await supabase.auth.getSession()

  if (requestSequenceRef.current !== requestId) {
  setLoading(false)
  setIsLoading(false)

  inFlightRef.current = false

  return
}

  if (!radarSession?.access_token) {
    clearTimeout(timeoutId)
    setErrorType('UNAUTHORIZED')

    data = {
      ok: false,
      matchedUsers: [],
      aiReply:
        safeLocale === 'en'
          ? 'Please log in before using AI Radar.'
          : '請先登入後再使用 AI 雷達。',
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

  inFlightRef.current = false

  return
}

  console.log('[AI Radar Frontend] response status:', response.status)

const rawText = await response.text()

if (requestSequenceRef.current !== requestId) {
  setLoading(false)
  setIsLoading(false)

  inFlightRef.current = false

  return
}

console.log('[AI Radar Frontend] raw response:', rawText)

try {
  data = JSON.parse(rawText)

  console.log('[AI Radar Frontend] parsed data:', data)
} catch (jsonError) {
  console.error(
    '[AI Radar Frontend] JSON parse failed:',
    jsonError
  )

  setErrorType('JSON_PARSE_FAILED')

data = {
  ok: false,
  matchedUsers: [],
  aiReply: 'AI 雷達目前回傳格式異常，請再試一次。',
}
}
}
} catch (error: any) {
  if (requestSequenceRef.current !== requestId) {
  setLoading(false)
  setIsLoading(false)

  inFlightRef.current = false

  return
}

  console.error('[AI Radar Frontend] API failed:', error)

  if (error?.name === 'AbortError') {
    setErrorType('TIMEOUT')
  } else {
    setErrorType('NETWORK_FAILED')
  }

  data = {
    ok: false,
    matchedUsers: [],
    aiReply:
      error?.name === 'AbortError'
        ? 'AI 雷達處理時間較久，請再試一次。'
        : 'AI 雷達暫時無法連線，請再試一次。',
  }
}

scheduleRequestTimer(() => {
  if (requestSequenceRef.current !== requestId) {
  setLoading(false)
  setIsLoading(false)

  inFlightRef.current = false

  return
}

  try {
  const matchedUsers = data?.matchedUsers ?? []

  const aiReplyText = data?.aiReply ?? ''
  const nextRewritePrompts =
  data?.rewritePrompts?.length > 0
    ? data.rewritePrompts
    : generateAIRadarRewriteQueries(
        data?.parsedQuery ?? {
          raw: finalQuery,
          tags: [],
          vibes: [],
          keywords: [],
        },
        matchedUsers.length
      )

setRewritePrompts(nextRewritePrompts)

    let nextAiText = ''

if (matchedUsers.length > 0) {
  nextAiText = aiReplyText
} else {
  nextAiText =
    aiReplyText ||
    `目前沒有找到和「${finalQuery}」相關的真實用戶，請換個描述再試一次。`
}

    setAiText(nextAiText)
    window.clearTimeout(loadingTimer1)
window.clearTimeout(loadingTimer2)
    setLoading(false)
        setIsLoading(false)

    if (matchedUsers.length > 0) {
  setResults(matchedUsers as any)

  scheduleRequestTimer(() => {
    setShowCandidates(true)
  }, 120, requestId)

  scheduleRequestTimer(() => {
    setShowWalls(true)
  }, 260, requestId)

  scheduleRequestTimer(() => {
    setShowMorePrompts(true)
  }, 420, requestId)
} else {
  setShowMorePrompts(true)
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
    setErrorType('RENDER_FAILED')
    setAiText('AI 雷達顯示結果時發生問題，請再試一次。')
    setDisplayedAiText('AI 雷達顯示結果時發生問題，請再試一次。')
    inFlightRef.current = false
    activeAbortControllerRef.current = null
  }
}, 320, requestId)
}

  return (
  <>
    <div className="hidden">
  {homeWarmImages
  .filter((src) => !warmImages.includes(src))
  .map((src) => (
    <img
      key={`ai-radar-warm-${src}`}
      src={src}
      alt=""
      loading="eager"
      decoding="async"
    />
  ))}

  {homeWarmImages.map((src) => (
    <img
      key={`home-feed-image-warm-${src}`}
      src={src}
      alt=""
      loading="eager"
      decoding="async"
    />
  ))}

  {homeWarmVideos.map((src) => (
    <video
      key={`home-feed-video-warm-${src}`}
      src={src}
      muted
      playsInline
      preload="metadata"
    />
  ))}
</div>

    <AIRadarLoadingOverlay
  open={isLoading}
  text={loadingTexts[loadingStep]}
/>

      {isAuthModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-6 backdrop-blur-[10px]">
    <div className="w-full max-w-[360px] rounded-[36px] bg-[var(--app-card)] px-7 py-9 text-center shadow-[0_18px_60px_rgba(0,0,0,0.22)]">

      <h2 className="text-[28px] font-semibold text-[var(--app-text)]">
        {text.loginTitle}
      </h2>

      <p className="mt-4 text-[16px] text-[var(--app-muted)]">
        {text.loginSubtitle}
      </p>

      <EmailOtpLogin />

      {false && (
  <button
        type="button"
        disabled={authLoading}
        onClick={handleGoogleLogin}
        className="mt-8 flex h-[54px] w-full items-center justify-center rounded-full bg-[var(--app-card)] text-[18px] font-medium text-[var(--app-text)] shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition active:scale-[0.98] disabled:opacity-60"
      >
        {authLoading
  ? text.loggingIn
  : text.loginButton}
      </button>
      )}
    </div>
  </div>
)}

<AIRadarTopBar
  showTopBar={showTopBar}
  onClickVibePlus={() => openLink(MEMBERSHIP_URL)}
/>

<AnimatePresence>
  {showNewUserUploadGuide && !isAuthModalOpen && (
    <motion.div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-6 backdrop-blur-[10px]"
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
          shadow-[0_18px_60px_rgba(0,0,0,0.28)]
        "
      >
        <div className="mb-5 text-[52px]">
          ✨
        </div>

        <h2 className="text-[24px] font-semibold text-[var(--app-text)]">
          歡迎來到 Vibelink
        </h2>

        <p className="mt-4 text-[15px] leading-[1.7] text-[var(--app-muted)]">
          請先上傳第一篇內容，讓 AI 雷達更容易理解你的 Vibe，
          也讓其他人更容易找到你。
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
          上傳內容
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
          稍後再說
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Main content */}
      <main
  style={{
    touchAction: 'pan-y',
  }}
  ref={mainScrollRef}
  className="h-screen overflow-y-auto bg-[var(--app-bg)] px-4 pt-[76px] pb-[170px] text-[var(--app-text)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
          <div className="mb-6 flex items-center justify-center gap-2 rounded-[18px] bg-[var(--app-card)] px-4 py-3 text-center text-[15px] font-semibold text-purple-700 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
            <Sparkles size={17} fill="currentColor" />
            <span>{text.heroTitle}</span>
          </div>

          <div className="flex flex-col gap-3">
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
                className="min-h-[52px] rounded-[18px] bg-[var(--app-card)] px-4 py-3 text-center shadow-[0_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-[8px] transition active:scale-[0.98]"
              >
                <span className="block text-[14px] leading-[1.35] text-[var(--app-text)]">
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


  {showCandidates && results.length > 0 && (
  <div className="space-y-4">
    {results.slice(0, 2).map((user) => (
      <AIRadarResultCard
        key={user.id}
        user={user}
        getCandidateDescription={getCandidateDescription}
        onTouchStart={stopSwipePropagation}
        onTouchMove={stopSwipePropagation}
        onPointerDown={stopPointerPropagation}
        onPointerMove={stopPointerPropagation}
        onWheel={stopWheelPropagation}
        onOpenProfile={(user) => {
          setSelectedProfileUser(user)
        }}
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

  skyImages={[]}
  onRefresh={() => {
    if (refreshCount >= 2) return

    setIsLoading(true)

    setTimeout(() => {
      setRefreshKey((prev) => prev + 1)
      setRefreshCount((prev) => prev + 1)

      setIsLoading(false)
    }, 1000)
  }}
  onTouchStart={stopSwipePropagation}
  onTouchMove={stopSwipePropagation}
  onPointerDown={stopPointerPropagation}
  onPointerMove={stopPointerPropagation}
  onWheel={stopWheelPropagation}
/>
    
{showMorePrompts && (
  <AIRadarPromptList
  title={text.rewriteTitle}
  variant="rewrite"
  prompts={rewritePrompts}
    onSelectPrompt={(prompt) => {
      setInputValue(prompt)
      void handleSubmit(prompt)
    }}
  />
)}
        </div>
  )}
</div>
</div>
</main>
          

  <div className="fixed bottom-[148px] left-1/2 z-[70] flex w-full max-w-[430px] -translate-x-1/2 justify-end gap-4 pb-1.5 px-6">
    <button
      type="button"
      onClick={handleClearInput}
      className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--app-card)]/18 border border-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-[14px] transition active:scale-95"
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
    handleVoiceInput()
  }}
      className={`flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--app-card)]/18 border border-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-[14px] transition active:scale-95 ${
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

<AIRadarInputBar
  inputValue={inputValue}
  locale={safeLocale}
  setInputValue={setInputValue}
  selectedLibraryUser={selectedLibraryUser}
  setSelectedLibraryUser={setSelectedLibraryUser}
  onOpenPeopleLibrary={() => setIsPeopleLibraryOpen(true)}
  onSubmit={handleSubmit}
  hasInput={hasInput}
  targetRef={targetRef}
/>

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
          info.offset.x > 110 ||
          info.velocity.x > 520

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
    </>
  )
}
