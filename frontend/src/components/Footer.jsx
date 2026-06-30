import { Link } from "react-router";
import { HeadphonesIcon, ShoppingBagIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-base-300 bg-base-100">
      <div className="px-4 py-10 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-base-content">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingBagIcon className="size-5" aria-hidden />
              </span>
              SenpaiMart
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Curated products with secure checkout. Paid orders include priority
              support chat and optional video calls.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Shop
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-base-content/80 hover:text-primary">
                  All products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-base-content/80 hover:text-primary">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-base-content/80 hover:text-primary">
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Support
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <HeadphonesIcon
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>
                  Order-scoped chat after payment; video links shared in-thread.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Company
            </h3>
            <p className="mt-3 text-sm text-muted">
              Built for teams who care about clear specs, fast fulfillment, and
              human support when it matters.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-base-300 pt-6">
          <p className="text-center text-xs text-muted">
            © {new Date().getFullYear()} SenpaiMart · All prices in USD
          </p>
        </div>
      </div>
    </footer>
  );
}
