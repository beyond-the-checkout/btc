# ⚠️ DEPRECATED: Legacy Multi-Step Onboarding

**Status: DEPRECATED - Do not use for new features**

This folder contains the old multi-step onboarding flow that has been replaced by the streamlined QR-based onboarding.

## Legacy Flow (DEPRECATED)

The old flow walked users through multiple steps:
1. `/onboarding/workspace` - Create workspace
2. `/onboarding/usage` - Select usage type
3. `/onboarding/domain` - Configure domain
4. `/onboarding/plan` - Select plan
5. `/onboarding/invite` - Invite team members

## Current Flow (USE THIS)

All new signups now route through the QR-based single-step onboarding:

**Route:** `/onboarding/qr-landing`
**File:** `apps/web/app/app.chko.sh/(onboarding)/onboarding/qr-landing/route.ts`

### How it works:

1. **With QR draft (landing page flow):**
   - User creates QR on landing page → sets seed cookie
   - Redirects to `/register?next=/onboarding/qr-landing&seedId=...`
   - After auth → bootstrap route creates workspace + link
   - Redirects to dashboard with `onboarded=true&qrLinkId=...`
   - WelcomeModal offers QR download

2. **Without QR draft (direct signup):**
   - User signs up at `/register` (no seed cookie)
   - After auth → bootstrap route creates workspace (no link)
   - Redirects to dashboard with `onboarded=true`
   - WelcomeModal shows generic welcome

### Entry Points

All signup entry points now route through QR onboarding:
- CTA buttons: `APP_DOMAIN/register?next=/onboarding/qr-landing`
- Email signup fallback: `/onboarding/qr-landing`
- OAuth callback: `/onboarding/qr-landing`

## Why Keep Legacy Files?

These files are kept for backwards compatibility:
- Existing users may have bookmarked these URLs
- Browser history may contain these paths
- Middleware still handles edge cases

New users should never reach these pages through normal signup flows.

## Related Files

- New flow: `apps/web/app/app.chko.sh/(onboarding)/onboarding/qr-landing/route.ts`
- Design doc: `onboarding_simplification.md`
- WelcomeModal: `apps/web/ui/modals/welcome-modal.tsx`
