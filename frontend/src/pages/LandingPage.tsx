import { useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

const featuredProducts = [
  {
    name: 'Atlas AI Procurement Suite',
    category: 'Software',
    price: '$1,499',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    href: '/marketplace',
  },
  {
    name: 'Northstar Route Optimization',
    category: 'Logistics',
    price: '$980',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    href: '/marketplace',
  },
  {
    name: 'SignalOps Automation Cloud',
    category: 'Automation',
    price: '$1,295',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    href: '/marketplace',
  },
];

export function LandingPage(): ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredProducts.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="theme-luxury relative min-h-screen overflow-hidden text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.15),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.18),transparent_26%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-12 rounded-[28px] border border-amber-400/20 bg-slate-950/75 px-4 py-3 shadow-[0_18px_55px_rgba(2,6,23,0.45)] backdrop-blur-xl md:mb-16 md:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 font-bold text-slate-950 shadow-lg shadow-amber-500/25">D</div>
              <div>
                <p className="text-base font-semibold text-white md:text-lg">Dynamic B2B Marketplace</p>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-300">Predictive commerce intelligence</p>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a href="#platform" className="nav-link transition hover:text-white">Platform</a>
              <a href="#solutions" className="nav-link transition hover:text-white">Solutions</a>
              <a href="#analytics" className="nav-link transition hover:text-white">Analytics</a>
              <a href="#security" className="nav-link transition hover:text-white">Security</a>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <Link to="/login" className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500">Sign in</Link>
              <Link to="/register" className="gradient-btn rounded-full px-4 py-2 text-sm font-medium text-white">Create account</Link>
            </div>

            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-lg text-slate-100 md:hidden"
            >
              {mobileMenuOpen ? '×' : '☰'}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 space-y-2 rounded-2xl border border-slate-700 bg-slate-900/90 p-3 md:hidden">
              <a href="#platform" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Platform</a>
              <a href="#solutions" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Solutions</a>
              <a href="#analytics" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Analytics</a>
              <a href="#security" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Security</a>
              <div className="mt-2 grid gap-2 pt-2">
                <Link to="/login" className="rounded-xl border border-slate-700 px-3 py-2 text-center text-sm text-slate-100">Sign in</Link>
                <Link to="/register" className="gradient-btn rounded-xl px-3 py-2 text-center text-sm font-medium text-white">Create account</Link>
              </div>
            </div>
          )}
        </header>

        <section className="grid items-center gap-10 pb-12 md:grid-cols-2">
          <div className="reveal-up">
            <span className="mb-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-amber-100">
              executive commerce OS
            </span>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              AI-powered marketplace infrastructure for modern B2B growth.
            </h1>
            <p className="mt-6 max-w-lg text-base text-slate-300 md:text-lg">
              Unify procurement, vendor operations, and predictive recommendations into one secure, conversion-focused platform built for enterprise buyers and suppliers.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="gradient-btn rounded-xl px-5 py-3 font-medium text-white shadow-[0_18px_40px_rgba(245,158,11,0.22)]">
                Request demo
              </Link>
              <Link to="/marketplace" className="rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 font-medium text-slate-100 transition hover:border-slate-500">
                Explore platform
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <div>
                <p className="text-2xl font-bold text-white">4.8x</p>
                <p className="text-slate-400">buyer conversion</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">72%</p>
                <p className="text-slate-400">procurement efficiency</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-slate-400">platform uptime</p>
              </div>
            </div>
          </div>

          <div className="soft-card ambient-ring float-slow rounded-[30px] p-6 reveal-up">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>AI demand forecast</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">+18.4%</span>
                </div>
                <div className="mt-5 flex h-32 items-end gap-2">
                  {[30, 48, 36, 64, 52, 86, 74, 96].map((bar, index) => (
                    <div
                      key={index}
                      className="w-full rounded-t-xl bg-gradient-to-t from-amber-300 via-orange-400 to-cyan-400"
                      style={{ height: `${bar}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Vendor pipeline</p>
                  <p className="mt-2 text-3xl font-bold text-white">$8.4M</p>
                  <p className="mt-1 text-xs text-emerald-300">↑ 12.1% month over month</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Recommendation score</p>
                  <p className="mt-2 text-3xl font-bold text-white">94/100</p>
                  <p className="mt-1 text-xs text-cyan-300">AI ranked for buyer intent</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-carousel-shell mt-12 overflow-hidden rounded-[30px] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.35)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Featured products</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Buyer favorites this week</h2>
            </div>
            <Link to="/marketplace" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:border-slate-500">View all</Link>
          </div>

          <div className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950/60">
            {featuredProducts.map((product, index) => (
              <Link
                key={product.name}
                to={product.href}
                className={`feature-carousel-card absolute inset-0 ${index === activeIndex ? 'active' : 'inactive'}`}
                style={{
                  opacity: index === activeIndex ? 1 : 0,
                  zIndex: index === activeIndex ? 2 : 1,
                }}
              >
                <div className="relative h-[360px] overflow-hidden md:h-[420px]">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/10" />
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full p-6 md:p-8">
                      <div className="max-w-lg">
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{product.category}</p>
                        <h3 className="mt-3 text-2xl font-semibold text-white md:text-4xl">{product.name}</h3>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="text-xl font-bold text-white md:text-2xl">{product.price}</span>
                          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Best seller</span>
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                          <span className="rounded-full bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm">AI recommended</span>
                          <span className="rounded-full bg-blue-500/15 px-3 py-2 text-sm text-blue-100 backdrop-blur-sm">High demand</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {featuredProducts.map((product, index) => (
              <button
                key={product.name}
                type="button"
                aria-label={`View ${product.name}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-cyan-400' : 'w-2.5 bg-slate-600 hover:bg-slate-500'}`}
              />
            ))}
          </div>
        </section>

        <section id="platform" className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { title: 'Smart sourcing', text: 'Surface the best-fit vendors automatically with predictive buying signals.', accent: 'from-amber-400/25 to-orange-500/10' },
            { title: 'Procurement automation', text: 'Streamline approvals, orders, and supplier coordination in one workspace.', accent: 'from-emerald-500/25 to-teal-500/10' },
            { title: 'Revenue intelligence', text: 'Turn customer behavior into better pricing, inventory, and retention decisions.', accent: 'from-cyan-500/25 to-blue-500/10' },
          ].map((item) => (
            <div key={item.title} className={`feature-card rounded-3xl border border-slate-800 bg-gradient-to-br ${item.accent} p-[1px]`}>
              <div className="h-full rounded-[calc(1.5rem-1px)] bg-slate-950/90 p-5">
                <div className="mb-4 h-10 w-10 rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-red-500" />
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
