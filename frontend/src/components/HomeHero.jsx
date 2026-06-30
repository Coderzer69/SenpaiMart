import { Link } from "react-router";
import { ArrowRightIcon } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-(--shadow-card)">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            NEW ARRIVALS
          </span>

          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-base-content md:text-4xl lg:text-[2.75rem]">
            Everything You Need,
            <br />
            <span className="text-primary">One Place.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
            Discover thousands of quality products across every category.
            <br />
            Enjoy exclusive deals, secure payments, fast delivery, and hassle-free returns.
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

        {/* Right Hero Panel */}
        <div className="relative min-h-[280px] overflow-hidden lg:min-h-[100%] bg-base-200/50">
          <img
            src="/images/hero-products.png"
            alt="Premium Products Collection"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}