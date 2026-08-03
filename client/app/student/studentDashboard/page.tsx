"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type UserProfile = {
  fullName: string;
  email: string;
  department: string;
  level: string;
  phoneNumber: string;
  role: string;
  purchasedManuals?: number; // Or a more specific type
  availableManuals?: number;
};
const stats = [
  {
    label: "Purchased Handbooks",
    value: "5 Manuals",
    change: "Harmattan & Rain Semesters",
    changeTone: "neutral",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 3.5H20v17" />
        <path d="M6.5 3.5A2.5 2.5 0 0 0 4 6v13.5" />
      </svg>
    ),
  },

  {
    label: "Available This Semester",
    value: "12 Manuals",
    change: "Filtered for 300 Level",
    changeTone: "neutral",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" />
        <path d="m4.5 7 7.5 4 7.5-4" />
        <path d="M12 11v10" />
      </svg>
    ),
  },

  {
    label: "Available This Semester",
    value: "12 Manuals",
    change: "Filtered for 300 Level",
    changeTone: "neutral",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" />
        <path d="m4.5 7 7.5 4 7.5-4" />
        <path d="M12 11v10" />
      </svg>
    ),
  },
];

const manualRows = [
  {
    id: 1,
    code: "CSE 311 - Advanced Web",
    date: "Oct 12, 2023",
    token: "NX-4821",
  },
  {
    id: 2,
    code: "MTH 301 - Calculus III",
    date: "Oct 05, 2023",
    token: "MT-9920",
  },
  {
    id: 3,
    code: "PHY 305 - Thermodynamics",
    date: "Sep 28, 2023",
    token: "PH-1144",
  },
];

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentName, setStudentName] = useState("Student");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        // router.push('/signin') is handled by layout.tsx
        return;
      }

      try {
        const baseURL = "http://localhost:5142";
        const response = await axios.get<UserProfile>(
          `${baseURL}/api/student/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data;
        setProfile(userData);

        const nameToSet = userData.fullName;
        if (nameToSet) {
          const nameParts = nameToSet.split(" ");
          setStudentName(nameParts[1] || nameParts[0]);
        } else {
          setStudentName("Student");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Token is invalid, expired, or altered.
          // Clear session and redirect to signin.
          sessionStorage.removeItem("token");
          router.push("/signin");
        } else {
          // Handle other errors, e.g., show a generic error message
        }
      }
    };

    fetchDashboardData();
  }, [router]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#381E25] sm:text-2xl">Welcome Back, {studentName.toUpperCase()}</h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">Here is your academic resource summary for this semester.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="block md:flex lg:block items-start justify-between rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="space-y-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                {stat.icon}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <div className="mt-2 mb-3 text-3xl lg:text-2xl font-bold tracking-tight text-[#381E25] sm:text-4xl">{stat.value}</div>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm lg:text-[11.8px] font-semibold ring-1 ${
                stat.changeTone === "neutral"
                  ? "bg-[#FDE7ED] text-rose-700 ring-[#d4bdc4]"
                  : "bg-slate-50 text-slate-600 ring-slate-100"
              }`}>
              {stat.changeTone === "neutral" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 19V5" />
                  <path d="m5 12 7-7 7 7" />
                </svg>
              ) : null}
              <span>{stat.change}</span>
            </span>
          </article>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-950">Recent Manual Acquisitions</h2>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-slate-200 px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
            <span>S/N</span>
            <span>Manual Code</span>
            <span>Purchase Date</span>
            <span>Receipt Code Token</span>
          </div>

          <div className="divide-y divide-slate-200">
            {manualRows.map((row) => (
              <div key={row.code} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] items-center px-6 py-5 text-sm">
                <span className="font-semibold text-slate-950">{row.id}</span>
                <span className="font-semibold text-slate-950">{row.code}</span>
                <span className="text-slate-500">{row.date}</span>
                <span>
                  <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-sm font-semibold tracking-wide text-emerald-700">
                    {row.token}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
