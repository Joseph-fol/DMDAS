"use client"

import React, { useState } from "react";
import { ChevronDown, ChevronUp, CreditCard } from "lucide-react";

type FilterTab = "All" | "Paid" | "Failed" | "Refunded";

interface Transaction {
  id: string;
  courseCode: string;
  courseTitle: string;
  status: "Paid" | "Failed" | "Refunded";
  paystackRef: string;
  channel: string;
  date: string;
  time: string;
  amount: number;
  keyCode: string;
  pickupStatus: string;
}

const sampleTransactions: Transaction[] = [
  {
    id: "1",
    courseCode: "CSC311",
    courseTitle: "System Analysis and Design",
    status: "Paid",
    paystackRef: "PSK-20260805-A1B2C3",
    channel: "Card",
    date: "2026-08-05",
    time: "14:23",
    amount: 3500,
    keyCode: "DMDAS-4827-CSC",
    pickupStatus: "Ready for Pickup",
  },
  {
    id: "2",
    courseCode: "CSC321",
    courseTitle: "Computer Networks",
    status: "Paid",
    paystackRef: "PSK-20260720-D4E5F6",
    channel: "Card",
    date: "2026-07-20",
    time: "09:11",
    amount: 3000,
    keyCode: "DMDAS-3901-CSC",
    pickupStatus: "Ready for Pickup",
  },
  {
    id: "3",
    courseCode: "CSC401",
    courseTitle: "Artificial Intelligence",
    status: "Paid",
    paystackRef: "PSK-20260807-Y7Z8A9",
    channel: "Card",
    date: "2026-08-07",
    time: "16:02",
    amount: 3800,
    keyCode: "DMDAS-6614-CSC",
    pickupStatus: "Ready for Pickup",
  },
];

const stats = [
  {
    label: "Total Paid",
    value: "₦10,300",
    change: "3 transactions",
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
    label: "Successful",
    value: "3",
    change: "Via paystack",
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
    label: "Manual Collected",
    value: "1",
    change: "Distribution complete",
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

export default function Page() {

  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const tabs: FilterTab[] = ["All", "Paid", "Failed", "Refunded"];

  // Handle single accordion expansion
  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredTransactions = sampleTransactions.filter((tx) => {
    if (activeTab === "All") return true;
    return tx.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="block lg:flex md:flex items-start justify-between gap-4 lg:py-3">
        <div className=" lg:flex-row items-start justify-between gap-4 lg:py-3">
          <h1 className="text-3xl font-extrabold text-black"> Payment Overview </h1>
          <p className="mt-2 text-md font-medium text-slate-800">
            All your transactions and issued keycodes.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            className="rounded-md bg-[#F8FAFC] px-2 my-4 py-2 text-sm font-semibold text-black shadow-sm"
          >
            Export
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


      <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm font-sans text-slate-800">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Transactions
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs sm:text-sm font-medium text-slate-600">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setOpenId(null);
                }}
                className={`px-4 py-1.5 rounded-lg transition-all duration-150 ${activeTab === tab
                    ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200"
                    : "hover:text-slate-900"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion / List Content */}
        <div className="divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <span className="text-2xl">💳</span>
              </div>
              <p className="text-base font-semibold text-slate-800">
                No transactions
              </p>
              <p className="text-sm text-slate-400 mt-0.5">
                Your payments will appear here.
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isOpen = openId === tx.id;
              return (
                <div key={tx.id} className="transition-all duration-200">
                  {/* Header Row (Clickable) */}
                  <div
                    onClick={() => toggleAccordion(tx.id)}
                    className="flex items-center justify-between py-4 px-2 hover:bg-slate-50/50 rounded-xl cursor-pointer transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm sm:text-base">
                            {tx.courseCode} — {tx.courseTitle}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {tx.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{tx.paystackRef}</span>
                          <span>•</span>
                          <span>{tx.channel}</span>
                          <span>•</span>
                          <span>
                            {tx.date} {tx.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-sm sm:text-base">
                          ₦{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs font-semibold text-rose-500 tracking-wider">
                          {tx.keyCode}
                        </p>
                      </div>

                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details Panel */}
                  {isOpen && (
                    <div className="mt-1 mb-4 p-5 rounded-2xl border border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xs animate-in fade-in-50 duration-200">
                      {/* Left Column: Payment Details */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Payment Details
                        </h4>

                        <div className="space-y-3 text-xs">
                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">
                              Paystack Ref
                            </p>
                            <p className="font-semibold text-slate-800">
                              {tx.paystackRef}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">
                              Channel
                            </p>
                            <p className="font-semibold text-slate-800">
                              {tx.channel}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">
                              Date
                            </p>
                            <p className="font-semibold text-slate-800">
                              {tx.date} • {tx.time}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">
                              Amount
                            </p>
                            <p className="font-bold text-slate-900 text-sm">
                              ₦{tx.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Keycode & Pickup Status */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Keycode
                        </h4>

                        <div className="bg-rose-50/70 border border-rose-100 rounded-xl py-3 px-4 flex items-center justify-center">
                          <span className="font-bold text-rose-500 tracking-wider text-base sm:text-lg">
                            {tx.keyCode}
                          </span>
                        </div>

                        <div className="pt-1">
                          <p className="text-xs text-slate-400 font-medium mb-1.5">
                            Pickup Status
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            {tx.pickupStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}