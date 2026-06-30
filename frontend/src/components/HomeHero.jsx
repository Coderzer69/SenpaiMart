import { Link } from "react-router";
import { ArrowRightIcon } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-(--shadow-card)">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            New Collection
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-base-content md:text-4xl lg:text-[2.75rem]">
            Find Your Style,
            <br />
            <span className="text-primary">Love Your Look</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
            Curated audio, workspace, and lifestyle products with secure checkout.
            After payment, get priority support chat and video on your order page.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#catalog"
              className="btn btn-primary gap-2 rounded-2xl px-6 shadow-md"
            >
              Shop Now
              <ArrowRightIcon className="size-4" aria-hidden />
            </a>
            <Link
              to="/cart"
              className="btn btn-ghost gap-2 rounded-2xl border border-base-300 px-6"
            >
              View Cart
            </Link>
          </div>
        </div>

        <div className="relative min-h-[220px] bg-linear-to-br from-primary/20 via-secondary/10 to-base-200 lg:min-h-[320px]">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,107,74,0.35),transparent_55%)]"
            aria-hidden
          />
          <div className="absolute inset-0 flex items-end justify-center p-8">
            <div className="w-full max-w-sm rounded-2xl border border-white/60 bg-base-100/90 p-4 shadow-lg backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Featured
              </p>
              <p className="mt-1 text-lg font-bold text-base-content">
                Premium picks, ready to ship
              </p>
              <p className="mt-1 text-sm text-muted">
                Secure payments · Human support on every paid order
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
