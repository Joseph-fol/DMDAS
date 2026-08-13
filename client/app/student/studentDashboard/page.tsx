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
    label: "Available Manuals",
    value: "5",
    change: "Ready to purchase",
    changeTone: "neutral",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 24 24"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          fill="#ec003f"
          d="M22 16.653c0 .25-.05.5-.15.73a2 2 0 0 1-.41.62c-.181.171-.391.31-.62.41a1.9 1.9 0 0 1-.74.14a15.2 15.2 0 0 0-3.37.32a9.3 9.3 0 0 0-3.71 1.27V5.233c1.091-.52 2.26-.858 3.46-1a17.4 17.4 0 0 1 3.71-.33a1.92 1.92 0 0 1 1.3.61c.33.352.513.817.51 1.3zM11 5.233v14.91a9.25 9.25 0 0 0-3.65-1.27a16.2 16.2 0 0 0-3.43-.32a1.9 1.9 0 0 1-.74-.14a2.2 2.2 0 0 1-.62-.41a1.8 1.8 0 0 1-.41-.62a1.8 1.8 0 0 1-.15-.73v-10.9a1.9 1.9 0 0 1 1.78-1.89a17 17 0 0 1 3.79.33A10.7 10.7 0 0 1 11 5.233"
        />
      </svg>
    ),
  },
  {
    label: "Manuals Purchased",
    value: "3",
    change: "Payments confirmed",
    changeTone: "neutral",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 32 32"
      >
        <path d="M0 0h32v32H0z" fill="none" />
        <path
          fill="#ec003f"
          fill-rule="evenodd"
          d="M28.928 10.3a3.25 3.25 0 0 1-.137 4.595L13.94 28.89a3.25 3.25 0 0 1-4.557-.098l-6.264-6.435a3.25 3.25 0 0 1 4.658-4.534l4.033 4.143l12.525-11.802a3.25 3.25 0 0 1 4.594.136"
          clip-rule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Active Keycodes",
    value: "2",
    change: "Ready for pickup",
    changeTone: "neutral",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 16 16"
      >
        <path d="M0 0h16v16H0z" fill="none" />
        <path
          fill="#ec003f"
          d="m2.486 5.854l5 3.001a1 1 0 0 0 1.027-.001l5-2.999c.299-.179.486-.509.486-.858s-.186-.677-.486-.857L8.517 1.142a1.01 1.01 0 0 0-1.031-.002l-5 2.999A1.01 1.01 0 0 0 2 4.997c0 .349.186.678.486.857M8 1.997l5 3l-5 3l-5-3zm5.854 4.987L8 10.497L2.146 6.984A1 1 0 0 0 2 7.497c0 .35.187.679.486.857l5 3.001a1 1 0 0 0 1.028-.001l1.354-.812a3.98 3.98 0 0 1 2.458-1.474l1.188-.713c.3-.18.486-.509.486-.858c0-.183-.054-.359-.146-.513M8 12.997L2.146 9.484A1 1 0 0 0 2 9.997c0 .35.187.679.486.857l5 3.001a1 1 0 0 0 1.028-.001l.54-.324C9.03 13.355 9 13.181 9 12.999c0-.22.031-.431.065-.642zM13 10a3 3 0 1 0 0 6a3 3 0 0 0 0-6m1.604 2.604l-1.75 1.75a.5.5 0 0 1-.708 0l-1-1a.5.5 0 0 1 .707-.707l.646.646l1.396-1.396a.5.5 0 0 1 .707.707z"
        />
      </svg>
    ),
  },
  {
    label: "Collected",
    value: "1",
    change: "Manuals received",
    changeTone: "neutral",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 24 24"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          fill="#ec003f"
          d="M6 20q-.825 0-1.412-.587T4 18v-2q0-.425.288-.712T5 15t.713.288T6 16v2h12v-2q0-.425.288-.712T19 15t.713.288T20 16v2q0 .825-.587 1.413T18 20zm5-12.15L9.125 9.725q-.3.3-.712.288T7.7 9.7q-.275-.3-.288-.7t.288-.7l3.6-3.6q.15-.15.325-.212T12 4.425t.375.063t.325.212l3.6 3.6q.3.3.288.7t-.288.7q-.3.3-.712.313t-.713-.288L13 7.85V15q0 .425-.288.713T12 16t-.712-.288T11 15z"
        />
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
          },
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
    <section className="mx-auto w-full max-w-7xl">
      <div className="block lg:flex md:flex items-start justify-between gap-4 lg:py-3">
        <div>
          <h1 className="text-3xl font-extrabold text-black">
            {" "}
            Hello, {studentName}
          </h1>
          <p className="mt-2 text-md font-medium text-slate-800">
            Here is a summary of your course manuals.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/student/available-manuals"
            className="rounded-md bg-rose-600 px-4 my-4 py-2 text-md font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            + Browse Manuals
          </a>
        </div>
      </div>

      <div className="py-4 gap-3">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-5"
              >
                <div className="">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-slate-600">
                        {stat.label}
                      </p>
                      <div className="mt-1 text-3xl font-bold text-[#381E25]">
                        {stat.value}
                      </div>
                    </div>

                    <div className="h-10 w-10 rounded-lg bg-slate-100 font-bold text-[#EC003F] flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>

                  <div>
                    <span className="py-1 text-sm text-slate-500">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-5 w-5"
              >
                <path d="M12 2v6" />
                <path d="M6 8v10a6 6 0 0 0 12 0V8" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">You have 2 active keycodes</p>
              <p className="text-sm text-slate-600">
                Present your keycode to your Course Representative to collect
                your manual.
              </p>
            </div>
          </div>

          <div>
            <button className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700">
              View Keycode
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Payments</h3>
              <a className="text-sm font-medium text-rose-600">View all</a>
            </div>

            <div className="mt-4 overflow-hidden">
              <div className="divide-y divide-slate-200">
                {manualRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-4 px-3 py-4"
                  >
                    <div>
                      <div className="font-semibold">{row.code}</div>
                      <div className="text-sm text-slate-500">
                        System Analysis and Design
                      </div>
                    </div>

                    <div className="text-sm font-semibold">₦3,500</div>

                    <div className="text-sm text-emerald-700">● Paid</div>

                    <div className="flex items-center gap-3">
                      <div className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-sm font-semibold text-emerald-700">
                        {row.token}
                      </div>
                      <button className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                        Show Keycode
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Available Manuals</h4>
              <a
                href="/student/available-manuals"
                className="text-sm font-medium text-rose-600"
              >
                Purchase
              </a>
            </div>

            <ul className="mt-4 space-y-3">
              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">CSC311</div>
                  <div className="text-xs text-slate-500">
                    500L · Computer Science
                  </div>
                </div>
                <div className="font-semibold">₦3,500</div>
              </li>

              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">CSC321</div>
                  <div className="text-xs text-slate-500">
                    300L · Computer Science
                  </div>
                </div>
                <div className="font-semibold">₦3,000</div>
              </li>

              <li className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">MTH201</div>
                  <div className="text-xs text-slate-500">
                    200L · Mathematics
                  </div>
                </div>
                <div className="font-semibold">₦2,500</div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="font-semibold">Collected</h4>
            <div className="mt-3 text-3xl font-bold text-[#381E25]">1</div>
            <div className="text-sm text-slate-500">Manuals received</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
