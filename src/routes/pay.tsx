import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

const paymentSchema = z.object({
  receiverName: z
    .string()
    .trim()
    .nonempty({ message: "Receiver name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  upiId: z
    .string()
    .trim()
    .nonempty({ message: "UPI ID is required" })
    .max(100, { message: "UPI ID must be less than 100 characters" })
    .regex(/^[\w.\-]{2,}@[a-zA-Z]{2,}$/, {
      message: "Enter a valid UPI ID (e.g. name@bank)",
    }),
  amount: z
    .string()
    .trim()
    .nonempty({ message: "Amount is required" })
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), {
      message: "Enter a valid amount (e.g. 250 or 250.50)",
    })
    .refine((v) => Number(v) > 0, { message: "Amount must be greater than 0" })
    .refine((v) => Number(v) <= 1000000, {
      message: "Amount must be less than ₹10,00,000",
    }),
});

export const Route = createFileRoute("/pay")({
  validateSearch: (search) =>
    z
      .object({ pa: z.string().optional(), pn: z.string().optional() })
      .parse(search),
  head: () => ({
    meta: [
      { title: "Pay — Send Money via UPI" },
      {
        name: "description",
        content: "Enter receiver name, UPI ID and amount to send a payment.",
      },
      { property: "og:title", content: "Pay — Send Money via UPI" },
      {
        property: "og:description",
        content: "Enter receiver name, UPI ID and amount to send a payment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentPage,
});

type FieldErrors = Partial<Record<"receiverName" | "upiId" | "amount", string>>;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function PaymentSheet({
  name,
  upiId,
  amount,
  onClose,
  onPay,
}: {
  name: string;
  upiId: string;
  amount: string;
  onClose: () => void;
  onPay: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="relative flex w-full max-w-[430px] flex-col bg-[#0d0d0d]">
        {/* Close button */}
        <div className="flex justify-center pb-6">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2a2a] text-white transition-colors hover:bg-[#3a3a3a]"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sheet */}
        <div className="rounded-t-3xl bg-[#111111]">
          {/* Total payable */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-6">
            <p className="text-lg font-bold text-white">Total Payable</p>
            <p className="text-2xl font-bold text-white">₹{amount}</p>
          </div>

          {/* Recommended */}
          <div className="border-b border-zinc-800 px-5 py-5">
            <p className="text-sm text-zinc-400">Recommended</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#e2136e" strokeWidth="2" />
                    <path
                      d="M12 6.5c2.2 0 4 1 4.6 2.8M12 17.5c-2.2 0-4-1-4.6-2.8"
                      stroke="#003b7a"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="12" r="2" fill="#e2136e" />
                  </svg>
                </span>
                <div>
                  <p className="text-base font-semibold text-white">Kotak Mahindra Bank</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-sm tracking-widest text-zinc-400">•••• 8950</span>
                    <span className="rounded-sm bg-[#1c1c1c] px-1.5 py-0.5 text-[10px] font-bold italic text-[#f7941d]">
                      UPI
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base text-zinc-300">₹{amount}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Add payment method */}
          <div className="px-5 py-5">
            <p className="text-sm text-zinc-400">Add Payment Method</p>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-between text-left"
            >
              <span className="flex items-center gap-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M4 6h16M5 6v12h14V6M9 18v-5h6v5"
                  />
                </svg>
                <span className="text-base text-white">Add Bank Account</span>
              </span>
              <svg
                className="h-5 w-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              className="mt-5 flex w-full items-center justify-between text-left"
            >
              <span className="flex items-center gap-4">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path strokeLinecap="round" d="M9 8h6M12 12v5M9.5 13.5l5-3" />
                </svg>
                <span className="text-base text-white">Add credit line on UPI</span>
              </span>
              <svg
                className="h-5 w-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Pay button */}
          <div className="px-4 pb-6 pt-2">
            <button
              type="button"
              onClick={onPay}
              className="w-full rounded-lg bg-[#7c5cfc] py-4 text-base font-bold text-white transition-colors hover:bg-[#6b4be0] active:bg-[#5f42d0]"
            >
              Pay ₹{amount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [receiverName, setReceiverName] = useState(search.pn ?? "");
  const [upiId, setUpiId] = useState(search.pa ?? "");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showSheet, setShowSheet] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const result = paymentSchema.safeParse({ receiverName, upiId, amount });
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setShowSheet(true);
  };

  const formattedAmount = (() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || amount === "") return amount;
    return n % 1 === 0
      ? n.toLocaleString("en-IN")
      : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  })();

  const hasError = Boolean(errors.receiverName || errors.upiId || errors.amount);

  return (
    <div className="flex min-h-screen justify-center bg-black">
      <div className="flex w-full max-w-[430px] flex-col bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate({ to: "/" })}
            className="rounded-full p-1 text-white transition-colors hover:bg-white/10"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 12H5m0 0l7-7m-7 7l7 7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">Pay</h1>
          <button
            type="button"
            aria-label="Help"
            className="rounded-full p-1 text-white transition-colors hover:bg-white/10"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handlePay} className="flex flex-1 flex-col" noValidate>
          {/* Receiver card */}
          <div className="mx-3 mt-1 rounded-2xl bg-[#171717] p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8a33d]">
                <span className="text-sm font-bold text-white">
                  {getInitials(receiverName) || "PP"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <input
                  id="receiverName"
                  placeholder="Enter receiver name"
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  maxLength={100}
                  aria-label="Receiver name"
                  className="w-full rounded-md border border-transparent bg-transparent text-base font-bold tracking-wide text-white placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-500 focus:border-transparent focus:outline-none focus:ring-0"
                />
                <input
                  id="upiId"
                  placeholder="Enter UPI ID (e.g. name@bank)"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  maxLength={100}
                  aria-label="UPI ID"
                  className="w-full rounded-md border border-transparent bg-transparent text-sm text-zinc-400 placeholder:text-zinc-500 focus:border-transparent focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            {(errors.receiverName || errors.upiId) && (
              <p className="mt-2 text-xs text-red-400">
                {errors.receiverName || errors.upiId}
              </p>
            )}

            {/* Amount */}
            <div
              className={`mt-4 flex items-center rounded-xl border-2 bg-[#131313] px-4 py-4 ${
                errors.amount ? "border-red-500" : "border-zinc-700 focus-within:border-[#7c5cfc]"
              }`}
            >
              <span className="mr-3 text-2xl text-zinc-500">₹</span>
              <input
                id="amount"
                  placeholder="Enter amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(v)) setAmount(v);
                }}
                maxLength={12}
                aria-label="Amount"
                className="w-full bg-transparent text-2xl font-semibold text-white placeholder:font-semibold placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-xs text-red-400">{errors.amount}</p>
            )}

            {/* Message (optional) */}
            <div className="mt-3 rounded-xl border-2 border-zinc-700 bg-[#131313] px-4 py-4 focus-within:border-[#7c5cfc]">
              <input
                id="message"
                  placeholder="Add a message (optional)"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
                aria-label="Message (optional)"
                className="w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="mt-auto bg-[#1c1c1c] px-4 py-4">
            <button
              type="submit"
              className={`w-full rounded-lg py-4 text-base font-bold transition-colors ${
                hasError
                  ? "bg-zinc-600 text-zinc-300"
                  : "bg-[#7c5cfc] text-white hover:bg-[#6b4be0]"
              }`}
            >
              Proceed To Pay
            </button>
          </div>
        </form>
      </div>
      {showSheet && (
        <PaymentSheet
          name={receiverName}
          upiId={upiId}
          amount={formattedAmount}
          onClose={() => setShowSheet(false)}
          onPay={() =>
            navigate({
              to: "/pin",
              search: {
                name: receiverName,
                upi: upiId,
                amount,
                message: message.trim() || "",
              },
            })
          }
        />
      )}
    </div>
  );
}
