import { GridIcon } from "@/components/icons";

type FocusFeedProps = {
  cardMenuOpen: boolean;
  onToggleCardMenu: () => void;
};

export default function FocusFeed({
  cardMenuOpen,
  onToggleCardMenu,
}: FocusFeedProps) {
  return (
    <>
      <section className="px-5 pt-14 flex items-center justify-between relative z-10">
        <div className="w-[46px] h-[46px] rounded-full bg-[#d9d9d9]" />

        <button
          onClick={onToggleCardMenu}
          className="h-[54px] min-w-[138px] rounded-full bg-[#d9d9d9] px-10 text-[24px] font-normal tracking-wide leading-none"
        >
          {cardMenuOpen ? "CLOSE" : "MENU"}
        </button>
      </section>

      <section className="pt-6 relative z-10">
        <div
          className={`w-full h-[520px] ${
            cardMenuOpen ? "bg-[#82ccb8]" : "bg-[#d9d9d9]"
          }`}
        />
      </section>

      <div className="flex justify-center gap-3 pt-3 pb-3 relative z-10">
        <span className="w-3.5 h-3.5 rounded-full bg-[#dd71ca]" />
        <span className="w-3.5 h-3.5 rounded-full bg-[#d0d0d0]" />
        <span className="w-3.5 h-3.5 rounded-full bg-[#d0d0d0]" />
      </div>

      <section className="px-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-[42px] leading-none">💗</span>
            <span className="text-[24px] font-medium">50</span>
          </div>

          <button aria-label="Comments">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 6.5H19C19.8284 6.5 20.5 7.17157 20.5 8V15C20.5 15.8284 19.8284 16.5 19 16.5H9L4.5 20V8C4.5 7.17157 5.17157 6.5 6 6.5H5Z"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <button className="h-[46px] rounded-full bg-[#d9d9d9] px-4 flex items-center gap-2 text-[18px] font-medium leading-none shrink-0">
          <svg width="28" height="20" viewBox="0 0 34 24" fill="none">
            <rect
              x="1.5"
              y="1.5"
              width="31"
              height="21"
              rx="2.5"
              stroke="black"
              strokeWidth="3"
            />
            <path
              d="M4 4L17 14L30 4"
              stroke="black"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
          <span>發送邀請</span>
        </button>
      </section>

      <section className="px-5 pt-6 pb-28 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-[54px] h-[54px] rounded-full bg-[#d9d9d9] shrink-0 flex items-center justify-center">
            <GridIcon />
          </div>
          <p className="text-[24px] leading-[1.35] tracking-tight pt-1 whitespace-nowrap overflow-hidden text-ellipsis">
            嗨，你好，今天是開心的一天
          </p>
        </div>
      </section>
    </>
  );
}