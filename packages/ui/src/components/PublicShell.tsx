"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "../lib/cn";
import { Sparkles } from "./icons";

/**
 * PublicShell — ORVIX Design System v1.0.
 *
 * The chrome for the unauthed surface (landing, onboarding, signin,
 * pricing, docs, 404). Same tokens as the AppShell, smaller surface
 * area. Three pieces:
 *
 *   - TopNav: brand + product links + auth CTA
 *   - Main slot: <main> with the page content
 *   - Footer: 3-column with the brand monogram + monospace links
 *
 * The brand monogram is the same as the AppShell sidebar (gradient
 * square with the conductor's mark). The footer wordmark is set in
 * Geist Mono. The whole shell is dark-first.
 */
export interface PublicShellProps {
  children: React.ReactNode;
  /** Override the current nav highlight. */
  current?: "product" | "pricing" | "docs" | "signin" | "onboarding";
}

const NAV_ITEMS = [
  { key: "product",   label: "Product",    href: "/#product" },
  { key: "pricing",   label: "Pricing",    href: "/pricing" },
  { key: "docs",      label: "Docs",       href: "/docs" },
] as const;

export function PublicShell({ children, current }: PublicShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-surface-canvas">
      {/* The Pulse signature line, at the very top of the public surface */}
      <div className="fixed left-0 right-0 top-0 z-pulse h-px bg-surface-divider" />

      {/* Skip-to-content link for keyboard users. Visible only on focus. */}
      <a
        href="#orvix-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-1/2 focus:z-toast focus:-translate-x-1/2 focus:inline-flex focus:h-9 focus:items-center focus:rounded-md focus:border focus:border-brand-accent focus:bg-brand-accent focus:px-3 focus:text-xs focus:font-semibold focus:text-text-on-accent focus:shadow-2"
      >
        Skip to main content
      </a>

      <TopNav current={current} />
      <main id="orvix-main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function TopNav({ current }: { current?: PublicShellProps["current"] }) {
  return (
    <header className="sticky top-0 z-sticky border-b border-surface-divider bg-surface-canvas/85 backdrop-blur-glass">
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-text-primary"
        >
          <BrandMark />
          <span className="text-sm font-semibold tracking-tight">ORVIX</span>
          <span className="hidden text-2xs uppercase tracking-[0.12em] text-text-muted sm:inline">
            Adaptive Business OS
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = current === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm transition-colors duration-fast ease-out-quint",
                  active
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="hidden text-sm text-text-secondary transition-colors hover:text-text-primary sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-text-on-accent transition-all duration-fast ease-out-quint hover:bg-brand-accent/90"
          >
            <Sparkles size={12} />
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand-accent via-brand-ai to-brand-ai/60 text-text-on-accent shadow-1 transition-transform duration-default ease-out-quint group-hover:scale-105"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Conductor's mark: a slash with a dot above. */}
        <line x1="6" y1="20" x2="18" y2="4" />
        <circle cx="18" cy="4" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-surface-divider bg-surface-canvas">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-mono text-sm font-semibold tracking-tight text-text-primary">
              ORVIX
            </span>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-text-muted">
            The adaptive business operating system. One workspace. One
            Assistant. Bounded by policy.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { label: "Overview",    href: "/#product" },
            { label: "Pricing",     href: "/pricing" },
            { label: "Changelog",   href: "/changelog" },
            { label: "Status",      href: "/status" },
          ]}
        />
        <FooterCol
          title="Resources"
          links={[
            { label: "Documentation", href: "/docs" },
            { label: "API reference", href: "/docs/api" },
            { label: "Examples",      href: "/docs/examples" },
            { label: "Support",       href: "mailto:support@orvix.app" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "About",   href: "/about" },
            { label: "Privacy", href: "/privacy" },
            { label: "Terms",   href: "/terms" },
            { label: "Security", href: "/security" },
          ]}
        />
      </div>
      <div className="border-t border-surface-divider">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-6 py-4 text-2xs text-text-muted sm:flex-row sm:items-center">
          <span className="font-mono">© {new Date().getFullYear()} ORVIX — v0.3.0-m3</span>
          <span className="font-mono">Built with the v1.0 design system.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-mono text-2xs uppercase tracking-[0.12em] text-text-muted">
        {title}
      </h3>
      <ul className="mt-3 flex flex-col gap-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-text-secondary transition-colors duration-fast ease-out-quint hover:text-text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
