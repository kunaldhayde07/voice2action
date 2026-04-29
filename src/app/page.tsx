import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* hero nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">

            {/* ── Logo: V2A text badge ── */}
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight leading-none">
                V2A
              </span>
            </div>

            <span className="font-bold text-slate-900">Voice2Action</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              Authority Panel
            </Link>
            <Link href="/report"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              Report Issue
            </Link>
          </div>
        </div>
      </nav>

      {/* hero */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Real-time civic intelligence platform
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Your Voice Drives<br />
            <span className="text-blue-600">Local Change</span>
          </h1>

          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Report local issues, vote to prioritize them, and watch your city respond.
            Built for citizens, designed for impact.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/report"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-base font-semibold transition-all shadow-lg hover:-translate-y-0.5">
              Report an Issue →
            </Link>
            <Link href="/feed"
              className="px-8 py-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-2xl text-base font-semibold transition-all hover:-translate-y-0.5">
              View All Issues
            </Link>
            <Link href="/map"
              className="px-8 py-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-2xl text-base font-semibold transition-all hover:-translate-y-0.5">
              🗺️ Live Map
            </Link>
          </div>
        </div>

        {/* features grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "📍",
                title: "Geo-tagged Reports",
                desc: "Auto-detect location and pin issues precisely on the map with drag & drop.",
              },
              {
                icon: "🧠",
                title: "AI Categorization",
                desc: "Smart NLP auto-categorizes your issue and detects duplicates.",
              },
              {
                icon: "🔥",
                title: "Priority Engine",
                desc: "Composite scoring based on votes, urgency, location, and time.",
              },
              {
                icon: "🏛️",
                title: "Authority Dashboard",
                desc: "Real-time governance panel with status tracking and proof of resolution.",
              },
            ].map((f, i) => (
              <div key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* stats bar */}
        <div className="bg-slate-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {[
                { num: "10K+", label: "Issues Reported" },
                { num: "98%",  label: "Resolution Rate" },
                { num: "47",   label: "Cities Active" },
                { num: "2.4M", label: "Citizens Voting" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-4xl font-bold text-white">{s.num}</p>
                  <p className="text-slate-400 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
