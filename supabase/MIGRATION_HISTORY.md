# Migration history vs production

Production project: `gvjslfdgulkkabfhmjke` (named `aionestop-uat`, but it is production).
Checked read-only on 2026-10-19 (`supabase_migrations.schema_migrations`, SELECT only).

Repo files use `NNN_name.sql`; production records Supabase timestamps. Replaying
`supabase/migrations/*.sql` **in filename order** rebuilds the production schema.

| Repo file | Production version | Production name | Notes |
|---|---|---|---|
| 001–008 | 20261011182734–20261011182812 | same | |
| 009_update_updated_at_search_path | 20261011204514 | same | Applied after 010 and 011 in prod; order-independent |
| 010–015 | 20261011203956–20261011220026 | same | |
| 016_taxonomy_and_review_notes | 20261012002729 | `taxonomy_and_review_notes` | Name recorded without the `016_` prefix |
| **017_llm_pricing** | 20261013151031 | `017_llm_pricing` | **Restored to main in this PR** from `cursor/llm-pricing-comparison-7863` (`6f7a979`); byte-identical to the SQL recorded in prod |
| 018–028 | as recorded | same | 018 recorded after 019–021 |
| 027_search_phase2_ranking | 20261018234129 | same | Repo file is the corrected version (explicit columns); its content equals prod's `_v2`. Prod's recorded first run used `t.*` |
| **027_search_phase2_ranking_rollback** | 20261018234144 | same | **Added in this PR**, verbatim from prod history |
| **027_search_phase2_ranking_v2** | 20261018235106 | same | **Added in this PR**, verbatim from prod history |
| 029_live_placements_invoker | not applied | | New in this PR, awaiting approval |
| 030_trigger_function_hardening | not applied | | New in this PR, awaiting approval |
| 031_profiles_role_grants | not applied | | New in this PR, awaiting approval |

The three 027 files share a numeric prefix, and they sort as base, `_rollback`, `_v2`, then 028,
which is the production order. `tests/search-migration-history.spec.ts` replays that chain in
PGlite and checks it ends identical to the short 026→027→028 chain.

Because repo versions (`017`) don't match prod versions (`20261013151031`), do not run
`supabase db push` against production. Apply 029–031 one at a time (SQL editor or
`apply_migration`) after approval. Mapping the history with `supabase migration repair`
is optional and also needs Kati's OK, since it writes to production.
