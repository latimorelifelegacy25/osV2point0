import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum([
    'PERSONA_SPOTLIGHT','URGENCY','REENGAGEMENT',
    'REFERRAL_PUSH','SEASONAL',
    'RETAIL_EDUCATION','RETAIL_PAHS','RETAIL_COMMUNITY',
  ]),
  persona: z.enum([
    'LICENSED_AGENT','ASPIRING_AGENT','CAREER_CHANGER',
    'REFERRAL_PARTNER','ENTREPRENEUR',
  ]).optional(),
  durationDays: z.number().int().min(1).max(90),
  targetEvent: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createTrackingLinkSchema = z.object({
  campaignId: z.string().cuid(),
  utmTemplateId: z.string().cuid().optional(),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  destination: z.string().url(),
  utmSource: z.string().min(1),
  utmMedium: z.string().min(1),
  utmCampaign: z.string().min(1),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
});

export const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  state: z.string().length(2).optional(),
  persona: z.enum([
    'LICENSED_AGENT','ASPIRING_AGENT','CAREER_CHANGER',
    'REFERRAL_PARTNER','ENTREPRENEUR',
  ]).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  campaignId: z.string().cuid().optional(),
  heardFrom: z.string().optional(),
  notes: z.string().optional(),
});

export const createComposerDraftSchema = z.object({
  title: z.string().min(1).max(200),
  outputType: z.enum([
    'SOCIAL_POST','EMAIL','SMS','ARTICLE',
    'REPORT','SCRIPT','FOLLOW_UP','GRANT_DOCUMENT',
  ]),
  persona: z.enum([
    'LICENSED_AGENT','ASPIRING_AGENT','CAREER_CHANGER',
    'REFERRAL_PARTNER','ENTREPRENEUR',
  ]).optional(),
  platform: z.enum([
    'INSTAGRAM','TIKTOK','FACEBOOK','LINKEDIN','YOUTUBE','EMAIL','SMS',
  ]).optional(),
  funnelStage: z.enum([
    'AWARENESS','INTEREST','CONSIDERATION','JOIN','ACTIVATE','REFER',
  ]).optional(),
  campaignId: z.string().cuid().optional(),
  body: z.string().min(1),
  citationRequired: z.boolean().default(true),
  utmRequired: z.boolean().default(true),
});
