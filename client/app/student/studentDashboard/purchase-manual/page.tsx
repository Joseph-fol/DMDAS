"use client";
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";

type Manual = {
  id: string;
  code: string;
  title: string;
  department: string;
  level: string;
  price: number;
};

const MANUALS: Manual[] = [
  {
    id: "1",
    code: "CSC311",
    title: "CSC311 — System Analysis and Design",
    department: "Computer Science",
    level: "500L",
    price: 3500,
  },
  {
    id: "2",
    code: "PHY201",
    title: "PHY201 — Classical Mechanics",
    department: "Physics",
    level: "200L",
    price: 2500,
  },
  {
    id: "3",
    code: "CHM101",
    title: "CHM101 — Basic Chemistry",
    department: "Chemistry",
    level: "100L",
    price: 2000,
  },
];

function formatCurrency(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function PurchaseManual() {
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = useMemo(
    () => MANUALS.find((m) => m.id === selectedId) ?? null,
    [selectedId],
  );
  const [manuals, setManuals] = useState<Manual[]>([]);

  useEffect(() => {
    const fetchManualData = async () => {
      try {
        const baseURL = "http://localhost:5142";
        const response = await axios.get<Manual | Manual[]>(
          `${baseURL}/api/student/availableManuals`,
        );
        const manualData = response.data;
        // sessionStorage.setItem("availableManuals", response.data);

        console.log("fetched manuals:", manualData);

        // Accept either a single Manual object or an array of Manual
        if (Array.isArray(manualData)) {
          setManuals(manualData as Manual[]);
        } else if (manualData && typeof manualData === "object") {
          setManuals([manualData as Manual]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchManualData();
  }, []);

  const options = manuals.length ? manuals : MANUALS;

  return (
    <div className="py-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Purchase Manual
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Select a manual and pay securely via Paystack. Your keycode is
            generated instantly.
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-[640px]">
            <div className="flex items-center gap-4 whitespace-nowrap">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white font-medium">
                1
              </div>
              <div className="text-sm text-slate-700">Select Manual</div>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200" />
            <div className="flex items-center gap-4 text-slate-400 whitespace-nowrap">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-400">
                2
              </div>
              <div className="text-sm">Pay with Paystack</div>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200" />
            <div className="flex items-center gap-4 text-slate-400 whitespace-nowrap">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-400">
                3
              </div>
              <div className="text-sm">Keycode Issued</div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Step 1 — Select Manual
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Choose a Course Manual
              </p>

              <div className="mt-6">
                <label className="block w-full">
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className={`w-full rounded-lg p-3 text-sm text-slate-700 focus:ring-0 outline-none ${
                      selected
                        ? "border-2 border-red-300"
                        : "border border-slate-200"
                    }`}
                  >
                    <option value="">Select a manual...</option>
                    {options.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </label>

                {selected && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-50 rounded-md p-4 text-sm">
                        <div className="text-xs text-slate-400 uppercase">
                          Department
                        </div>
                        <div className="mt-2 font-medium text-slate-800">
                          {selected.department}
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-md p-4 text-sm">
                        <div className="text-xs text-slate-400 uppercase">
                          Level
                        </div>
                        <div className="mt-2 font-medium text-slate-800">
                          {selected.level}
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-md p-4 text-sm">
                        <div className="text-xs text-red-400 uppercase">
                          Price
                        </div>
                        <div className="mt-2 font-semibold text-red-600">
                          {formatCurrency(selected.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Payment (hidden until manual selected) */}
            {selected && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-800">
                  Step 2 — Pay with Paystack
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Secure payment powered by Paystack. Supports card, bank
                  transfer, and USSD. Your keycode is issued immediately after
                  payment.
                </p>

                <div className="mt-6 bg-slate-50 rounded-md p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Amount to Pay</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {formatCurrency(selected.price)}
                    </div>
                  </div>

                  <div className="text-sm text-slate-500 text-right">
                    <div className="text-xs">Manual</div>
                    <div className="font-medium">{selected.code}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    className={`w-full rounded-lg py-3 text-white font-medium bg-gradient-to-r from-cyan-500 to-blue-500`}
                  >
                    Pay {formatCurrency(selected.price)} with Paystack
                  </button>
                </div>

                <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-4">
                  <div>🔒 SSL Encrypted</div>
                  <div>·</div>
                  <div>PCI DSS Compliant</div>
                  <div>·</div>
                  <div>Instant Keycode</div>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-4 space-y-6 md:sticky md:top-28">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h4 className="font-semibold text-slate-800">How it works</h4>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-slate-400">📚</span> Select your manual
                  from the list
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400">💳</span> Pay securely via
                  Paystack
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400">🔑</span> Get your keycode
                  instantly
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-400">📦</span> Present keycode to
                  collect manual
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <h4 className="font-semibold text-slate-800">Payment Methods</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  💳 Debit / Credit Card
                </li>
                <li className="flex items-center gap-3">🏦 Bank Transfer</li>
                <li className="flex items-center gap-3">📲 USSD</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600">🔑</div>
                <div>
                  <div className="text-sm">
                    Your keycode is generated the moment payment is confirmed —
                    no manual approval needed. No waiting.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
