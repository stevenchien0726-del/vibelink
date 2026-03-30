import React from "react";
import { motion } from "framer-motion";
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
import { UserCircle2 } from "lucide-react";

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
      className="flex w-full items-center gap-3 bg-transparent py-[14px] text-left text-[14px] text-[#222]"
    >
      <span className="flex h-[24px] w-[24px] items-center justify-center text-[#111]">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function SideProfileMenu({ onClose }: SideProfileMenuProps) {
  return (
    <>
      <motion.button
  type="button"
  aria-label="關閉側邊選單"
  className="fixed top-0 left-1/2 z-[140] h-full w-full max-w-[430px] -translate-x-1/2 bg-[rgba(0,0,0,0.14)]"
  onClick={onClose}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.22, ease: "easeOut" }}
/>

      <motion.aside
  className="fixed top-0 left-1/2 z-[141] flex h-full w-[72%] max-w-[310px] -translate-x-[215px] flex-col overflow-y-auto bg-white shadow-[10px_0_30px_rgba(0,0,0,0.08)]"
  initial={{ x: -56, opacity: 0.98 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -56, opacity: 0.98 }}
  transition={{
    type: "spring",
    stiffness: 320,
    damping: 30,
    mass: 0.95,
  }}
>
        <div className="border-b border-[#d6d6d6] px-4 pb-4 pt-[18px]">
          <div className="mb-[12px] flex items-center gap-3">
            <span className="flex h-[24px] w-[24px] items-center justify-center text-[#111]">
              <PersonIcon />
            </span>
            <span className="text-[14px] font-medium text-[#222]">
              People Library
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-[24px] w-[24px] items-center justify-center text-[#111]">
              <MailIcon />
            </span>
            <span className="text-[14px] font-medium text-[#222]">
              好友邀請
            </span>
          </div>
        </div>

        <div className="border-b border-[#d6d6d6] px-4 py-4">
          <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-[#ededed] px-[10px] py-[6px]">
            <span className="flex h-[20px] w-[20px] items-center justify-center text-[#111]">
              <HeartOutlineIcon />
            </span>
            <span className="text-[13px] text-[#333]">Right now</span>
            <span className="text-[13px] text-[#333]">開放中</span>
            <div className="ml-1 flex h-[22px] w-[42px] items-center justify-end rounded-full bg-[#d190e9] p-[3px]">
              <div className="h-4 w-4 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.14)]" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[30px] px-4 pb-7 pt-[25px]">
          <SideItem icon={<UserCircle2/>} label="帳號管理" />
          <SideItem icon={<ChartIcon />} label="流量報告" />
          <SideItem icon={<BellIcon />} label="通知" />
          <SideItem icon={<StarIcon />} label="最愛" />
          <SideItem icon={<BlockIcon />} label="封鎖名單" />
          <SideItem icon={<ClockIcon />} label="瀏覽紀錄" />
          <SideItem icon={<TicketIcon />} label="Vibe會員" />
          <SideItem icon={<GridIcon />} label="Vibe Hub" />
          <SideItem icon={<MegaphoneIcon />} label="廣告中心" />
          <SideItem icon={<GearIcon />} label="設定" />
        </div>
      </motion.aside>
    </>
  );
}