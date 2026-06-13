import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Seeding Latimore OS v2...');

  // Lead stages (database-owned, not hardcoded in UI)
  const stages = [
    { name: 'New', position: 1, color: '#c49a6c' },
    { name: 'Assigned', position: 2, color: '#60a5fa' },
    { name: 'Contacted', position: 3, color: '#a78bfa' },
    { name: 'Qualified', position: 4, color: '#34d399' },
    { name: 'Onboarding Scheduled', position: 5, color: '#f59e0b' },
    { name: 'Active', position: 6, color: '#10b981' },
    { name: 'Nurture', position: 7, color: '#6b7280' },
    { name: 'Disqualified', position: 8, color: '#ef4444' },
  ];

  for (const stage of stages) {
    await db.leadStage.upsert({
      where: { name: stage.name },
      update: {},
      create: stage,
    });
  }
  console.log('✓ Lead stages seeded');

  // Lead scoring rules
  const scoringRules = [
    { field: 'persona', operator: 'eq', value: 'LICENSED_AGENT', points: 20, description: 'Licensed agents score higher — faster to activate' },
    { field: 'persona', operator: 'eq', value: 'CAREER_CHANGER', points: 15, description: 'High intent to transition' },
    { field: 'persona', operator: 'eq', value: 'ENTREPRENEUR', points: 12, description: 'Business-in-a-box fit' },
    { field: 'persona', operator: 'eq', value: 'ASPIRING_AGENT', points: 10, description: 'Needs licensing — longer runway' },
    { field: 'persona', operator: 'eq', value: 'REFERRAL_PARTNER', points: 5, description: 'No license — referral only' },
    { field: 'utmSource', operator: 'eq', value: 'linkedin', points: 10, description: 'LinkedIn leads are professional context' },
    { field: 'utmSource', operator: 'eq', value: 'instagram', points: 7, description: 'IG leads — brand-aware' },
    { field: 'utmMedium', operator: 'eq', value: 'referral', points: 15, description: 'Referred leads close faster' },
  ];

  for (const rule of scoringRules) {
    await db.leadScoringRule.create({ data: rule });
  }
  console.log('✓ Lead scoring rules seeded');

  // Source health placeholders
  const providers = ['google', 'facebook', 'instagram', 'linkedin', 'ga4', 'gemini'];
  for (const provider of providers) {
    await db.sourceHealth.upsert({
      where: { provider },
      update: {},
      create: { provider, status: 'not_configured' },
    });
  }
  console.log('✓ Source health placeholders seeded');

  // Prompt templates
  const prompts = [
    {
      name: 'lead_summary',
      template: `You are an assistant for Latimore OS v2, an insurance recruiting platform. 
Given the following lead data, write a 2-3 sentence summary of the lead's profile and readiness.
Be factual. Do not make promises or income claims. Output is for internal reviewer use only.

Lead data: {{lead_data}}

Respond with a plain text summary only.`,
    },
    {
      name: 'lead_next_action',
      template: `You are an assistant for Latimore OS v2. 
Given this lead's persona, stage, and interaction history, suggest the single best next action.
Be specific. Reference the persona playbook. Do not auto-send or auto-schedule anything.

Lead: {{lead_data}}
Interactions: {{interactions}}

Respond with a single clear next action sentence.`,
    },
    {
      name: 'composer_draft',
      template: `You are a content assistant for Latimore OS v2.
Write a {{output_type}} for the {{persona}} persona at the {{funnel_stage}} stage.
Platform: {{platform}}
Campaign: {{campaign_name}}

Rules:
- Never promise specific income amounts without results-vary context
- Never use "get rich quick", "easy money", "unlimited income", "no experience needed"
- Write at 8th grade reading level
- End with a CTA that uses a tracking link (placeholder: [TRACKING_LINK])
- Output is a DRAFT for human review. It will not be published automatically.

Brief: {{brief}}`,
    },
  ];

  for (const prompt of prompts) {
    await db.promptTemplate.upsert({
      where: { name: prompt.name },
      update: {},
      create: prompt,
    });
  }
  console.log('✓ Prompt templates seeded');

  console.log('\nSeed complete. Ready to run prisma migrate dev.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
