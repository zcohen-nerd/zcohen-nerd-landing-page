// Documented, narrowly-scoped axe exclusions for e2e/a11y.spec.ts.
//
// EMPTY by design right now. The acceptance-triage pass (run against the
// consolidated remediated tree — see CONTRIBUTING.md "Deferred") will either fix
// each real axe violation or add an entry here with a CSS selector scoped to the
// smallest possible subtree, a one-line reason, and a tracking link. Nothing
// gets excluded without that justification.
//
// Shape:
//   export const axeExclusions: Record<string, string[]> = {
//     '/some-route/': ['#embedded-third-party-widget'], // reason; tracked in <url>
//   };
export const axeExclusions: Record<string, string[]> = {};
