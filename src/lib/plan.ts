/**
 * Billing-plan helpers. The user's `plan` string (see prisma schema) gates the
 * "Made with rezume.so" attribution footer on hosted resume pages: it shows on
 * the free plan (the viral loop) and is hidden for paid plans.
 */

/** Plans that hide the attribution footer. Extend as paid tiers are added. */
export const PAID_PLANS = ["pro", "team"] as const;

export type Plan = "free" | (typeof PAID_PLANS)[number];

/** True when the plan is a paid tier. Unknown/empty values are treated as free. */
export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan != null && (PAID_PLANS as readonly string[]).includes(plan);
}

/** Whether to render the "Made with rezume.so" attribution footer. */
export function showsAttribution(plan: string | null | undefined): boolean {
  return !isPaidPlan(plan);
}
