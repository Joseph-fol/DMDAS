const manuals = [
  { title: "CSE 311 - Advanced Web", level: "300 Level", price: "₦3,500" },
  { title: "MTH 301 - Calculus III", level: "300 Level", price: "₦2,800" },
  { title: "PHY 305 - Thermodynamics", level: "300 Level", price: "₦3,200" },
];

export default function Page() {
  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Available Manuals</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Browse manuals for this semester</h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {manuals.map((manual) => (
          <article key={manual.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold text-slate-500">{manual.level}</p>
            <h2 className="mt-2 text-lg font-bold text-slate-950">{manual.title}</h2>
            <p className="mt-4 text-2xl font-black text-slate-900">{manual.price}</p>
            <button type="button" className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              View manual
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}