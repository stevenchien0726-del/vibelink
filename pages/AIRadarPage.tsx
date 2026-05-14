'use client'

import { useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { ensureUserProfile } from '@/lib/profile'

import { AnimatePresence, motion } from 'framer-motion'

import { BrushCleaning, Mic, Sparkles } from 'lucide-react'

import PeopleLibraryPage from '@/components/home/sections/people/PeopleLibraryPage'
import { FakeUser } from '../data/fakeUsers'

import { MEMBERSHIP_URL, openLink } from '@/lib/links'

import { SKY_LIBRARY_RESULTS } from '@/lib/mockSkyLibrary'
import AIRadarLoadingOverlay from '@/components/airadar/AIRadarLoadingOverlay'
import AIRadarMoreWall from '@/components/airadar/AIRadarMoreWall'

import AIRadarResultCard from '@/components/airadar/AIRadarResultCard'
import AIRadarPromptList from '@/components/airadar/AIRadarPromptList'

import AIRadarTopBar from '@/components/airadar/AIRadarTopBar'
import AIRadarInputBar from '@/components/airadar/AIRadarInputBar'

import { generateAIRadarRewriteQueries } from '@/lib/ai-radar/generateAIRadarRewriteQueries'
import OtherUserProfilePage from '../components/profile/OtherUserProfilePage'
import type { Locale } from '@/i18n'

type AIRadarPageProps = {
  locale: Locale
}

const aiRadarText = {
  'zh-TW': {
    loginTitle: '登入 Vibelink',
    loginSubtitle: '登入後即可使用 AI 雷達與完整功能',
    loginButton: 'GOOGLE 登入',
    loggingIn: '登入中...',
    heroTitle: 'AI雷達：想找什麼Vibe的人?',
    retry: '重新搜尋',
    rewriteTitle: '你也可以試試這樣問',
    suggestions: [
      '幫我找可愛奶狗弟弟',
      '喜歡大自然的女生',
      '身材性感內建男模特',
    ],
  },

  en: {
    loginTitle: 'Log in to Vibelink',
    loginSubtitle: 'Log in to use AI Radar and all features',
    loginButton: 'Continue with Google',
    loggingIn: 'Logging in...',
    heroTitle: 'AI Radar: What kind of vibe are you looking for?',
    retry: 'Search again',
    rewriteTitle: 'You can also try asking',
    suggestions: [
      'Find me a cute softboy',
      'Girls who love nature',
      'Sexy model-type guys',
    ],
  },
} as const

const SKY_USER_ANALYSIS: Record<string, string> = {
  'sky-match-1':
    '整體偏自然戶外與公路旅行感，聊天節奏慢，給人的感覺比較穩、比較耐看，也更像會陪你往外走走的人。',
  'sky-match-2':
    '山景與慢生活感很重，照片裡有一種成熟但不高冷的距離感，比較像是能安靜聊天、慢慢熟起來的類型。',
  'sky-match-3':
    '海風感和舒服感比較強，整體氣質偏溫和療癒，不是高刺激型，而是容易讓人放鬆、願意多聊幾句的類型。',
}

const SKY_MORE_PROMPTS = [
  '幫我找比 Sky_07_21 更成熟一點的人',
  '找和 Sky_07_21 一樣自然感強但更主動聊天的人',
  '找偏安靜、戶外感、適合慢慢熟起來的人',
]

const SKY_MORE_WALL_IMAGES = [
  '/sky-more/1.jpg',
  '/sky-more/2.jpg',
  '/sky-more/3.jpg',
  '/sky-more/4.jpg',
  '/sky-more/5.jpg',
]

export default function AIRadarPage({ locale }: AIRadarPageProps) {
  const safeLocale: Locale = locale ?? 'zh-TW'
const text = aiRadarText[safeLocale]

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

const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null)

const [displayedAiText, setDisplayedAiText] = useState('')
const [showCandidates, setShowCandidates] = useState(false)
const [showWalls, setShowWalls] = useState(false)
const [showMorePrompts, setShowMorePrompts] = useState(false)
const [rewritePrompts, setRewritePrompts] = useState<string[]>([])

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

  useEffect(() => {
  async function initAuth() {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user ?? null

    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    setIsAuthModalOpen(false)
    await ensureUserProfile()
  }

  initAuth()

  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session) {
        setIsAuthModalOpen(false)
        await ensureUserProfile()
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

const isSkySeedSearch = selectedLibraryUser?.id === 'user-1'

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
    alert('目前瀏覽器不支援語音輸入，建議使用 Chrome 測試。')
    return
  }

  const recognition = new SpeechRecognition()

  recognition.lang = 'zh-TW'
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
  const tagText = tags.slice(0, 3).join('、')

  if (tags.includes('nightlife') || tags.includes('techno') || tags.includes('rave') || tags.includes('dj')) {
    return `${user.display_name} 偏夜生活與音樂派對感，標籤包含 ${tagText}，適合喜歡高能量社交的人。`
  }

  if (tags.includes('gym') || tags.includes('fitness') || tags.includes('workout')) {
    return `${user.display_name} 偏健身與運動生活感，標籤包含 ${tagText}，整體比較自律、有活力。`
  }

  if (tags.includes('coffee') || tags.includes('cafe')) {
    return `${user.display_name} 偏咖啡與生活感，標籤包含 ${tagText}，整體氛圍比較日常、放鬆。`
  }

  if (tags.includes('dance') || tags.includes('kpop')) {
    return `${user.display_name} 偏舞蹈與韓系感，標籤包含 ${tagText}，互動氛圍比較活潑。`
  }

  return `${user.display_name} 和你的搜尋條件有部分重疊，標籤包含 ${tagText}。`
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
    ? `以 ${selectedLibraryUser.name} 為參考，幫我找生活風格、照片氣質、互動感和整體 Vibe 相似的人`
    : '')
  setLastQuery(finalQuery)

    let data: any = null

try {
  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 15000)

  const response = await fetch('/api/ai-radar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: finalQuery,
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
  const matchedUsers = isSkySeedSearch
    ? SKY_LIBRARY_RESULTS
    : data?.matchedUsers ?? []

  const aiReplyText = data?.aiReply ?? ''
  const nextRewritePrompts = generateAIRadarRewriteQueries(
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
  if (isSkySeedSearch) {
    nextAiText =
      '我幫你從「Sky_07_21」延伸找出幾位更偏自然感、安靜成熟、旅行與慢節奏氛圍的用戶。這次不是找同一種可愛互動型，而是往更耐看、比較適合長聊天與真實相處感的方向去擴散。'
  } else if (selectedLibraryUser) {
  nextAiText = `我用「${selectedLibraryUser.name}」當作參考基準，幫你延伸找出幾位相似 Vibe 的用戶。這次會更看重生活風格、照片氣質、互動感和整體氛圍，而不是只比對單一標籤。`
} else {
    nextAiText = aiReplyText
  }
} else {
  if (isSkySeedSearch) {
    nextAiText =
      '目前沒有找到完全符合 Sky_07_21 延伸方向的用戶，你可以再補一句像是「更成熟」、「更安靜」、「更有戶外感」這類描述。'
  } else if (selectedLibraryUser) {
  nextAiText = `我目前還沒找到和「${selectedLibraryUser.name}」足夠接近的用戶。你可以再補一句方向，例如「更成熟一點」、「更可愛一點」、「更會聊天」或「照片風格更像 IG 小網紅」。`
} else {
    nextAiText = `目前沒有找到完全符合「${finalQuery}」的用戶，你可以換更簡短的描述再試一次。`
  }
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
  }, 900)
}

  return (
    <>
      <AIRadarLoadingOverlay open={isLoading} />

      {isAuthModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-6 backdrop-blur-[10px]">
    <div className="w-full max-w-[360px] rounded-[36px] bg-white px-7 py-9 text-center shadow-[0_18px_60px_rgba(0,0,0,0.22)]">

      <h2 className="text-[28px] font-semibold text-[#222]">
        {text.loginTitle}
      </h2>

      <p className="mt-4 text-[16px] text-[#888]">
        {text.loginSubtitle}
      </p>

      <button
        type="button"
        disabled={authLoading}
        onClick={handleGoogleLogin}
        className="mt-8 flex h-[54px] w-full items-center justify-center rounded-full bg-white text-[18px] font-medium text-[#111] shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition active:scale-[0.98] disabled:opacity-60"
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
  ref={mainScrollRef}
  className="h-screen overflow-y-auto px-4 pt-[76px] pb-[170px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
        <div className="flex min-h-[calc(100vh-76px)] flex-col">
         
          {/* suggestions */}

{!loading && !aiText && results.length === 0 && (
  <div className="fixed left-1/2 top-[40%] z-[55] w-full max-w-[430px] -translate-x-1/2 -translate-y-1/2 px-8">
    <div className="mb-6 flex items-center justify-center gap-2 rounded-[18px] bg-white px-4 py-3 text-center text-[15px] font-semibold text-purple-700 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
      <Sparkles size={17} fill="currentColor" />
      <span>{text.heroTitle}</span>
    </div>

    <div className="flex flex-col gap-3">
      {text.suggestions.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setInputValue(item)}
          className="min-h-[52px] rounded-[18px] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-center shadow-[0_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-[8px] transition active:scale-[0.98]"
        >
          <span className="block text-[14px] leading-[1.35] text-[#111]">
            {item}
          </span>
        </button>
      ))}
    </div>
  </div>
)}

