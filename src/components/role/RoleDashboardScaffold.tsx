import React from "react";
import { Page } from "zmp-ui";

export interface RoleDashboardMenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  helper?: string;
}

export interface RoleDashboardSection {
  title: string;
  description?: string;
  items: RoleDashboardMenuItem[];
}

export interface RoleDashboardStat {
  label: string;
  value: string;
}

interface RoleDashboardScaffoldProps {
  logoSrc: string;
  title: string;
  subtitle: string;
  stats: RoleDashboardStat[];
  sections: RoleDashboardSection[];
  onNavigate: (path: string) => void;
  topSlot?: React.ReactNode;
}

const RoleDashboardScaffold: React.FC<RoleDashboardScaffoldProps> = ({
  logoSrc,
  title,
  sections,
  onNavigate,
  topSlot,
}) => {
  return (
    <Page className="flex h-full min-h-0 flex-col bg-red-50/40">
      <div className="z-20 px-4 pt-3 pb-3 shrink-0">
        <div className="rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-red-500 px-4  text-white shadow-lg">
          <div className="relative flex justify-center">
            <div className="absolute top-1/2 h-16 w-44 -translate-y-1/2 rounded-full bg-white/20 blur-2xl" />
            <img
              src={logoSrc}
              alt="Rex Education"
              className="relative h-16 object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]"
            />
          </div>

        </div>
      </div>

      <div className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-24">
        <div className="space-y-5 pt-1">
          {topSlot}

          {sections.map((section) => (
            <section key={section.title}>
              <div className="mb-3">
                <h2 className="text-md font-bold text-gray-900">{section.title}</h2>
                {section.description && <p className="mt-0.5 text-xs text-gray-500">{section.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {section.items.map((item, index) => {
                  const oddCenter = section.items.length % 2 !== 0 && index === section.items.length - 1;
                  return (
                    <button
                      key={`${section.title}-${item.path}`}
                      onClick={() => onNavigate(item.path)}
                      className={`rounded-2xl border border-red-100 bg-white p-4 text-left shadow-sm transition-transform active:scale-[0.98] ${
                        oddCenter ? "col-span-2 mx-auto w-[52%]" : ""
                      }`}
                    >
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        {item.icon}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      {item.helper && <p className="mt-1 text-[11px] text-gray-500">{item.helper}</p>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Page>
  );
};

export default RoleDashboardScaffold;
