import { PersonIcon, StarIcon } from "@/components/icons";

type TopDropdownProps = {
  onClose: () => void;
};

export default function TopDropdown({ onClose }: TopDropdownProps) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[110px] w-[320px] rounded-[28px] border-[6px] border-[#d49ace] bg-[#efefef]/95 px-10 py-14 z-30 shadow-sm">
      <div className="flex flex-col gap-8 text-[34px] font-medium">
        <button
          onClick={onClose}
          className="flex items-center gap-5 text-left"
          type="button"
        >
          <PersonIcon />
          <span>追蹤中</span>
        </button>

        <button
          onClick={onClose}
          className="flex items-center gap-5 text-left"
          type="button"
        >
          <StarIcon />
          <span>最愛</span>
        </button>
      </div>
    </div>
  );
}