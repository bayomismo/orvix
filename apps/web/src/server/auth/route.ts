/**
 * Auth.js v5 — Next.js route exports (Milestone 1).
 *
 * next-auth@beta uses the new `auth(req)` shape: a single function
 * handles GET (data) and POST (form submit). We re-export it as
 * the named GET/POST that the Next.js App Router expects.
 */

import { auth } from "./config";

export const GET = auth;
export const POST = auth;
