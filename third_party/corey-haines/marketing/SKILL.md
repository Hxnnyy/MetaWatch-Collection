---
name: marketing
description: Marketing strategy and execution playbooks: positioning, cold email, AI SEO, copywriting, programmatic SEO, pricing.
disable-model-invocation: true
---

# Marketing

This skill is the top-level entry point for marketing work. It routes to focused workflow playbooks under `workflows/`.

Load only the workflow and reference files relevant to the user's request. Do not read every workflow by default.

## Workflow Index

- Product marketing context: read `workflows/product-marketing-context/workflow.md` first when the user needs positioning, messaging, ICP, category, value proposition, competitive context, or a reusable marketing context document.
- Cold email: read `workflows/cold-email/workflow.md` first when writing B2B cold outreach, prospecting emails, sales development emails, SDR emails, subject lines, personalization, CTAs, or follow-up sequences.
- AI SEO: read `workflows/ai-seo/workflow.md` first when optimizing for AI search, answer engines, LLM citations, AI Overviews, ChatGPT, Perplexity, Claude, Gemini, Copilot, GEO, AEO, LLMO, or zero-click AI visibility.
- Copywriting: read `workflows/copywriting/workflow.md` first when writing or improving marketing copy, landing pages, homepages, product pages, ads, website sections, headlines, CTAs, or conversion copy.
- Programmatic SEO: read `workflows/programmatic-seo/workflow.md` first when building template-driven SEO pages, long-tail landing pages, content matrices, comparison pages, local/service pages, or scalable organic acquisition systems.
- Pricing strategy: read `workflows/pricing-strategy/workflow.md` first when designing pricing, packaging, tiers, value metrics, plan limits, monetization strategy, pricing research, or SaaS pricing pages.

## Shared Defaults

Before deep workflow work, check whether product marketing context already exists in the target project, usually at `.agents/product-marketing-context.md` or `.claude/product-marketing-context.md`. Use it before asking the user for information already captured there.

When multiple workflows apply, start with product marketing context if positioning or audience clarity is missing, then load the execution workflow.

Preserve the original workflow guidance unless it conflicts with the user's explicit request or newer project context.
