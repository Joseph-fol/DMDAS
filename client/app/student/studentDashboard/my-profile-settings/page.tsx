"use client";

import { useState } from "react";

type StudentProfile = {
  fullName: string;
  email: string;
  department: string;
  level: string;
  phoneNumber: string;
  role: string;
  matricNumber?: string;
  purchasedManuals?: number;
  totalSpent?: string;
  keycodesIssued?: number;
  whatsapp?: string;
  bio?: string;
};

export default function Page() {
  const _profileState = useState<StudentProfile>(() => {
    try {
      const userDetails = typeof window !== "undefined" ? sessionStorage.getItem("Student") : null;
      if (userDetails) {
        const parsedData = JSON.parse(userDetails);
        return {
          fullName: parsedData.fullName || parsedData.name || "",
          email: parsedData.email || "",
          department: parsedData.department || "",
          level: parsedData.level || "",
          phoneNumber: parsedData.phoneNumber || parsedData.whatsapp || "",
          role: parsedData.role || "",
          matricNumber: parsedData.matricNumber || parsedData.matric || parsedData.matric_number,
          purchasedManuals: parsedData.purchasedManuals,
          totalSpent: parsedData.totalSpent,
          keycodesIssued: parsedData.keycodesIssued,
          whatsapp: parsedData.whatsapp,
        } as StudentProfile;
      }
    } catch {
      // ignore parse errors
    }

    return {
      fullName: "",
      email: "",
      department: "",
      level: "",
      phoneNumber: "",
      role: "",
    };
  });

  const profile = _profileState[0];

  // Derive initials for avatar
  const initials = (profile.fullName || "").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "ST";

  // Stats placeholders - these can be replaced with real values from API
  const manualsPurchased = profile.purchasedManuals ?? 3;
  const totalSpent = profile.totalSpent ?? "₦10,300";
  const keycodesIssued = profile.keycodesIssued ?? 3;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header card */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-linear-to-r from-slate-900 via-slate-700 to-pink-50 p-6 text-white shadow-md">
        <div className="relative">
          {/* Decorative top area */}
          <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(ellipse_at_top_left,#0b1220_0,transparent_40%)] opacity-40 pointer-events-none" />

          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-rose-600 text-white flex items-center justify-center text-2xl font-bold ring-4 ring-white">{initials}</div>
                <span className="absolute -bottom-0.5 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-white">{profile.fullName || "Student Name"}</h2>
                  <span className="inline-flex items-center rounded-full bg-emerald-50/30 px-2 py-1 text-sm font-medium text-emerald-300 ring-1 ring-white/20">Active</span>
                </div>

                <div className="mt-2 text-sm text-white/80">
                  <span className="font-medium">{profile.matricNumber || "2021/0451"}</span>
                  <span className="mx-2">·</span>
                  <span>{profile.department || "Computer Science"}</span>
                  <span className="mx-2">·</span>
                  <span>{profile.level || "500L"}</span>
                </div>

                <p className="mt-3 max-w-xl text-sm text-white/70">{profile.bio || ""}</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <button className="rounded-lg border border-rose-300 bg-white/5 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-white/10">Edit Profile</button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-8">
            <div className="text-center text-white">
              <div className="text-3xl font-extrabold">{manualsPurchased}</div>
              <div className="text-sm text-white/80">Manuals Purchased</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl font-extrabold">{totalSpent}</div>
              <div className="text-sm text-white/80">Total Spent</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl font-extrabold">{keycodesIssued}</div>
              <div className="text-sm text-white/80">Keycodes Issued</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Left nav */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <nav className="space-y-2">
              <button className="w-full rounded-lg bg-rose-50 px-3 py-2 text-left text-sm font-semibold text-rose-600">Personal Info</button>
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">Security</button>
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">Notifications</button>
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm">Activity</button>
            </nav>
            <hr className="my-3" />
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600">Sign Out</button>
          </div>
        </aside>

        {/* Main content */}
        <main>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <p className="text-sm text-slate-400">Your academic identity and contact details.</p>
              </div>
              <button className="text-sm font-medium text-rose-600">Edit</button>
            </div>

            <dl className="mt-6 sm:grid-cols-2">
              <div className="space-y-1 border-b border-slate-300 pb-4">
                <dt className="text-sm text-slate-400 font-medium">FULL NAME</dt>
                <dd className="font-medium text-slate-900">{profile.fullName || "Nill"}</dd>
              </div>

              <div className="space-y-1 border-b pb-4 border-slate-300 pt-4">
                <dt className="text-sm text-slate-400 uppercase font-medium">Matric Number</dt>
                <dd className="font-medium text-slate-900">{profile.matricNumber || "—"}</dd>
              </div>

              <div className="space-y-1 border-b pb-4 border-slate-300 pt-4">
                <dt className="text-sm text-slate-400 uppercase font-medium">Department</dt>
                <dd className="font-medium text-slate-900">{profile.department || "—"}</dd>
              </div>

              <div className="space-y-1 border-b pb-4 border-slate-300 pt-4">
                <dt className="text-sm text-slate-400 uppercase font-medium">Level</dt>
                <dd className="font-medium text-slate-900">{profile.level || "—"}</dd>
              </div>

              <div className="space-y-1 border-b pb-4 border-slate-300 pt-4">
                <dt className="text-sm text-slate-400 uppercase font-medium">Email Address</dt>
                <dd className="font-medium text-slate-900">{profile.email || "—"}</dd>
              </div>

              <div className="space-y-1 border-b pb-4 border-slate-300 pt-4">
                <dt className="text-sm text-slate-400 uppercase font-medium">Phone Number</dt>
                <dd className="font-medium text-slate-900">{profile.phoneNumber || "—"}</dd>
              </div>
            </dl>
          </div>
        </main>
      </div>
    </div>
  );
}