import {
  HeadphonesIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";
import { Link } from "react-router";

const features = [
  {
    icon: TruckIcon,
    title: "Free Shipping",
    desc: "On qualifying orders — fast, tracked delivery.",
    iconBg: "bg-orange-50 text-primary",
    link: "/#catalog",
  },
  {
    icon: RotateCcwIcon,
    title: "Easy Returns",
    desc: "Hassle-free returns within 30 days.",
    iconBg: "bg-indigo-50 text-secondary",
    link: "/orders",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure Payments",
    desc: "Encrypted checkout powered by Polar.",
    iconBg: "bg-emerald-50 text-success",
    link: "/cart",
  },
];

export function FeatureCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {features.map(({ icon: Icon, title, desc, iconBg, link }) => (
        <Link
          key={title}
          to={link}
          className="group flex items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-(--shadow-card) transition hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover)"
        >
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}
          >
            <Icon className="size-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base-content">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
            <span className="mt-2 inline-flex items-center text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
              Learn more →
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export function TrustStrip() {
  return (
    <section className="flex items-center justify-center gap-2 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-sm text-muted">
      <HeadphonesIcon className="size-4 shrink-0 text-primary" aria-hidden />
      <span>Priority support chat &amp; video on paid orders</span>
    </section>
  );
}