{/* AI Result 區 */}
<div className="mb-3 space-y-3">
  

  {displayedAiText && (
  <div className="rounded-[18px] bg-[#ead8f5] px-4 py-10 text-[14px] leading-[1.45] text-[#3f2c4f] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
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
    setSelectedProfileUserId(user.id)
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
  isSkySeedSearch={isSkySeedSearch}
  skyImages={SKY_MORE_WALL_IMAGES}
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
  prompts={
    isSkySeedSearch
      ? SKY_MORE_PROMPTS
      : rewritePrompts.length > 0
        ? rewritePrompts
        : [
            '幫我找更成熟一點的奶狗男生',
            '找夜生活但個性溫柔的人',
            '想找高互動感、會主動聊天的人',
          ]
  }
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
      className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/35 text-black shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-[14px] transition active:scale-95"
    >
      <BrushCleaning size={22} strokeWidth={2} />
    </button>

    <button
      type="button"
      onClick={handleVoiceInput}
      className={`flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white/35 text-black shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-[14px] transition active:scale-95 ${
        isListening ? 'ring-2 ring-purple-400' : ''
      }`}
    >
      <Mic size={22} strokeWidth={2} />
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
      className="pointer-events-none overflow-hidden bg-[#D9D9D9] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
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
        <span className="min-w-0 truncate text-[13px] text-[#222]">
          {flyingUser.user.name}
        </span>
      </div>
    </motion.div>
  )}
</AnimatePresence>

<AnimatePresence>
  {selectedProfileUserId && (
    <OtherUserProfilePage 
  userId={selectedProfileUserId}
  onClose={() => setSelectedProfileUserId(null)}
  locale={safeLocale}
/>
  )}
</AnimatePresence>
    </>
  )
}
