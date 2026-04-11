'use client'

import { useMemo, useState } from 'react'
import {
  Check,
  X,
  Film,
  Heart,
  BookOpen,
} from 'lucide-react'

const plans = [
  {
    id: 'basic',
    name: 'Vibe Basic',
    price: 160,
    accent: 'from-fuchsia-300 to-pink-300',
    recommended: false,
    features: {
      vibeTv: [
        { label: '可觀看 Vibe TV 所有內容', included: true },
        { label: '畫質最高 720P', included: true },
        { label: '最多2部裝置同時觀看', included: true },
        { label: 'Vibe TV零廣告體驗', included: false },
      ],
      vibelink: [
        { label: 'AI 找人幫手無限使用', included: false },
        { label: '每日 Right now 30 分', included: true },
        { label: 'Vibelink 零廣告體驗', included: false },
      ],
      vibebook: [{ label: '無限閱讀', included: false }],
    },
  },
  {
    id: 'plus',
    name: 'Vibe Plus',
    price: 320,
    accent: 'from-fuchsia-400 to-pink-400',
    recommended: false,
    features: {
      vibeTv: [
        { label: '可觀看 Vibe TV 所有內容', included: true },
        { label: '畫質最高 1080P', included: true },
        { label: '最多3部裝置同時觀看', included: true },
        { label: 'Vibe TV零廣告體驗', included: true },
      ],
      vibelink: [
        { label: 'AI 找人幫手無限使用', included: true },
        { label: '每日 Right now 60 分', included: true },
        { label: 'Vibelink 零廣告體驗', included: false },
      ],
      vibebook: [{ label: '無限閱讀', included: false }],
    },
  },
  {
    id: 'premium',
    name: 'Vibe Premium',
    price: 450,
    accent: 'from-fuchsia-500 to-pink-500',
    recommended: true,
    features: {
      vibeTv: [
        { label: '可觀看 Vibe TV 所有內容', included: true },
        { label: '畫質最高 4K', included: true },
        { label: '最多4部裝置同時觀看', included: true },
        { label: 'Vibe TV零廣告體驗', included: true },
      ],
      vibelink: [
        { label: 'AI 找人幫手無限使用', included: true },
        { label: '每日 Right now 120 分', included: true },
        { label: 'Vibelink 零廣告體驗', included: true },
      ],
      vibebook: [{ label: '無限閱讀', included: true }],
    },
  },
] as const

