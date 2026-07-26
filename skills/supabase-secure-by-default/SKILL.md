---
name: supabase-secure-by-default
description: Apply secure defaults to Supabase schema, migrations, RLS, storage, authentication, and client/server boundaries.
---

# Supabase secure by default

- Default to deny and enable RLS for user-scoped or sensitive tables; write narrow, testable policies.
- Give public clients the minimum privilege. Never expose service-role credentials to client code.
- Prefer database constraints before application-only validation and document cascade choices.
- Prefer private storage with signed reads unless content is intentionally public.
- Test positive and negative authorization cases.
- Record the security posture and significant schema decisions in project documentation.

Use official Supabase documentation and tooling for current product mechanics. This skill is security posture guidance, not an integration recipe.
