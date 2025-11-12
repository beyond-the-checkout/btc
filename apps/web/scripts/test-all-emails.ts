import { sendEmail } from "@dub/email";
import "dotenv-flow/config";
import React from "react";

// Import all email templates
import ApiKeyCreated from "@dub/email/templates/api-key-created";
import BountyApproved from "@dub/email/templates/bounty-approved";
import BountyCompleted from "@dub/email/templates/bounty-completed";
import BountyNewSubmission from "@dub/email/templates/bounty-new-submission";
import BountyRejected from "@dub/email/templates/bounty-rejected";
import BountySubmitted from "@dub/email/templates/bounty-submitted";
import ClicksExceeded from "@dub/email/templates/clicks-exceeded";
import ClicksSummary from "@dub/email/templates/clicks-summary";
import ConfirmEmailChange from "@dub/email/templates/confirm-email-change";
import ConnectPayoutReminder from "@dub/email/templates/connect-payout-reminder";
import DiscountDeleted from "@dub/email/templates/discount-deleted";
import DomainClaimed from "@dub/email/templates/domain-claimed";
import DomainDeleted from "@dub/email/templates/domain-deleted";
import DomainExpired from "@dub/email/templates/domain-expired";
import DomainRenewalFailed from "@dub/email/templates/domain-renewal-failed";
import DomainRenewalReminder from "@dub/email/templates/domain-renewal-reminder";
import DomainRenewed from "@dub/email/templates/domain-renewed";
import DomainTransferred from "@dub/email/templates/domain-transferred";
import DubWrapped from "@dub/email/templates/dub-wrapped";
import EmailUpdated from "@dub/email/templates/email-updated";
import FailedPayment from "@dub/email/templates/failed-payment";
import FeedbackEmail from "@dub/email/templates/feedback-email";
import FolderEditAccessRequested from "@dub/email/templates/folder-edit-access-requested";
import IntegrationInstalled from "@dub/email/templates/integration-installed";
import InvalidDomain from "@dub/email/templates/invalid-domain";
import LinksImportErrors from "@dub/email/templates/links-import-errors";
import LinksImported from "@dub/email/templates/links-imported";
import LinksLimit from "@dub/email/templates/links-limit";
import LoginLink from "@dub/email/templates/login-link";
import NewBountyAvailable from "@dub/email/templates/new-bounty-available";
import NewCommissionAlertPartner from "@dub/email/templates/new-commission-alert-partner";
import NewMessageFromPartner from "@dub/email/templates/new-message-from-partner";
import NewMessageFromProgram from "@dub/email/templates/new-message-from-program";
import NewSaleAlertProgramOwner from "@dub/email/templates/new-sale-alert-program-owner";
import PartnerAccountMerged from "@dub/email/templates/partner-account-merged";
import PartnerApplicationApproved from "@dub/email/templates/partner-application-approved";
import PartnerApplicationReceived from "@dub/email/templates/partner-application-received";
import PartnerBanned from "@dub/email/templates/partner-banned";
import PartnerPayoutConfirmed from "@dub/email/templates/partner-payout-confirmed";
import PartnerPayoutFailed from "@dub/email/templates/partner-payout-failed";
import PartnerPayoutProcessed from "@dub/email/templates/partner-payout-processed";
import PartnerPayoutWithdrawalCompleted from "@dub/email/templates/partner-payout-withdrawal-completed";
import PartnerPayoutWithdrawalInitiated from "@dub/email/templates/partner-payout-withdrawal-initiated";
import PartnerPaypalPayoutFailed from "@dub/email/templates/partner-paypal-payout-failed";
import PartnerProgramSummary from "@dub/email/templates/partner-program-summary";
import PasswordUpdated from "@dub/email/templates/password-updated";
import ProgramApplicationReminder from "@dub/email/templates/program-application-reminder";
import ProgramImported from "@dub/email/templates/program-imported";
import ProgramInvite from "@dub/email/templates/program-invite";
import ProgramPayoutReminder from "@dub/email/templates/program-payout-reminder";
import ProgramWelcome from "@dub/email/templates/program-welcome";
import ReferralInvite from "@dub/email/templates/referral-invite";
import NewReferralSignup from "@dub/email/templates/new-referral-signup";
import ResetPasswordLink from "@dub/email/templates/reset-password-link";
import UpgradeEmail from "@dub/email/templates/upgrade-email";
import VerifyEmailForAccountMerge from "@dub/email/templates/verify-email-for-account-merge";
import VerifyEmail from "@dub/email/templates/verify-email";
import WebhookAdded from "@dub/email/templates/webhook-added";
import WebhookDisabled from "@dub/email/templates/webhook-disabled";
import WebhookFailed from "@dub/email/templates/webhook-failed";
import WelcomeEmailPartner from "@dub/email/templates/welcome-email-partner";
import WorkspaceInvite from "@dub/email/templates/workspace-invite";
import WelcomeEmail from "@dub/email/templates/welcome-email";