type PlanId = (typeof plans)[number]['id']
type SubscriptionStatus = 'active' | 'paused' | 'cancelled'

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 text-[18px] ${
        included ? 'text-white' : 'text-white/60'
      }`}
    >
      <div className="mt-[2px] shrink-0">
        {included ? (
          <Check className="h-5 w-5 text-white" strokeWidth={3} />
        ) : (
          <X className="h-5 w-5 text-white/60" />
        )}
      </div>
      <span>{label}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  let icon = null

  if (children === 'Vibe TV') {
    icon = <Film className="h-5 w-5 text-current" />
  } else if (children === 'Vibelink') {
    icon = <Heart className="h-5 w-5 text-current" />
  } else if (children === 'VIBEBOOK') {
    icon = <BookOpen className="h-5 w-5 text-current" />
  }

  return (
    <div className="flex items-center gap-2 text-[18px] font-semibold italic text-white">
      {icon}
      <span>{children}</span>
    </div>
  )
}

function PlanCard({
  plan,
  currentPlan,
  selectedPlan,
  onSelect,
}: {
  plan: (typeof plans)[number]
  currentPlan: PlanId
  selectedPlan: PlanId
  onSelect: (planId: PlanId) => void
}) {
  const isCurrent = currentPlan === plan.id
  const isSelected = selectedPlan === plan.id

  return (
    <div
      className={`relative rounded-[26px] border border-white/15 bg-gradient-to-br from-[#22152f]/80 via-[#120f1d]/78 to-black/78 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200
      ${plan.id === 'premium' ? 'ring-2 ring-fuchsia-500/80 shadow-[0_12px_48px_rgba(217,70,239,0.18)] scale-[1.02]' : ''}
      ${isSelected ? 'border-fuchsia-400/50' : ''}`}
    >
      <div className="mb-4">
  <div className="text-[20px] font-semibold text-white tracking-wide">
    <span className="text-white">{plan.name}</span>
    <span className="text-white/70"> : </span>
    <span className="text-white">{plan.price}NTD</span>
    <span className="text-white/60"> / 每月</span>
  </div>
</div>

      <div className="space-y-4">
        <div className="space-y-3 border-t border-white/12 pt-4">
          <SectionTitle>Vibe TV</SectionTitle>
          {plan.features.vibeTv.map((feature) => (
            <FeatureRow key={feature.label} {...feature} />
          ))}
        </div>

        <div className="space-y-3 border-t border-white/12 pt-4">
          <SectionTitle>Vibelink</SectionTitle>
          {plan.features.vibelink.map((feature) => (
            <FeatureRow key={feature.label} {...feature} />
          ))}
        </div>

        <div className="space-y-3 border-t border-white/12 pt-4">
          <SectionTitle>VIBEBOOK</SectionTitle>
          {plan.features.vibebook.map((feature) => (
            <FeatureRow key={feature.label} {...feature} />
          ))}
        </div>
      </div>

      <button
        onClick={() => onSelect(plan.id)}
        className={`mt-6 h-12 w-full rounded-full text-[16px] font-semibold transition-all ${
          isCurrent
            ? 'bg-white/10 text-white/45 border border-white/10'
            : 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:scale-[1.01] shadow-[0_8px_24px_rgba(217,70,239,0.28)]'
        }`}
      >
        {isCurrent ? '目前使用中' : '選擇此方案'}
      </button>
    </div>
  )
}

export default function Page() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('premium')
  const [currentPlan, setCurrentPlan] = useState<PlanId>('premium')
  const [status, setStatus] = useState<SubscriptionStatus>('active')
  const [autoRenew, setAutoRenew] = useState(true)
  const [billingCycle] = useState<'monthly'>('monthly')

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === currentPlan) ?? plans[2],
    [currentPlan]
  )

  const selectedPlanInfo = useMemo(
    () => plans.find((plan) => plan.id === selectedPlan) ?? plans[2],
    [selectedPlan]
  )

  const nextBillingDate = '2026 / 04 / 28'
  const subscribedVia = '外部官網訂閱'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),_transparent_28%),linear-gradient(180deg,_#16101f_0%,_#09090d_55%,_#040405_100%)] text-white">
      <div className="mx-auto w-full max-w-[430px] px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Vibe Membership
            </h1>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/12 bg-gradient-to-br from-[#241630]/78 via-[#12111a]/72 to-black/72 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold text-white">
                  目前會員狀態
                </div>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  status === 'active'
  ? 'bg-fuchsia-500/10 text-fuchsia-200 border border-fuchsia-400/20'
                    : status === 'paused'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-400/20'
                      : 'bg-white/10 text-white/60 border border-white/10'
                }`}
              >
                {status === 'active' ? '使用中' : status === 'paused' ? '已暫停' : '已取消'}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="mb-1 text-sm text-white/55">目前方案</div>
                <div className="text-lg font-bold text-white">{activePlan.name}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="mb-1 text-sm text-white/55">下次扣款日</div>
                <div className="text-lg font-bold text-white">{nextBillingDate}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">選擇或切換會員方案</h2>
              </div>
            </div>

            <div className="flex flex-col gap-5 pb-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  currentPlan={currentPlan}
                  selectedPlan={selectedPlan}
                  onSelect={setSelectedPlan}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/12 bg-gradient-to-br from-[#241630]/78 via-[#12111a]/72 to-black/72 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div className="mb-3 text-lg font-semibold text-white">續訂與付款方式</div>

              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <div>
                  <div className="font-medium text-white">自動續訂</div>
                  <div className="text-sm text-white/55">到期後自動延續目前方案或取消</div>
                </div>
                <button
                  onClick={() => setAutoRenew((prev) => !prev)}
                  className={`relative h-7 w-14 rounded-full transition ${
                    autoRenew ? 'bg-fuchsia-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      autoRenew ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="text-sm text-white/55">付款方式</div>
                  <div className="mt-1 font-semibold text-white">Visa •••• 0726</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="text-sm text-white/55">發票與帳單</div>
                  <div className="mt-1 font-semibold text-white">可下載 PDF / Email 寄送</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}