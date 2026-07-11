# Runbook — Onboarding: 4 Questions

> **Operationalizing PRD §03 §2.1 — the 4-question intelligent intake.**

Phase 0 ships the API contract (`/v1/dna/intake`). Phase 1 wires the
model. This runbook is what every consumer of the endpoint will rely on.

## The 4 questions (v0.2)

The intake is constrained to a curated bank. Phase 1 ship order:

1. **"What do you sell, to whom, in roughly what volume?"** — covers
   industry, business model, customer segments, products/services, primary
   KPI target.
2. **"Walk me through what happens from the moment a new sale arrives to
   the moment they pay."** — covers sales process, delivery process,
   approval hierarchy.
3. **"Where do your people spend their day?"** — covers departments,
   roles, workload shape.
4. **"What's the one number you'd care about most this quarter?"** —
   covers primary KPI and goal-now.

After the 4 answers:

- The system asks: *"Want a deeper intake, or trust the engine to
  infer the rest from these answers plus your activity in the first
  14 days?"* Default: trust inference.
- The system asks the cross-tenant pattern consent question (default
  OFF; explicit specific opt-in).
- The system composes.

## What the runtime guarantees

- **Total intake time** (Phase 0 model): target p50 < 5 min; p95 < 15 min.
- **Field coverage at completion**: every required DNA field is either
  populated at confidence ≥ 0.5 OR marked `pending_verification`
  (verifier-aware).
- **No selling in intake.** Plain language only. No marketing copy.

## Edge cases

| Case | Behavior |
|------|----------|
| Owner closes the tab mid-intake | Resumable from where they left off; never a re-start. |
| Owner picks "I don't know" on Q1 | Vertical template fallback (agency only in v0.2). |
| Owner declines cross-tenant pattern | `enabled: false` persisted; no follow-up question. |
| Inference can't get required fields within 14 days | Owner asked 2 supplementary questions; never a full re-intake. |
