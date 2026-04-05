'use client'

import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Crown,
  ExternalLink,
  HelpCircle,
  Infinity,
  LogOut,
  MonitorPlay,
  PauseCircle,
  PlayCircle,
  Settings,
  Smartphone,
  User,
  Users,
  X,
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
        { label: 'Vibe TV零廣告體驗', included: false },
        { label: '離線觀看 / 下載', included: false },
        { label: '2 部裝置同時觀看', included: true },
      ],
      vibelink: [
        { label: 'AI 找人幫手每月 10 次', included: true },
        { label: '發送好友邀請', included: true },
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
        { label: 'Vibe TV零廣告體驗', included: true },
        { label: '離線觀看 / 下載', included: false },
        { label: '3 部裝置同時觀看', included: true },
      ],
      vibelink: [
        { label: 'AI 找人幫手無限使用', included: true },
        { label: '發送好友邀請', included: true },
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
      { label: 'Vibe TV零廣告體驗', included: true },
      { label: '離線觀看 / 下載', included: true },
      { label: '4 部裝置同時觀看', included: true },
    ],
    vibelink: [
      { label: 'AI 找人幫手無限使用', included: true },
      { label: '發送好友邀請', included: true },
      { label: '每日 Right now 120 分', included: true },
      { label: 'Vibelink 零廣告體驗', included: true },
    ],
    vibebook: [{ label: '無限閱讀', included: true }],
  },
}
] as const

type PlanId = (typeof plans)[number]['id']
type SubscriptionStatus = 'active' | 'paused' | 'cancelled'

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-start gap-2 text-[13px] text-neutral-800">
      <div className="mt-[2px] shrink-0">
        {included ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </div>
      <span>{label}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] font-semibold italic text-neutral-800">{children}</div>
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
      className={`relative rounded-[26px] border bg-white p-4 transition-all duration-200
  ${plan.id === 'premium' ? 'ring-2 ring-fuchsia-400 shadow-xl scale-[1.02]' : 'shadow-sm'}
`}
    >
      

      

      <div className="mb-3">
  <div className="text-[16px] font-semibold tracking-wide text-neutral-500">
  {plan.name}
</div>

  <div className="mt-1 text-[24px] font-bold text-neutral-900">
    月費:{plan.price}NTD
  </div>
</div>

      <div className="space-y-4">
        <div className="space-y-2 border-t border-neutral-300 pt-3">
          <SectionTitle>Vibe TV</SectionTitle>
          {plan.features.vibeTv.map((feature) => (
            <FeatureRow key={feature.label} {...feature} />
          ))}
        </div>

        <div className="space-y-2 border-t border-neutral-200 pt-3">
          <SectionTitle>Vibelink</SectionTitle>
          {plan.features.vibelink.map((feature) => (
            <FeatureRow key={feature.label} {...feature} />
          ))}
        </div>

        <div className="space-y-2 border-t border-neutral-200 pt-3">
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
            ? 'bg-neutral-200 text-neutral-500'
            : 'bg-gradient-to-r from-fuchsia-300 to-pink-300 text-neutral-900 hover:scale-[1.01]'
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
    <div className="min-h-screen bg-[#efefef] text-neutral-900">
      <div className="mx-auto w-full max-w-[430px] px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            
            <h1 className="text-3xl font-bold tracking-tight">Vibe Membership</h1>
            
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              <LogOut className="mr-2 inline h-4 w-4" />
              登出
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Crown className="h-5 w-5 text-fuchsia-500" />
                  目前會員狀態
                </div>
                <p className="mt-1 text-sm text-neutral-600">你目前的外部訂閱方案與下次扣款資訊</p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : status === 'paused'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {status === 'active' ? '使用中' : status === 'paused' ? '已暫停' : '已取消'}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-neutral-100 p-4">
                <div className="mb-1 text-sm text-neutral-500">目前方案</div>
                <div className="text-lg font-bold">{activePlan.name}</div>
              </div>
              
              
              <div className="rounded-2xl bg-neutral-100 p-4">
                <div className="mb-1 text-sm text-neutral-500">下次扣款日</div>
                <div className="text-lg font-bold">{nextBillingDate}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">選擇或切換會員方案</h2>
                <p className="mt-1 text-sm text-neutral-600">這裡模擬未來官網外部訂閱頁，可直接升級、降級或查看方案差異。</p>
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

            <div className="rounded-[28px] bg-white p-5 shadow-sm">
              <div className="mb-3 text-lg font-semibold">續訂與付款方式</div>

              <div className="mb-4 flex items-center justify-between rounded-2xl bg-neutral-100 px-4 py-3">
                <div>
                  <div className="font-medium">自動續訂</div>
                  <div className="text-sm text-neutral-500">到期後自動延續目前方案</div>
                </div>
                <button
                  onClick={() => setAutoRenew((prev) => !prev)}
                  className={`relative h-7 w-14 rounded-full transition ${
                    autoRenew ? 'bg-fuchsia-400' : 'bg-neutral-300'
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
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="text-sm text-neutral-500">付款方式</div>
                  <div className="mt-1 font-semibold">Visa •••• 0726</div>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="text-sm text-neutral-500">發票與帳單</div>
                  <div className="mt-1 font-semibold">可下載 PDF / Email 寄送</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
