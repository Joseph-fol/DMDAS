"use client";

import axios from "axios";
import { useEffect, useState } from "react";

type StudentProfile = {
  fullName: string;
  email: string;
  department: string;
  level: string;
  phoneNumber: string;
  role: string;
};

export default function Page() {
  const [profile, setProfile] = useState<StudentProfile>({
    fullName: "",
    email: "",
    department: "",
    level: "",
    phoneNumber: "",
    role: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const userDetails = sessionStorage.getItem("Student");
    if (userDetails) {
      try {
        const parsedData = JSON.parse(userDetails);
        setProfile({
          fullName: parsedData.fullName || parsedData.name || "",
          email: parsedData.email || "",
          department: parsedData.department || "",
          level: parsedData.level || "",
          phoneNumber: parsedData.phoneNumber || parsedData.whatsapp || "",
          role: parsedData.role || "",
        });
      } catch (error) {
        console.error("Failed to parse user details from sessionStorage", error);
      }
    }
  }, []);

  const handleUpdate = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const baseURL = "http://localhost:5142";
      const response = await axios.put(
        `${baseURL}/api/student/profile`,
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage(response.data.message || "Profile updated successfully!");
      sessionStorage.setItem("Student", JSON.stringify({ ...JSON.parse(sessionStorage.getItem("Student") || "{}"), ...profile }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          (error.response?.data as { message?: string } | undefined)?.message ??
            "An error occurred while updating the profile."
        );
      } else {
        setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">My Profile Settings</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Update your student profile</h1>
      </header>
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{errorMessage}</div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Full Name
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Email Address
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Department
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Level
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={profile.level} onChange={(e) => setProfile({ ...profile, level: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Phone Number
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Role
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} readOnly />
          </label>
        </div>

        <button type="button" onClick={() => setIsModalOpen(true)} className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Save changes
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Confirm Your Details</h2>
            <p className="mt-2 text-sm text-slate-600">Please review the information before confirming.</p>
            <div className="mt-6 space-y-3 text-sm">
              <p><span className="font-semibold text-slate-700">Full Name:</span> <span className="text-slate-900">{profile.fullName}</span></p>
              <p><span className="font-semibold text-slate-700">Email:</span> <span className="text-slate-900">{profile.email}</span></p>
              <p><span className="font-semibold text-slate-700">Department:</span> <span className="text-slate-900">{profile.department}</span></p>
              <p><span className="font-semibold text-slate-700">Level:</span> <span className="text-slate-900">{profile.level}</span></p>
              <p><span className="font-semibold text-slate-700">Phone Number:</span> <span className="text-slate-900">{profile.phoneNumber}</span></p>
              <p><span className="font-semibold text-slate-700">Role:</span> <span className="text-slate-900">{profile.role}</span></p>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}