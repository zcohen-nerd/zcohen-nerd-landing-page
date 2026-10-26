import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';

const script = fileURLToPath(new URL('./audit-ci.mjs', import.meta.url));
const allowlistPath = '.github/audit-allowlist.json';
const id = 'GHSA-5gmw-xhrv-c9v3';
const otherId = 'GHSA-85c8-ppgw-ccpr';
const clean = {
  vulnerabilities: {},
  metadata: {
    vulnerabilities: {total: 0, critical: 0, high: 0, moderate: 0, low: 0},
  },
};
const finding = {
  severity: 'high',
  via: [{url: `https://github.com/advisories/${id}`}],
  nodes: ['node_modules/example'],
};
const report = (info = finding) => ({
  vulnerabilities: {example: info},
  metadata: {
    vulnerabilities: {...clean.metadata.vulnerabilities, high: 1, total: 1},
  },
});
const exception = {
  package: 'example',
  severity: 'high',
  advisories: [id],
  versions: ['1.0.0'],
  review_by: '2099-11-30',
  reason: 'Fixture exception for an independently reviewed dependency path.',
  path: 'fixture > example@1.0.0',
  upstream: `https://github.com/advisories/${id}`,
};

function run(input, options = {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'audit-gate-'));
  try {
    mkdirSync(join(cwd, dirname(allowlistPath)), {recursive: true});
    writeFileSync(
      join(cwd, allowlistPath),
      JSON.stringify(
        options.allowlist ?? {advisories: options.exceptions ?? []},
      ),
    );
    writeFileSync(
      join(cwd, 'package-lock.json'),
      JSON.stringify(
        options.lock ?? {
          packages: {'node_modules/example': {version: '1.0.0'}},
        },
      ),
    );
    // Any accidental attempt to use the real registry in a test fails. These
    // tests run the actual CLI in isolation, including its npm subprocess path.
    mkdirSync(join(cwd, 'bin'));
    writeFileSync(join(cwd, 'bin/npm'), options.npm ?? '#!/bin/sh\nexit 97\n', {
      mode: 0o755,
    });
    return spawnSync(process.execPath, [script], {
      cwd,
      input: typeof input === 'string' ? input : JSON.stringify(input),
      env: {...process.env, PATH: `${join(cwd, 'bin')}:${process.env.PATH}`},
      encoding: 'utf8',
      timeout: 5000,
    });
  } finally {
    rmSync(cwd, {recursive: true, force: true});
  }
}

const cases = [
  ['clean report passes', clean, {}, 0],
  ['unapproved high finding fails', report(), {}, 1],
  [
    'exact advisory and installed version pass',
    report(),
    {exceptions: [exception]},
    0,
  ],
  [
    'new advisory on an excepted package fails',
    report({
      ...finding,
      via: [{url: `https://github.com/advisories/${otherId}`}],
    }),
    {exceptions: [exception]},
    1,
  ],
  [
    'additional advisory on an excepted package fails',
    report({
      ...finding,
      via: [...finding.via, {url: `https://github.com/advisories/${otherId}`}],
    }),
    {exceptions: [exception]},
    1,
  ],
  [
    'changed installed version fails',
    report(),
    {
      exceptions: [exception],
      lock: {packages: {'node_modules/example': {version: '1.0.1'}}},
    },
    1,
  ],
  [
    'unreviewed nested copy fails',
    report({
      ...finding,
      nodes: [...finding.nodes, 'node_modules/parent/node_modules/example'],
    }),
    {exceptions: [exception]},
    1,
  ],
  [
    'expired exception fails',
    report(),
    {exceptions: [{...exception, review_by: '2000-01-01'}]},
    1,
  ],
  [
    'expired stale exception fails even with clean report',
    clean,
    {exceptions: [{...exception, review_by: '2000-01-01'}]},
    1,
  ],
  [
    'exception without expiry fails',
    report(),
    {exceptions: [{...exception, review_by: undefined}]},
    1,
  ],
  [
    'invalid calendar date fails',
    report(),
    {exceptions: [{...exception, review_by: '2099-02-30'}]},
    1,
  ],
  [
    'wildcard exception fails',
    report(),
    {exceptions: [{...exception, advisories: ['*']}]},
    1,
  ],
  [
    'duplicate exception fails',
    report(),
    {exceptions: [exception, exception]},
    1,
  ],
  ['invalid allowlist fails', clean, {allowlist: {}}, 1],
  ['registry error JSON fails', {error: {code: 'E503'}}, {}, 1],
  ['missing fields fail', {}, {}, 1],
  ['malformed JSON fails', 'not JSON', {}, 1],
  [
    'array instead of vulnerabilities fails',
    {...clean, vulnerabilities: []},
    {},
    1,
  ],
  [
    'inconsistent clean count fails',
    {...report(), metadata: clean.metadata},
    {},
    1,
  ],
  [
    'inconsistent severity counts fail',
    {
      ...report(),
      metadata: {
        vulnerabilities: {...clean.metadata.vulnerabilities, total: 1},
      },
    },
    {},
    1,
  ],
  ['malformed advisory entry fails', report({...finding, via: []}), {}, 1],
  [
    'unknown cascade source fails',
    report({...finding, via: ['missing']}),
    {},
    1,
  ],
  [
    'rootless cascade cycle fails',
    report({...finding, via: ['example']}),
    {},
    1,
  ],
  [
    'missing advisory ID fails',
    report({...finding, via: [{source: 123}]}),
    {exceptions: [exception]},
    1,
  ],
  ['registry subprocess failure fails', '', {}, 1],
  [
    'npm exit 1 with a valid excepted report passes',
    '',
    {
      exceptions: [exception],
      npm: `#!/bin/sh\ncat <<'REPORT'\n${JSON.stringify(report())}\nREPORT\nexit 1\n`,
    },
    0,
  ],
  [
    'npm exit 2 with a clean report fails',
    '',
    {
      npm: `#!/bin/sh\ncat <<'REPORT'\n${JSON.stringify(clean)}\nREPORT\nexit 2\n`,
    },
    1,
  ],
];
for (const [name, input, options, expected] of cases) {
  test(name, () => {
    const result = run(input, options);
    assert.equal(result.status, expected, result.stderr || result.stdout);
  });
}

test('low-severity finding fails without an exception', () => {
  const input = report({...finding, severity: 'low'});
  input.metadata.vulnerabilities.high = 0;
  input.metadata.vulnerabilities.low = 1;
  assert.equal(run(input).status, 1);
});

test('cascade parents pass only with an approved root advisory', () => {
  const input = report();
  input.vulnerabilities.parent = {
    ...finding,
    via: ['example'],
    nodes: ['node_modules/parent'],
  };
  input.metadata.vulnerabilities.high = 2;
  input.metadata.vulnerabilities.total = 2;
  assert.equal(run(input, {exceptions: [exception]}).status, 0);
  assert.equal(run(input).status, 1);
});
