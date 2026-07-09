"use client";

import axios from "axios";
import { useRef, useState } from "react";
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

type ForgotPinValues = {
  matricNumber: string;
  email: string;
};

const initialValues: ForgotPinValues = {
  matricNumber: "",
  email: "",
};

const validationSchema = Yup.object({
  matricNumber: Yup.string().trim().required("Matric number is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
});

function InputError({ name }: { name: keyof ForgotPinValues }) {
  return (
    <ErrorMessage
      name={name}
      component="p"
      className="mt-1 text-xs font-medium text-[#ef4444]"
    />
  );
}

export default function ForgotPassword() {
  const router = useRouter();
  const pinInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (
    values: ForgotPinValues,
    actions: FormikHelpers<ForgotPinValues>,
  ) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload = {
      matricNumber: values.matricNumber.trim(),
      email: values.email,
    };

    const baseURL = "http://localhost:5142";
    try {
      const response = await axios.post<{ message?: string }>(
        `${baseURL}/api/requestPin`,
        payload,
      );
      setSuccessMessage(
        response.data.message ?? "Access granted successfully.",
      );
      console.log(response.data);
      actions.resetForm();
      pinInputRefs.current[0]?.focus();

      setTimeout(() => router.push(""), 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          (error.response?.data as { message?: string } | undefined)?.message ??
            error.message ??
            "Unable to verify account.",
        );
      } else {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to verify account.",
        );
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdf8f9] text-[#081124]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-140 rounded-xl bg-white/90 p-7 ring-1 ring-slate-200/70">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0b1324]">
                Forgot Pin
              </h2>
              <p className="mt-2 text-sm text-[#5d7597]">
                Enter your credentials here to continue.
              </p>
            </div>

            {successMessage ? (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {errorMessage}
              </div>
            ) : null}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, isSubmitting, touched, errors }) => (
                <Form className="space-y-6">
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold text-[#0b1324]"
                      htmlFor="matricNumber"
                    >
                      Matric Number
                    </label>
                    <Field
                      id="matricNumber"
                      name="matricNumber"
                      type="text"
                      placeholder="e.g., 2021_0451"
                      autoComplete="username"
                      className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#0b1324] outline-none transition placeholder:text-[#98a8bf] focus:border-[#2f68f6] focus:ring-4 focus:ring-[#dfeaff] ${
                        touched.matricNumber && errors.matricNumber
                          ? "border-rose-400"
                          : "border-[#d8e2f1]"
                      }`}
                    />
                    <InputError name="matricNumber" />
                  </div>

                  <div>
                    <label
                      className="mb-3 block text-sm font-semibold text-[#0b1324]"
                      htmlFor="pin-0"
                    >
                      Email
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      placeholder="student@lautech.edu.ng"
                      className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                        touched.email && errors.email
                          ? "border-rose-400"
                          : "border-slate-200"
                      }`}
                    />
                    <InputError name="email" />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#381E25] text-sm font-bold text-white transition hover:bg-[#F43F5E] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Verifying..." : "Verify Account"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </section>

        <section className="relative isolate hidden overflow-hidden border-r border-slate-200/70 bg-[#fde7ed] px-10 py-12 lg:flex lg:flex-col lg:justify-center">
          <div className="absolute inset-0">
            <div className="absolute left-[-10%] top-[8%] h-288 w-6xl rounded-full border border-[#381E25]" />
            <div className="absolute left-[6%] top-[18%] h-216 w-216 rounded-full border border-[#c5a7af]" />
            <div className="absolute right-[18%] top-[12%] h-16 w-16 rounded-full border border-[#F43F5E] bg-white " />
            <div className="absolute right-[22%] top-[16.4%] h-3 w-3 rounded-full bg-[#381E25]" />
          </div>

          <div className="relative mx-auto max-w-xl text-center">
            <div className="mx-auto mb-6 flex w-fit items-center gap-4 rounded-full bg-transparent px-6 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F43F5E] text-white ">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-none stroke-current stroke-[1.8]"
                  aria-hidden="true"
                >
                  <path d="M3 8.5L12 4l9 4.5-9 4.5-9-4.5Z" />
                  <path d="M6.5 10.25v4.5c0 .9 2.46 2.25 5.5 2.25s5.5-1.35 5.5-2.25v-4.5" />
                </svg>
              </div>
              <span className="text-3xl font-black tracking-tight text-[#381E25]">
                DMDAS
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[#381E25] lg:text-5xl">
              Forgot Access into your dashboard
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-slate-900">
              Request for your reset pin via whatsapp here!
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
