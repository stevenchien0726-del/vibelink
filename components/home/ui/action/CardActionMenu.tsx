import React from "react";
import {
  BookmarkIcon,
  SendIcon,
  HideIcon,
  ReportIcon,
} from "@/components/icons";

type CardActionMenuProps = {
  onClose: () => void;
};

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-6 text-left"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function CardActionMenu({ onClose }: CardActionMenuProps) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[360px] w-[300px] rounded-[28px] border-[6px] border-[#d49ace] bg-[#cfe1dc]/90 px-12 py-16 z-30 shadow-sm">
      <div className="flex flex-col gap-10 text-[34px] font-medium">
        <MenuItem icon={<BookmarkIcon />} label="收藏" onClick={onClose} />
        <MenuItem icon={<SendIcon />} label="分享" onClick={onClose} />
        <MenuItem icon={<HideIcon />} label="隱藏" onClick={onClose} />
        <MenuItem icon={<ReportIcon />} label="檢舉" onClick={onClose} />
      </div>
    </div>
  );
}