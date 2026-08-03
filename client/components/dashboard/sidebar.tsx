"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/student/studentDashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Available Manuals",
    href: "/student/studentDashboard/available-manuals",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M4 19a2 2 0 0 1 2-2h13" />
        <path d="M6 5h14v14H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      </svg>
    ),
  },
  {
    label: "Transaction History",
    href: "/student/studentDashboard/transaction-history",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M12 8v5l3 2" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  {
    label: "Profile Settings",
    href: "/student/studentDashboard/my-profile-settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <circle cx="12" cy="8" r="3" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
  },
];

type DashboardSidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

const Logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("Student");
  window.location.href = "/signin";
};

export default function DashboardSidebar({ setIsSidebarOpen }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDE7ED] text-[#381E25] ring-1 ring-[#381E25]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
              <path d="M6 11v4.5c0 .8 2.7 2.5 6 2.5s6-1.7 6-2.5V11" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-[#381E25]">DMDAS</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Student Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${isActive ? "border-[#FDF8F9] bg-[#FDE7ED] text-[#381E25]" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-[#FDF8F9] hover:text-slate-900" }`}
                onClick={() => setIsSidebarOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={isActive ? "text-slate-950" : "text-slate-400"}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button type="button" onClick={Logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H4" />
            <path d="M20 4v16" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}