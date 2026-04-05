import React from "react";

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
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center text-slate-700">{icon}</span>
          <span className="text-[22px] font-semibold text-slate-900">{title}</span>
        </div>
        <svg
          className={`h-6 w-6 text-slate-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </section>
  );
};

export default ProfileAccordionItem;
