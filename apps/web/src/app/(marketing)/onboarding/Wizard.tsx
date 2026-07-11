"use client";

/**
 * Onboarding wizard — 4 steps, keyboard-friendly, animated.
 *
 * Steps:
 *   1. Identity  — workspace name + owner name + email
 *   2. Industry  — what kind of business
 *   3. Shape     — company size + team structure
 *   4. Goal      — what success looks like
 *
 * On submit, calls the `completeOnboarding` server action, sets a
 * session, and routes to /inbox. The wizard is the only entry point
 * in the app — there is no "Skip" path; the destination sidebar is
 * meaningless without a workspace.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  OptionCard,
  Stepper,
} from "@orvix/ui";
import type {
  CompanySize,
  Industry,
  PrimaryGoal,
  TeamStructure,
} from "@/server/store";

import { completeOnboarding } from "./actions";

const STEPS = [
  { key: "identity", label: "Identity" },
  { key: "industry", label: "Industry" },
  { key: "shape", label: "Shape" },
  { key: "goal", label: "Goal" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const INDUSTRIES: { key: Industry; label: string; description: string; icon: string }[] = [
  { key: "agency",        label: "Agency",         description: "Creative, marketing, dev shop", icon: "M3 7l9-4 9 4-9 4v10l-9 4-9-4V7z" },
  { key: "saas",          label: "SaaS",           description: "B2B or B2C software product",    icon: "M3 7h18M3 12h18M3 17h12" },
  { key: "ecommerce",     label: "E-commerce",     description: "Online retail, DTC brand",       icon: "M3 6h18l-2 12H5L3 6z M3 6L5 3h14l2 3" },
  { key: "consulting",    label: "Consulting",     description: "Advisory, fractional",           icon: "M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" },
  { key: "manufacturing", label: "Manufacturing",  description: "Production, supply chain",       icon: "M3 21V8l9-5 9 5v13 M3 21h18 M9 21V12h6v9" },
  { key: "education",     label: "Education",      description: "School, training, courses",      icon: "M12 3l10 5-10 5L2 8z M6 10v5a6 6 0 0012 0v-5" },
  { key: "healthcare",    label: "Healthcare",     description: "Clinic, practice, wellness",     icon: "M12 4v16M4 12h16" },
  { key: "finance",       label: "Finance",        description: "Wealth, lending, accounting",    icon: "M3 17l6-6 4 4 8-8 M14 7h7v7" },
  { key: "realestate",    label: "Real estate",    description: "Brokerage, property mgmt",       icon: "M3 12l9-9 9 9 M5 10v10h14V10" },
  { key: "media",         label: "Media",          description: "Publishing, podcast, video",     icon: "M4 4h16v12H4z M8 20h8 M12 16v4" },
  { key: "nonprofit",     label: "Nonprofit",      description: "Charity, foundation, association", icon: "M12 21s-7-5-7-12a7 7 0 1114 0c0 7-7 12-7 12z" },
  { key: "other",         label: "Something else", description: "We'll adapt the shape",          icon: "M12 5v14M5 12h14" },
];

const SIZES: { key: CompanySize; label: string; description: string }[] = [
  { key: "solo",      label: "Just me",          description: "Founder + maybe a contractor" },
  { key: "2-10",      label: "2 – 10",           description: "Small team" },
  { key: "11-50",     label: "11 – 50",          description: "Growing company" },
  { key: "51-200",    label: "51 – 200",         description: "Scale-up" },
  { key: "201-1000",  label: "201 – 1,000",      description: "Mid-market" },
  { key: "1000+",     label: "1,000+",           description: "Enterprise" },
];

const STRUCTURES: { key: TeamStructure; label: string; description: string }[] = [
  { key: "flat",       label: "Flat",        description: "Everyone reports to the founder" },
  { key: "functional", label: "Functional",  description: "Departments: Sales, Eng, Ops, …" },
  { key: "divisional", label: "Divisional",  description: "By product line or region" },
  { key: "matrix",     label: "Matrix",      description: "Functional × project" },
  { key: "pod",        label: "Pods",        description: "Cross-functional squads" },
];

const GOALS: { key: PrimaryGoal; label: string; description: string }[] = [
  { key: "ship-faster",     label: "Ship faster",          description: "Reduce cycle time end-to-end" },
  { key: "win-clients",     label: "Win more clients",     description: "Grow pipeline, close deals" },
  { key: "deliver-on-time", label: "Deliver on time",      description: "Hit dates, reduce fire drills" },
  { key: "grow-revenue",    label: "Grow revenue",         description: "Identify + execute on upside" },
  { key: "reduce-overhead", label: "Reduce overhead",      description: "Cut the busywork" },
  { key: "build-product",   label: "Build the product",    description: "Roadmap, specs, releases" },
  { key: "manage-team",     label: "Manage the team",      description: "Capacity, focus, follow-through" },
  { key: "stay-compliant",  label: "Stay compliant",       description: "SOC 2, GDPR, audit-ready" },
];

interface FormState {
  workspaceName: string;
  ownerName: string;
  ownerEmail: string;
  industry: Industry | "";
  companySize: CompanySize | "";
  teamStructure: TeamStructure | "";
  primaryGoal: PrimaryGoal | "";
}

const INITIAL: FormState = {
  workspaceName: "",
  ownerName: "",
  ownerEmail: "",
  industry: "",
  companySize: "",
  teamStructure: "",
  primaryGoal: "",
};

export function Wizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<StepKey>("identity");
  const [form, setForm] = React.useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext = (() => {
    if (step === "identity") return form.workspaceName.trim().length >= 2 && form.ownerName.trim().length >= 2 && /.+@.+\..+/.test(form.ownerEmail);
    if (step === "industry") return form.industry !== "";
    if (step === "shape") return form.companySize !== "" && form.teamStructure !== "";
    if (step === "goal") return form.primaryGoal !== "";
    return false;
  })();

  const next = () => {
    if (step === "identity") setStep("industry");
    else if (step === "industry") setStep("shape");
    else if (step === "shape") setStep("goal");
  };
  const back = () => {
    if (step === "industry") setStep("identity");
    else if (step === "shape") setStep("industry");
    else if (step === "goal") setStep("shape");
  };

  const onSubmit = async () => {
    if (!canNext || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const reqId = crypto.randomUUID();
      const result = await completeOnboarding(
        {
          workspaceName: form.workspaceName.trim(),
          ownerName: form.ownerName.trim(),
          ownerEmail: form.ownerEmail.trim().toLowerCase(),
          industry: form.industry as Industry,
          companySize: form.companySize as CompanySize,
          teamStructure: form.teamStructure as TeamStructure,
          primaryGoal: form.primaryGoal as PrimaryGoal,
        },
        reqId,
      );
      if (!result.ok) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      router.replace("/inbox");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  // Keyboard: Enter on identity / shape advances; on goal submits.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (step === "goal" && canNext) {
      e.preventDefault();
      void onSubmit();
    } else if (canNext) {
      e.preventDefault();
      next();
    }
  };

  return (
    <div
      onKeyDown={onKeyDown}
      className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12"
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-text-primary">
            ORVIX
          </span>
          <Badge tone="neutral">Onboarding</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Let&apos;s set up your workspace.
        </h1>
        <p className="max-w-prose text-sm text-text-secondary leading-relaxed">
          Four questions. ORVIX builds the rest — roles, departments, the
          pipeline, the AI Assistant — from your answers.
        </p>
      </header>

      <Stepper
        steps={STEPS.map((s) => ({ key: s.key, label: s.label }))}
        current={stepIndex}
      />

      <Card className="overflow-hidden">
        <CardBody className="p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === "identity" && (
                <IdentityStep form={form} set={set} />
              )}
              {step === "industry" && (
                <IndustryStep form={form} set={set} />
              )}
              {step === "shape" && (
                <ShapeStep form={form} set={set} />
              )}
              {step === "goal" && (
                <GoalStep form={form} set={set} />
              )}
            </motion.div>
          </AnimatePresence>
        </CardBody>
      </Card>

      {error ? (
        <div
          role="alert"
          className="rounded-sm border border-status-danger/30 bg-status-danger/5 px-3 py-2 text-sm text-status-danger"
        >
          {error}
        </div>
      ) : null}

      <footer className="flex items-center justify-between">
        <div>
          {stepIndex > 0 ? (
            <Button variant="ghost" onClick={back} disabled={submitting}>
              ← Back
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted tabular-nums">
            {stepIndex + 1} / {STEPS.length}
          </span>
          {step !== "goal" ? (
            <Button onClick={next} disabled={!canNext}>
              Continue
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={!canNext}
              aria-busy={submitting}
            >
              {submitting ? "Building your workspace…" : "Build my workspace"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

function IdentityStep({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-text-primary">
          Who are you?
        </h2>
        <p className="text-sm text-text-secondary">
          The name of your workspace and the first Owner. You can rename and
          invite later.
        </p>
      </header>

      <Field>
        <FieldLabel htmlFor="workspaceName">Workspace name</FieldLabel>
        <FieldDescription>
          Shown in the sidebar header. Your company, project, or brand.
        </FieldDescription>
        <Input
          id="workspaceName"
          autoFocus
          autoComplete="organization"
          placeholder="e.g. Northwind Studio"
          value={form.workspaceName}
          onChange={(e) => set("workspaceName", e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="ownerName">Your name</FieldLabel>
        <FieldDescription>
          Used in activity logs and comment authors.
        </FieldDescription>
        <Input
          id="ownerName"
          autoComplete="name"
          placeholder="Casey Rivera"
          value={form.ownerName}
          onChange={(e) => set("ownerName", e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="ownerEmail">Email</FieldLabel>
        <FieldDescription>
          We&apos;ll send the magic-link sign-in here. Phase 0 just uses it to
          detect a returning Owner.
        </FieldDescription>
        <Input
          id="ownerEmail"
          type="email"
          autoComplete="email"
          placeholder="casey@northwind.co"
          value={form.ownerEmail}
          onChange={(e) => set("ownerEmail", e.target.value)}
        />
      </Field>
    </div>
  );
}

function IndustryStep({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-text-primary">
          What kind of business?
        </h2>
        <p className="text-sm text-text-secondary">
          We tune the work-item defaults and the AI&apos;s vocabulary to your
          world. Pick the closest fit.
        </p>
      </header>

      <div
        role="radiogroup"
        aria-label="Industry"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {INDUSTRIES.map((i) => (
          <OptionCard
            key={i.key}
            name="industry"
            value={i.key}
            label={i.label}
            description={i.description}
            checked={form.industry === i.key}
            onChange={() => set("industry", i.key)}
            icon={
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={i.icon} />
              </svg>
            }
          />
        ))}
      </div>
    </div>
  );
}

function ShapeStep({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-text-primary">
          How is the team shaped?
        </h2>
        <p className="text-sm text-text-secondary">
          Determines the default roles and how work is routed between them.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <FieldLabel className="text-sm">Team size</FieldLabel>
        <div
          role="radiogroup"
          aria-label="Team size"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {SIZES.map((s) => (
            <OptionCard
              key={s.key}
              name="companySize"
              value={s.key}
              label={s.label}
              description={s.description}
              checked={form.companySize === s.key}
              onChange={() => set("companySize", s.key)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <FieldLabel className="text-sm">Org structure</FieldLabel>
        <div role="radiogroup" aria-label="Org structure" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STRUCTURES.map((s) => (
            <OptionCard
              key={s.key}
              name="teamStructure"
              value={s.key}
              label={s.label}
              description={s.description}
              checked={form.teamStructure === s.key}
              onChange={() => set("teamStructure", s.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GoalStep({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-text-primary">
          What does success look like?
        </h2>
        <p className="text-sm text-text-secondary">
          The AI Assistant prioritizes suggestions around this. You can
          change it later.
        </p>
      </header>

      <div
        role="radiogroup"
        aria-label="Primary goal"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {GOALS.map((g) => (
          <OptionCard
            key={g.key}
            name="primaryGoal"
            value={g.key}
            label={g.label}
            description={g.description}
            checked={form.primaryGoal === g.key}
            onChange={() => set("primaryGoal", g.key)}
          />
        ))}
      </div>
    </div>
  );
}
