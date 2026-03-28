import React from "react";
import {
  PersonIcon,
  MailIcon,
  HeartOutlineIcon,
  ChartIcon,
  BellIcon,
  StarIcon,
  BlockIcon,
  ClockIcon,
  TicketIcon,
  GridIcon,
  GearIcon,
  MegaphoneIcon,
} from "@/components/icons";

type SideProfileMenuProps = {
  onClose: () => void;
};

function SideItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-5 text-[30px] text-left w-full"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function SideProfileMenu({ onClose }: SideProfileMenuProps) {
  return (
    <>
      <button
        type="button"
        aria-label="關閉側邊選單"
        className="absolute inset-0 bg-white/60 z-30"
        onClick={onClose}
      />

      <div className="absolute left-0 top-0 h-full w-[78%] bg-[#efefef] z-40 pt-24 px-5 overflow-y-auto shadow-lg">
        <div className="space-y-7 text-[28px] pb-40">
          <button type="button" className="flex items-center gap-5 text-left">
            <PersonIcon />
            <span>People Library</span>
          </button>

          <button type="button" className="flex items-center gap-5 text-left">
            <MailIcon />
            <span>好友邀請</span>
          </button>

          <button type="button" className="flex items-center gap-5 text-left">
            <HeartOutlineIcon />
            <span>Right now</span>
          </button>

          <div className="mt-2 h-[60px] rounded-[24px] bg-[#d9d9d9] flex items-center justify-between px-6 text-[24px]">
            <span>我的Right now</span>
            <div className="flex items-center gap-4">
              <span>開啟中</span>
              <div className="w-[78px] h-[42px] rounded-full bg-[#d07ccf] relative">
                <div className="absolute right-[3px] top-[3px] w-[36px] h-[36px] bg-white rounded-full" />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-8">
            <SideItem icon={<PersonIcon />} label="帳號管理" />
            <SideItem icon={<ChartIcon />} label="我的動態" />
            <SideItem icon={<BellIcon />} label="通知" />
            <SideItem icon={<StarIcon />} label="最愛" />
            <SideItem icon={<BlockIcon />} label="已封鎖" />
            <SideItem icon={<ClockIcon />} label="典藏內容" />
            <SideItem icon={<TicketIcon />} label="Vibe會員" />
            <SideItem icon={<GridIcon />} label="Vibe Hub" />
            <SideItem icon={<GearIcon />} label="設定" />
            <SideItem icon={<MegaphoneIcon />} label="廣告中心" />
          </div>
        </div>
      </div>
    </>
  );
}