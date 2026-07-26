# Contributing

Contributions should improve a portable public primitive or its evidence.

1. Create a feature branch.
2. Keep assets general-purpose and independently redistributable.
3. Add or update the primitive README and `registry.json`.
4. Add a test for changed public behaviour, or record explicit test debt.
5. Run `npm test`.
6. Review the full diff for credentials, identities, private context, absolute paths, and platform-only assumptions.

Do not submit personal harness configuration, transcripts, customer material, generated secrets, third-party plugin assets, or files whose licence is unclear. Security concerns should follow [security.md](security.md).
