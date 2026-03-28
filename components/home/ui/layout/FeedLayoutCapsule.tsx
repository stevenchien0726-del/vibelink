import type { LayoutMode } from '@/pages/HomePage';

type FeedLayoutCapsuleProps = {
  layout: LayoutMode;
  onChangeLayout: (layout: LayoutMode) => void;
};

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function FeedLayoutCapsule({
  layout,
  onChangeLayout,
}: FeedLayoutCapsuleProps) {
  const nextLayout: LayoutMode =
    layout === "1x1" ? "2x2" : layout === "2x2" ? "3x3" : "1x1";

  const label =
    layout === "1x1" ? "1 X 1" : layout === "2x2" ? "2 X 2" : "3 X 3";

  return (
    <button
      type="button"
      onClick={() => onChangeLayout(nextLayout)}
      className="flex h-11 items-center gap-2 rounded-full bg-white/96 px-4 text-[13px] font-medium text-[#444] shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur"
    >
      <span className="flex h-4 w-4 items-center justify-center text-[#444]">
        <GridIcon />
      </span>
      <span>{label}</span>
    </button>
  );
}