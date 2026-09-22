#!/usr/bin/env node
// Asserts a proposed release version obeys the fork's mirror rule:
//
//   the fork mirrors upstream MAJOR.MINOR and owns the PATCH
//
// So with .upstream-sync.json recording upstream v6.2.0, `6.2.0` and `6.2.4` are
// valid and `6.3.0` is not — 6.3.x only becomes available once upstream ships 6.3.0
// and the vendored files are re-synced.
//
// This exists as one script rather than inline shell in each workflow because both
// sync-release.yml (the dispatch path) and release.yml (the tag-push path) must apply
// the identical rule. Two hand-kept copies of a version check drift, and a release
// gate that has drifted is worse than none: it still reports success.
//
// Usage: node scripts/check-release-version.mjs <version>
//        where <version> is bare MAJOR.MINOR.PATCH, no leading "v".
import {readFileSync} from 'node:fs';

const fail = (msg) => {
  console.error(`::error::${msg}`);
  process.exit(1);
};

const version = process.argv[2];
if (!version) fail('no version supplied');

if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) {
  fail(`refusing malformed version '${version}' (want MAJOR.MINOR.PATCH, no leading v)`);
}

let sync;
try {
  sync = JSON.parse(readFileSync(new URL('../.upstream-sync.json', import.meta.url), 'utf8'));
} catch (err) {
  fail(`could not read .upstream-sync.json: ${err.message}`);
}

const upstreamTag = sync.tag;
if (typeof upstreamTag !== 'string' || !/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(upstreamTag)) {
  fail(`refusing malformed upstream tag '${upstreamTag}' in .upstream-sync.json`);
}

const want = upstreamTag.replace(/^v/, '').split('.').slice(0, 2).join('.');
const got = version.split('.').slice(0, 2).join('.');

if (want !== got) {
  fail(
    `version ${version} does not mirror upstream ${upstreamTag}: ` +
      `expected ${want}.x (the fork mirrors upstream MAJOR.MINOR and owns the PATCH)`
  );
}

console.log(`v${version} mirrors upstream ${upstreamTag} (${want}.x) — ok`);
