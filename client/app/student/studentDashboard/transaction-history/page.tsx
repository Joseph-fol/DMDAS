const transactions = [
  { id: "NX-4821", item: "CSE 311 - Advanced Web", date: "Oct 12, 2023", amount: "₦3,500" },
  { id: "MT-9920", item: "MTH 301 - Calculus III", date: "Oct 05, 2023", amount: "₦2,800" },
  { id: "PH-1144", item: "PHY 305 - Thermodynamics", date: "Sep 28, 2023", amount: "₦3,200" },
];

export default function Page() {
  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Transaction History</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Track your manual purchases</h1>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="divide-y divide-slate-200">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="grid gap-3 px-6 py-5 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
              <div>
                <p className="font-semibold text-slate-950">{transaction.item}</p>
                <p className="text-sm text-slate-500">Receipt: {transaction.id}</p>
              </div>
              <p className="text-sm text-slate-500">{transaction.date}</p>
              <p className="text-sm font-semibold text-slate-900">{transaction.amount}</p>
              <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Successful
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}