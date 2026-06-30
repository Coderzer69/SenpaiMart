import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { HeadphonesIcon, MailIcon, ShieldCheckIcon, ZapIcon } from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";

/* ── tiny hook: fires once when el enters the viewport ────────────────── */
function useFadeInOnScroll(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ── animated nav link with underline slide ───────────────────────────── */
function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="
        group relative inline-block text-base-content/70
        transition-colors duration-200 hover:text-primary
      "
    >
      {children}
      {/* underline that slides in from left on hover */}
      <span
        aria-hidden
        className="
          absolute -bottom-0.5 left-0 h-px w-0 rounded-full bg-primary
          transition-[width] duration-300 ease-out group-hover:w-full
        "
      />
    </Link>
  );
}

/* ── icon pill with soft glow on hover ────────────────────────────────── */
function IconPill({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="
          mt-0.5 flex size-7 shrink-0 items-center justify-center
          rounded-lg bg-primary/8 text-primary
          transition-all duration-300
          hover:bg-primary/15 hover:shadow-[0_0_12px_2px_rgba(255,107,74,0.18)]
          hover:scale-110
        "
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="text-sm leading-relaxed text-muted">{children}</span>
    </li>
  );
}

export default function Footer() {
  const { ref, visible } = useFadeInOnScroll(0.1);

  const colBase =
    "transition-all duration-700 ease-out";
  const hidden = "opacity-0 translate-y-6";
  const shown  = "opacity-100 translate-y-0";

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-base-300 bg-base-100">

      {/* ── decorative top-gradient accent line ──────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      {/* ── very subtle radial glow behind brand column ──────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />

      <div ref={ref} className="relative px-4 py-12 md:px-8 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

          {/* ── Col 1: Brand ─────────────────────────────────────────── */}
          <div
            className={`${colBase} ${visible ? shown : hidden}`}
            style={{ transitionDelay: "0ms" }}
          >
            {/* logo + wordmark with scale on hover */}
            <Link
              to="/"
              className="
                group inline-flex items-center gap-2.5
                font-bold text-base-content
              "
              aria-label="SenpaiMart home"
            >
              <span className="transition-transform duration-300 group-hover:scale-110 origin-left">
                <BrandLogo size={36} />
              </span>
              <span className="text-[17px] tracking-tight transition-colors duration-200 group-hover:text-primary">
                SenpaiMart
              </span>
            </Link>

            <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-muted">
              Curated products with secure checkout. Paid orders include priority
              support chat and optional video calls.
            </p>

            {/* subtle feature pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheckIcon, label: "Secure" },
                { icon: ZapIcon,         label: "Fast delivery" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="
                    inline-flex items-center gap-1.5 rounded-full border border-base-300
                    bg-base-200/60 px-3 py-1 text-[11px] font-medium text-muted
                    transition-all duration-200
                    hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm
                  "
                >
                  <Icon className="size-3" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Col 2: Shop ──────────────────────────────────────────── */}
          <div
            className={`${colBase} ${visible ? shown : hidden}`}
            style={{ transitionDelay: "80ms" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { to: "/",       label: "All products" },
                { to: "/cart",   label: "Cart"         },
                { to: "/orders", label: "Orders"       },
              ].map(({ to, label }) => (
                <li key={label}>
                  <FooterLink to={to}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Support ───────────────────────────────────────── */}
          <div
            className={`${colBase} ${visible ? shown : hidden}`}
            style={{ transitionDelay: "160ms" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              <IconPill icon={HeadphonesIcon}>
                Order-scoped chat after payment; video links shared in-thread.
              </IconPill>
              <IconPill icon={MailIcon}>
                Reach us via your order thread for fastest response.
              </IconPill>
            </ul>
          </div>

          {/* ── Col 4: Company ───────────────────────────────────────── */}
          <div
            className={`${colBase} ${visible ? shown : hidden}`}
            style={{ transitionDelay: "240ms" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Company
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Built for teams who care about clear specs, fast fulfillment, and
              human support when it matters.
            </p>

            {/* soft card / glow highlight */}
            <div
              className="
                mt-5 rounded-2xl border border-base-300 bg-base-200/50 p-4
                transition-all duration-300
                hover:border-primary/20 hover:bg-primary/[0.03]
                hover:shadow-[0_4px_20px_-4px_rgba(255,107,74,0.12)]
              "
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
                Our mission
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Premium products, transparent pricing, real human help.
              </p>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────── */}
        <div
          className={`
            mt-10 border-t border-base-300 pt-6
            ${colBase} ${visible ? shown : hidden}
          `}
          style={{ transitionDelay: "320ms" }}
        >
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-center text-xs text-muted">
              © {new Date().getFullYear()}{" "}
              <span className="font-medium text-base-content/80">SenpaiMart</span>
              {" "}· All prices in USD
            </p>

            {/* bottom glow strip */}
            <div
              aria-hidden
              className="h-px w-24 rounded-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 sm:w-32"
            />
          </div>
        </div>

      </div>
    </footer>
  );
}
