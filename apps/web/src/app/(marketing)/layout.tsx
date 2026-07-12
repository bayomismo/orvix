import type { ReactNode } from "react";

import { PublicShell } from "@orvix/ui";

/**
 * (marketing) layout — the public, unauthed surface.
 *
 * Wraps every page in the (marketing) route group with the
 * PublicShell chrome (top nav, footer). The shell is dark-first,
 * uses the same tokens as the AppShell, and reuses the brand
 * monogram.
 *
 * Children render inside <main> via the PublicShell slot.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
