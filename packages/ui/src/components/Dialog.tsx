"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "./icons";

import { cn } from "../lib/cn";

/**
 * Dialog — ORVIX Design System v1.0.
 *
 * Radix-based. Two surfaces: `Dialog` (centered modal, 560px) and
 * `Sheet` (right slide-in, 480px). Both share the same backdrop:
 * surface-canvas overlay + 4 elevation + 1px border.
 *
 * Composition law: dialogs are for focused tasks. Sheets are for
 * contextual detail that doesn't take over the screen.
 */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-modal bg-surface-overlay",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showClose?: boolean;
  }
>(({ className, children, showClose = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-modal -translate-x-1/2 -translate-y-1/2",
        "w-full max-w-[560px] p-6 rounded-md",
        "bg-surface-elevated border border-surface-divider shadow-4",
        "duration-default ease-out-quint",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    >
      {children}
      {showClose ? (
        <DialogPrimitive.Close
          aria-label="Close"
          className={cn(
            "absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-sm",
            "text-text-muted hover:text-text-primary hover:bg-surface-inset",
            "transition-colors duration-fast ease-out-quint",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
          )}
        >
          <X size={14} />
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1.5 mb-4", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight text-text-primary", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-text-secondary leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center justify-end gap-2 mt-6 pt-4 border-t border-surface-divider", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

/**
 * Sheet — side panel. Right-aligned by default, slide-in.
 */
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-modal bg-surface-overlay",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "right" | "left";
  }
>(({ className, children, side = "right", ...props }, ref) => (
  <DialogPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-0 z-modal h-full w-full max-w-[480px] p-6",
        "bg-surface-elevated border-l border-surface-divider shadow-4",
        "duration-slow ease-in-out-quart",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        side === "right" ? "right-0 border-l" : "left-0 border-r",
        side === "right"
          ? "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          : "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className={cn(
          "absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-sm",
          "text-text-muted hover:text-text-primary hover:bg-surface-inset",
          "transition-colors duration-fast ease-out-quint",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
        )}
      >
        <X size={14} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
SheetContent.displayName = "SheetContent";

export {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  SheetOverlay,
  SheetContent,
};
