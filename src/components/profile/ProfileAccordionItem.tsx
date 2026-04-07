import React from "react";
import { ChevronRight } from "lucide-react";

interface ProfileAccordionItemProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const ProfileAccordionItem: React.FC<ProfileAccordionItemProps> = ({
  title,
  icon,
  expanded,
  onToggle,
  children,
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full h-12 items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center text-slate-700">{icon}</span>
          <span className="text-[16px] font-semibold text-slate-900">{title}</span> 
        </div>
        <ChevronRight
          className={`h-6 w-6 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          strokeWidth={2}
        />
      </button>

      {expanded && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </section>
  );
};

export default ProfileAccordionItem;
