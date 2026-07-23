# Step 2 — Hub Ecosystem Validation

Validates the shared brand's Step 2 changes against the hub using the existing `file:` workflow (no dependency migration, no npm publication).

## Validator additions (`scripts/validate-build.js`)

- Ecosystem disclosure trigger: structural check on the button bound to `zc-project-disclosure` — text must start with "Ecosystem", must not start with "Projects" (no global string ban; "projects" legitimately appears in section copy)
- All 8 registry links must be server-rendered inside the disclosure (raised from ≥3)
- Fusion System Blocks card must carry the "Public Beta" pill (anchored on the card title, since nav links to FSB carry no pill)

## Results

Strict build ✅ · full validator suite ✅ · browser check ✅ (trigger "Ecosystem ▾", both groups, 8 links, FSB pill "PUBLIC BETA", zero console errors).

Merge after the brand Step 2 PR — CI builds against brand main.
