/**
 * Deployment Feature Flags
 *
 * This module defines deployment-wide switches that control whether major product
 * areas ship with the bundle. Unlike workspace plan capabilities (see
 * `@/lib/plan-capabilities`) or beta feature flags served via Vercel Edge Config
 * (`@/lib/edge-config/get-feature-flags`), these booleans are read at build time
 * and apply to every workspace and user for a given deployment.
 *
 * ### Usage overview
 * - **Server components & APIs**: Import { `isFeatureEnabled` } and branch logic
 *   before returning gated UI or performing mutations.
 * - **Client components**: These flags are statically bundled, so the same import
 *   works in client-side code without additional wiring or env vars.
 * - **Navigation & routing**: Reference `FEATURES` to conditionally construct
 *   navigation groups and reject requests in layouts or middleware.
 *
 * ### Adding a new deployment feature flag
 * 1. Add a key to the `FEATURES` map below with a succinct description comment.
 * 2. Update the `DeploymentFeature` documentation so future maintainers know how
 *    to gate UI, routes, and APIs.
 * 3. Touch any navigation files (e.g. `@/ui/layout/sidebar/app-sidebar-nav.tsx`),
 *    layouts, or middleware that should respect the new switch.
 * 4. Consider adding component-level checks where users might see on/off states.
 *
 * @example
 * ```ts
 * import { isFeatureEnabled } from "@/lib/feature-flags";
 *
 * if (!isFeatureEnabled("partnerProgram")) {
 *   return notFound();
 * }
 * ```
 */
export const FEATURES = {
  /**
   * Controls access to the Partner Program experience (navigation, routes,
   * partner management components). Disable to remove all partner program UI
   * surface area deployment-wide.
   */
  partnerProgram: true,
  /**
   * Governs availability of the core short links product (links list, folders,
   * analytics). Disable when running Dub without the link shortener experience.
   */
  links: true,
  /**
   * Toggles webhook configuration pages and related CTAs. Useful for staged
   * rollouts or environments where outbound webhooks are unsupported.
   */
  webhooks: true,
  /**
   * Example flag for deployment-wide analytics dashboards. Flip to false to
   * hide dashboards that rely on heavy analytics backends.
   */
  analytics: true,
} as const;

export type DeploymentFeatures = typeof FEATURES;

/**
 * Union of known deployment-level feature keys.
 *
 * @remarks
 * Keep in sync with `FEATURES`. The `keyof` relationship ensures type-safety
 * when authoring UI checks and allows IDE auto-complete for known flags.
 */
export type DeploymentFeature = keyof DeploymentFeatures;

/**
 * Narrow helper that returns whether a deployment feature is enabled.
 *
 * @param feature - One of the keys listed in {@link DeploymentFeature}.
 * @returns `true` when the feature is switched on for this deployment.
 *
 * @example
 * ```ts
 * if (isFeatureEnabled("webhooks")) {
 *   renderWebhookCTA();
 * }
 * ```
 *
 * @see FEATURES for the source of truth.
 */
export function isFeatureEnabled(feature: DeploymentFeature): boolean {
  return FEATURES[feature] === true;
}

/**
 * Returns the full deployment feature map. Useful when tooling or logging needs
 * to surface the current flag state (e.g. dumping to telemetry).
 *
 * @returns A read-only view of the {@link FEATURES} object.
 *
 * @example
 * ```ts
 * const flags = getDeploymentFeatures();
 * console.table(flags);
 * ```
 */
export function getDeploymentFeatures(): DeploymentFeatures {
  return FEATURES;
}
