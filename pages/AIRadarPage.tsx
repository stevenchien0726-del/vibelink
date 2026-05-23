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

import { generateAIRadarRewriteQueries } from '@/lib/ai-radar/generateAIRadarRewriteQueries'
import OtherUserProfilePage from '../components/profile/OtherUserProfilePage'
import type { Locale } from '@/i18n'

import { getAIRadarText } from '@/lib/ai-radar/aiRadarI18n'

type AIRadarPageProps = {
  locale: Locale
}

export default function AIRadarPage({ locale }: AIRadarPageProps) {
  const safeLocale: Locale = locale ?? 'zh-TW'
const text = getAIRadarText(safeLocale)

  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshCount, setRefreshCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

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

const [showTopBar, setShowTopBar] = useState(true)

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
  async function loadStarterPrompts() {
    setIsGeneratingPrompts(true)
    
    try {
      const response = await withTimeout(
  fetch(
  `/api/ai-radar/starter-prompts?locale=${safeLocale}`
),
12000,
'ai_radar_starter_prompts'
)

if (!response) return

const data = await response.json()

      if (Array.isArray(data?.prompts) && data.prompts.length > 0) {
  setStarterPrompts(data.prompts)
}

    } catch (error) {
      console.error(
        'loadStarterPrompts failed:',
        error
      )
    } finally {
      setIsGeneratingPrompts(false)
    }
  }

  loadStarterPrompts()
}, [])

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
      } else {
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

  function typeText(text: string, onDone?: () => void) {
  setDisplayedAiText('')
  let index = 0

  const timer = setInterval(() => {
    index += 1
    setDisplayedAiText(text.slice(0, index))

    if (index >= text.length) {
      clearInterval(timer)
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
  if (loading || isLoading) return
  if (!lastQuery) return

  setInputValue(lastQuery)

  setTimeout(() => {
    handleSubmit()
  }, 100)
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

function getCandidateDescription(user: any) {
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
      return `${name}'s content is close to your search direction, with a natural lifestyle vibe and an energy that feels easy to connect with.`
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
    return `${name} 的內容和你的搜尋方向很接近，整體氛圍看起來自然、有生活感，也比較容易產生共鳴。`
  }

  if (
    tags.includes('nightlife') ||
    tags.includes('techno') ||
    tags.includes('rave') ||
    tags.includes('dj')
  ) {
    return `${name} 偏音樂派對與夜生活 vibe，照片裡有不少活動感與社交氛圍，整體能量感比較強。`
  }

  if (
    tags.includes('gym') ||
    tags.includes('fitness') ||
    tags.includes('workout')
  ) {
    return `${name} 的內容偏運動與戶外生活感，整體給人比較自律、有活力，也帶一點陽光系氛圍。`
  }

  if (
    tags.includes('coffee') ||
    tags.includes('cafe') ||
    tags.includes('book')
  ) {
    return `${name} 的照片有不少咖啡廳與生活日常感，整體氛圍偏安靜、慢節奏，帶一點文青氣質。`
  }

  if (
    tags.includes('dance') ||
    tags.includes('kpop')
  ) {
    return `${name} 偏舞蹈與韓系 vibe，內容看起來比較活潑，也有一點小網紅感。`
  }

  if (
    tags.includes('cat') ||
    tags.includes('dog') ||
    tags.includes('pet')
  ) {
    return `${name} 的內容有不少寵物與日常生活感，整體氛圍比較柔和、安靜，也帶有一點療癒感。`
  }

  if (
    tags.includes('beach') ||
    tags.includes('travel')
  ) {
    return `${name} 的照片偏旅行與戶外探索感，整體像是喜歡自由生活與體驗新事物的人。`
  }

  return `${name} 的內容和你的搜尋方向有部分重疊，整體 vibe 看起來自然舒服，也有一定程度的生活感。`
}

    const handleSubmit = async () => {
  if (loading || isLoading) return
  if (!hasInput && !selectedLibraryUser) return

    setIsLoading(true)

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

  const currentInput = inputValue.trim()
const finalQuery =
  currentInput ||
  (selectedLibraryUser
    ? text.similarToUserPrompt(selectedLibraryUser.name)
    : '')
  setLastQuery(finalQuery)

    let data: any = null

try {
  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 20000)

  const queryLocale =
  /[a-zA-Z]/.test(finalQuery) && !/[一-龥]/.test(finalQuery)
    ? 'en'
    : safeLocale

const response = await fetch('/api/ai-radar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
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

  console.log('🟣 [AI Radar Frontend] response status:', response.status)

const rawText = await response.text()

console.log('🟣 [AI Radar Frontend] raw response:', rawText)

try {
  data = JSON.parse(rawText)

  console.log('🟢 [AI Radar Frontend] parsed data:', data)
} catch (jsonError) {
  console.error(
    '🔴 [AI Radar Frontend] JSON parse failed:',
    jsonError
  )

  setErrorType('JSON_PARSE_FAILED')

data = {
  ok: false,
  matchedUsers: [],
  aiReply: 'AI 雷達目前回傳格式異常，請再試一次。',
}
}
} catch (error: any) {
  console.error('🔴 [AI Radar Frontend] API failed:', error)

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
        ? 'AI 雷達這次回應太久，請再試一次。'
        : 'AI 雷達目前連線不穩，請再試一次。',
  }
}

setTimeout(async () => {
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
    `目前沒有找到完全符合「${finalQuery}」的用戶，你可以換更簡短的描述再試一次。`
}

    setAiText(nextAiText)
    setLoading(false)
        setIsLoading(false)

    typeText(nextAiText, () => {
  if (matchedUsers.length > 0) {
    setResults(matchedUsers as any)

    setTimeout(() => {
      setShowCandidates(true)
    }, 120)

    setTimeout(() => {
      setShowWalls(true)
    }, 260)

    setTimeout(() => {
      setShowMorePrompts(true)
    }, 420)
  } else {
    setShowMorePrompts(true)
  }

})
    } catch (renderError) {
    console.error('AI Radar render failed:', renderError)
    setLoading(false)
    setIsLoading(false)
    setErrorType('RENDER_FAILED')
    setAiText('AI 雷達顯示結果時發生問題，請再試一次。')
    setDisplayedAiText('AI 雷達顯示結果時發生問題，請再試一次。')
  }
}, 900)
}

  return (
    <>
      <AIRadarLoadingOverlay open={isLoading} />

      {isAuthModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-6 backdrop-blur-[10px]">
    <div className="w-full max-w-[360px] rounded-[36px] bg-[var(--app-card)] px-7 py-9 text-center shadow-[0_18px_60px_rgba(0,0,0,0.22)]">

      <h2 className="text-[28px] font-semibold text-[var(--app-text)]">
        {text.loginTitle}
      </h2>

      <p className="mt-4 text-[16px] text-[var(--app-muted)]">
        {text.loginSubtitle}
      </p>

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
    </div>
  </div>
)}

<AIRadarTopBar
  showTopBar={showTopBar}
  onClickVibePlus={() => openLink(MEMBERSHIP_URL)}
/>

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
    <div>Debug：{errorType}</div>

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

      setTimeout(() => {
        handleSubmit()
      }, 100)
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
      className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/18 border border-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-[14px] transition active:scale-95"
    >
      <BrushCleaning
  size={22}
  strokeWidth={2.2}
  className="text-[var(--ai-tool-icon)]"
/>
    </button>

    <button
      type="button"
      onClick={handleVoiceInput}
      className={`flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/18 border border-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-[14px] transition active:scale-95 ${
  isListening ? 'ring-2 ring-purple-400' : ''
}`}
    >
      <Mic
  size={22}
  strokeWidth={2.2}
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

<AnimatePresence>
  {selectedProfileUser && (
    <motion.div
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