const TEST_EMAIL = process.argv[2] || "test@example.com";
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "chko.sh";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Checkout";

// Mock data for common props
const mockWorkspace = {
  id: "ws_123456",
  name: "Acme Corp",
  slug: "acme",
  logo: "https://assets.chko.sh/logo.png",
};

const mockProgram = {
  id: "prog_123456",
  name: "Acme Partner Program",
  slug: "acme",
  logo: "https://assets.chko.sh/logo.png",
};

const mockPartner = {
  id: "partner_123456",
  name: "Jane Partner",
  email: TEST_EMAIL,
  payoutsEnabled: false,
};

const mockUser = {
  name: "John Doe",
  email: TEST_EMAIL,
};

const mockBounty = {
  name: "Promote Acme at your campus and earn $500",
  description: "Share our product with 100+ students",
  reward: "$500",
  type: "submission" as const,
};

const mockDomain = {
  slug: "go.acme.com",
  registrar: "dynadot",
};

// ============================================================================
// ENABLED TEMPLATES - Already updated with Checkout branding
// ============================================================================

type EmailTemplateEntry = {
  name: string;
  template: React.ComponentType<any>;
  props: any;
};
const enabledTemplates: EmailTemplateEntry[] = [
  {
    name: "Welcome Email",
    template: WelcomeEmail,
    props: {
      name: mockUser.name,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Login Link",
    template: LoginLink,
    props: {
      url: `https://app.${APP_DOMAIN}/login?token=abc123`,
    },
  },
  {
    name: "Workspace Invite",
    template: WorkspaceInvite,
    props: {
      email: TEST_EMAIL,
      appName: APP_NAME,
      url: `https://app.${APP_DOMAIN}/accept-invite?token=abc123`,
      workspaceName: mockWorkspace.name,
      workspaceUser: "Sarah Smith",
      workspaceUserEmail: "sarah@acme.com",
    },
  },
  {
    name: "Verify Email",
    template: VerifyEmail,
    props: {
      code: "123456",
    },
  },
  {
    name: "Reset Password Link",
    template: ResetPasswordLink,
    props: {
      url: `https://app.${APP_DOMAIN}/reset-password?token=abc123`,
    },
  },
  {
    name: "Referral Invite",
    template: ReferralInvite,
    props: {
      email: TEST_EMAIL,
      url: `https://app.${APP_DOMAIN}/register?ref=sarah123`,
      workspaceUser: "Sarah Smith",
      workspaceUserEmail: "sarah@acme.com",
    },
  },
  {
    name: "New Referral Signup",
    template: NewReferralSignup,
    props: {
      email: TEST_EMAIL,
      workspace: mockWorkspace,
    },
  },
  {
    name: "Upgrade Email",
    template: UpgradeEmail,
    props: {
      name: mockUser.name,
      email: TEST_EMAIL,
      plan: "Pro",
    },
  },
  {
    name: "Confirm Email Change",
    template: ConfirmEmailChange,
    props: {
      code: "123456",
      newEmail: "newemail@example.com",
    },
  },
  {
    name: "Email Updated",
    template: EmailUpdated,
    props: {
      email: TEST_EMAIL,
    },
  },
  {
    name: "Password Updated",
    template: PasswordUpdated,
    props: {
      email: TEST_EMAIL,
    },
  },
];

// ============================================================================
// DISABLED TEMPLATES - Not yet updated OR workflows we're not using
// ============================================================================
const disabledTemplates: EmailTemplateEntry[] = [
  // Partner Program emails (DISABLED - partners program not enabled)
  {
    name: "Partner Application Approved",
    template: PartnerApplicationApproved,
    props: {
      program: mockProgram,
      partner: mockPartner,
      rewardDescription: "Earn 30% for each sale for 12 months.",
    },
  },
  {
    name: "Partner Application Received",
    template: PartnerApplicationReceived,
    props: {
      programName: mockProgram.name,
      programLogo: mockProgram.logo,
      partnerName: mockPartner.name,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Welcome Email Partner",
    template: WelcomeEmailPartner,
    props: {
      name: mockPartner.name,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Program Welcome",
    template: ProgramWelcome,
    props: {
      program: mockProgram,
      partner: mockPartner,
      rewardDescription: "Earn 30% for each sale for 12 months.",
    },
  },
  {
    name: "Program Invite",
    template: ProgramInvite,
    props: {
      program: mockProgram,
      rewardDescription: "Earn 30% for each sale for 12 months.",
      inviteUrl: `https://partners.${APP_DOMAIN}/programs/${mockProgram.slug}/apply?invite=abc123`,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Bounty Completed",
    template: BountyCompleted,
    props: {
      bounty: mockBounty,
      program: mockProgram,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Bounty Approved",
    template: BountyApproved,
    props: {
      bounty: mockBounty,
      program: mockProgram,
      commission: "$500.00",
      email: TEST_EMAIL,
    },
  },
  {
    name: "Bounty Rejected",
    template: BountyRejected,
    props: {
      bounty: mockBounty,
      program: mockProgram,
      reason: "The submission did not meet the minimum requirement of 100 students.",
      email: TEST_EMAIL,
    },
  },
  {
    name: "Bounty Submitted",
    template: BountySubmitted,
    props: {
      bounty: mockBounty,
      program: mockProgram,
      email: TEST_EMAIL,
    },
  },
  {
    name: "New Bounty Available",
    template: NewBountyAvailable,
    props: {
      bounty: mockBounty,
      program: mockProgram,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Bounty New Submission",
    template: BountyNewSubmission,
    props: {
      bounty: mockBounty,
      program: mockProgram,
      partner: mockPartner,
      submissionUrl: `https://app.${APP_DOMAIN}/${mockWorkspace.slug}/program/bounties/bounty_123`,
      email: TEST_EMAIL,
    },
  },
  {
    name: "New Commission Alert Partner",
    template: NewCommissionAlertPartner,
    props: {
      program: mockProgram,
      sale: {
        amount: 9900,
        invoiceId: "inv_123456",
        createdAt: new Date(),
      },
      commission: {
        amount: 2970,
        earnings: 2970,
      },
      email: TEST_EMAIL,
    },
  },
  {
    name: "New Sale Alert Program Owner",
    template: NewSaleAlertProgramOwner,
    props: {
      program: mockProgram,
      partner: mockPartner,
      sale: {
        amount: 9900,
        invoiceId: "inv_123456",
        createdAt: new Date(),
      },
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner Payout Confirmed",
    template: PartnerPayoutConfirmed,
    props: {
      program: mockProgram,
      amount: 50000,
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner Payout Processed",
    template: PartnerPayoutProcessed,
    props: {
      program: mockProgram,
      amount: 50000,
      fee: 2500,
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner Payout Failed",
    template: PartnerPayoutFailed,
    props: {
      program: mockProgram,
      amount: 50000,
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      reason: "Invalid bank account details. Please update your payout information.",
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner Payout Withdrawal Initiated",
    template: PartnerPayoutWithdrawalInitiated,
    props: {
      program: mockProgram,
      amount: 50000,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner Payout Withdrawal Completed",
    template: PartnerPayoutWithdrawalCompleted,
    props: {
      program: mockProgram,
      amount: 50000,
      fee: 2500,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner PayPal Payout Failed",
    template: PartnerPaypalPayoutFailed,
    props: {
      program: mockProgram,
      amount: 50000,
      reason: "Invalid PayPal account. Please verify your PayPal email address.",
      email: TEST_EMAIL,
    },
  },
  {
    name: "Connect Payout Reminder",
    template: ConnectPayoutReminder,
    props: {
      program: mockProgram,
      earnings: 50000,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Program Payout Reminder",
    template: ProgramPayoutReminder,
    props: {
      program: mockProgram,
      totalPending: 100000,
      partnerCount: 5,
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner Program Summary",
    template: PartnerProgramSummary,
    props: {
      program: mockProgram,
      period: "Last 30 days",
      stats: {
        clicks: 1234,
        leads: 56,
        sales: 12,
        earnings: 35000,
      },
      email: TEST_EMAIL,
    },
  },
  {
    name: "New Message From Partner",
    template: NewMessageFromPartner,
    props: {
      program: mockProgram,
      partner: mockPartner,
      message: "Hello! I have a question about the commission structure...",
      messageUrl: `https://app.${APP_DOMAIN}/${mockWorkspace.slug}/program/messages/${mockPartner.id}`,
      email: TEST_EMAIL,
    },
  },
  {
    name: "New Message From Program",
    template: NewMessageFromProgram,
    props: {
      program: mockProgram,
      message: "Thank you for reaching out! We're happy to help...",
      messageUrl: `https://partners.${APP_DOMAIN}/messages/${mockProgram.slug}`,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner Account Merged",
    template: PartnerAccountMerged,
    props: {
      program: mockProgram,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Verify Email For Account Merge",
    template: VerifyEmailForAccountMerge,
    props: {
      program: mockProgram,
      code: "123456",
      email: TEST_EMAIL,
    },
  },
  {
    name: "Partner Banned",
    template: PartnerBanned,
    props: {
      program: mockProgram,
      reason: "Violation of terms of service",
      email: TEST_EMAIL,
    },
  },
  {
    name: "Program Application Reminder",
    template: ProgramApplicationReminder,
    props: {
      partner: mockPartner,
      applications: [
        { programName: "Acme Program", programSlug: "acme" },
        { programName: "Beta Program", programSlug: "beta" },
      ],
      email: TEST_EMAIL,
    },
  },
  {
    name: "Discount Deleted",
    template: DiscountDeleted,
    props: {
      program: mockProgram,
      partner: mockPartner,
      discount: {
        code: "PARTNER30",
        amount: 30,
      },
      email: TEST_EMAIL,
    },
  },
  {
    name: "Program Imported",
    template: ProgramImported,
    props: {
      workspace: mockWorkspace,
      program: mockProgram,
      stats: {
        partners: 25,
        sales: 150,
        revenue: 450000,
      },
      email: TEST_EMAIL,
    },
  },

  // Domain management emails (not yet updated)
  {
    name: "Domain Claimed",
    template: DomainClaimed,
    props: {
      domain: mockDomain.slug,
      workspaceSlug: mockWorkspace.slug,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Domain Deleted",
    template: DomainDeleted,
    props: {
      domain: mockDomain.slug,
      workspaceSlug: mockWorkspace.slug,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Domain Expired",
    template: DomainExpired,
    props: {
      domain: mockDomain.slug,
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Domain Renewal Failed",
    template: DomainRenewalFailed,
    props: {
      domain: mockDomain.slug,
      workspace: mockWorkspace,
      reason: "Payment method declined",
      email: TEST_EMAIL,
    },
  },
  {
    name: "Domain Renewal Reminder",
    template: DomainRenewalReminder,
    props: {
      domain: mockDomain.slug,
      workspace: mockWorkspace,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      email: TEST_EMAIL,
    },
  },
  {
    name: "Domain Renewed",
    template: DomainRenewed,
    props: {
      domain: mockDomain.slug,
      workspace: mockWorkspace,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      email: TEST_EMAIL,
    },
  },
  {
    name: "Domain Transferred",
    template: DomainTransferred,
    props: {
      domain: mockDomain.slug,
      newWorkspace: { ...mockWorkspace, name: "Beta Corp" },
      email: TEST_EMAIL,
    },
  },
  {
    name: "Invalid Domain",
    template: InvalidDomain,
    props: {
      domain: mockDomain.slug,
      workspaceSlug: mockWorkspace.slug,
      invalidDays: 14,
      email: TEST_EMAIL,
    },
  },

  // Links/QR management emails (not yet updated)
  {
    name: "Links Imported",
    template: LinksImported,
    props: {
      count: 150,
      domains: ["go.acme.com", "link.acme.com"],
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Links Import Errors",
    template: LinksImportErrors,
    props: {
      count: 5,
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Links Limit",
    template: LinksLimit,
    props: {
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Clicks Exceeded",
    template: ClicksExceeded,
    props: {
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Clicks Summary",
    template: ClicksSummary,
    props: {
      totalClicks: 12345,
      createdLinks: 23,
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },

  // Billing/workspace emails (not yet updated)
  {
    name: "Failed Payment",
    template: FailedPayment,
    props: {
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },

  // API/Webhook emails (not yet updated)
  {
    name: "API Key Created",
    template: ApiKeyCreated,
    props: {
      apiKey: "dub_1234567890abcdef",
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Webhook Added",
    template: WebhookAdded,
    props: {
      webhook: {
        name: "Production Webhook",
        url: "https://api.acme.com/webhooks/dub",
        triggers: ["link.created", "link.clicked"],
      },
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Webhook Disabled",
    template: WebhookDisabled,
    props: {
      webhook: {
        name: "Production Webhook",
        url: "https://api.acme.com/webhooks/dub",
      },
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },
  {
    name: "Webhook Failed",
    template: WebhookFailed,
    props: {
      webhook: {
        name: "Production Webhook",
        url: "https://api.acme.com/webhooks/dub",
      },
      attempts: 5,
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },

  // Miscellaneous emails (not yet updated)
  {
    name: "Feedback Email",
    template: FeedbackEmail,
    props: {
      email: TEST_EMAIL,
      feedback: "Great product! Would love to see more analytics features.",
    },
  },
  {
    name: "Folder Edit Access Requested",
    template: FolderEditAccessRequested,
    props: {
      folder: "Marketing Campaigns",
      requester: "Jane Smith",
      workspace: mockWorkspace,
      approveUrl: `https://app.${APP_DOMAIN}/${mockWorkspace.slug}/folders/access-requests`,
      email: TEST_EMAIL,
    },
  },

  // Integration emails (DISABLED - integrations not enabled)
  {
    name: "Integration Installed",
    template: IntegrationInstalled,
    props: {
      integration: {
        name: "Slack",
        logo: "https://assets.chko.sh/integrations/slack.png",
      },
      workspace: mockWorkspace,
      email: TEST_EMAIL,
    },
  },

  // Marketing emails (not yet updated)
  // DISABLED: Dub-branded year-in-review email - not compatible with Checkout
  // {
  //   name: "Dub Wrapped",
  //   template: DubWrapped,
  //   props: {
  //     year: new Date().getFullYear(),
  //     stats: {
  //       totalLinks: 342,
  //       totalClicks: 54321,
  //       topLink: "go.acme.com/promo",
  //       topCountry: "United States",
  //     },
  //     email: TEST_EMAIL,
  //   },
  // },
];

async function sendAllEmails() {
  const emailTemplates = enabledTemplates; // Only send enabled templates

  console.log(`\n📧 Sending ${emailTemplates.length} ENABLED email templates to ${TEST_EMAIL}`);
  console.log(`   (${disabledTemplates.length} templates disabled)\n`);
  console.log(`🌐 View emails at: http://localhost:8025\n`);

  let successCount = 0;
  let failCount = 0;

  for (const { name, template, props } of emailTemplates) {
    try {
      await sendEmail({
        to: TEST_EMAIL,
        subject: `[TEST] ${name}`,
        react: React.createElement(template, props as any),
      });
      console.log(`✅ ${name}`);
      successCount++;

      // Small delay to avoid overwhelming Mailhog
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ ${name}:`, error);
      failCount++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   Success: ${successCount}/${emailTemplates.length}`);
  console.log(`   Failed: ${failCount}/${emailTemplates.length}`);
  console.log(`\n✅ Enabled templates: ${enabledTemplates.length}`);
  console.log(`⏸️  Disabled templates: ${disabledTemplates.length}`);
  console.log(`\n🌐 Open Mailhog: http://localhost:8025`);
}

sendAllEmails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
