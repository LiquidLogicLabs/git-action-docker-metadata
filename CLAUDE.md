# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A fork of `docker/metadata-action` v5.10.0+ that removes all GitHub API dependencies, replacing them with direct git commands via `simple-git`. This makes the action work with any git host (GitHub, Gitea, GitLab, Bitbucket, self-hosted, etc.). The fork follows upstream releases with patch increments (e.g., upstream v5.10.0 → fork v5.10.1+).

## Commands

```bash
yarn build           # Bundle src/ → dist/index.js via ncc (commit dist/ after src/ changes)
yarn lint            # Run ESLint v9 flat config (max-warnings=0, prettier via plugin)
yarn format          # Auto-fix eslint/prettier issues
yarn test            # Run Vitest unit tests
yarn test:act        # Run full workflow test locally via act
yarn test:act:ci     # Run CI workflow locally via act
```

Run a single test file:
```bash
yarn test -- --reporter=verbose __tests__/meta.test.ts
```

Run tests with coverage:
```bash
yarn test -- --coverage
```

## Architecture

**Entry point**: `dist/index.js` (bundled, committed) — the Actions runner executes this directly.

**Source flow** (`src/`):
1. `main.ts` — reads inputs, gets context, instantiates `Meta`, writes outputs via `@actions/core`
2. `context.ts` — parses action inputs (`getInputs()`) and extracts runtime context in two modes:
   - `"workflow"`: reads GitHub event payload from `GITHUB_EVENT_PATH`
   - `"git"`: calls git commands directly (the key fork addition)
3. `git.ts` — git wrapper using `simple-git`; provides `getGitContext()` and `parseRepoFromRemoteUrl()`
4. `meta.ts` — `Meta` class; core logic for generating version string, tags, labels, and annotations
5. `tag.ts` — tag type parsing and value generation (schedule, semver, pep440, match, edge, ref, raw, sha)
6. `flavor.ts` — prefix/suffix/latest transformations applied to tags
7. `image.ts` — Docker image name parsing and sanitization

**Tests** live in `__tests__/` with fixtures in `__tests__/fixtures/`. Coverage is collected from `src/**` excluding `main.ts`. The test environment sets `GITHUB_REPOSITORY`, `RUNNER_TEMP`, `RUNNER_TOOL_CACHE`, and `TEMP`.

## Critical Constraints

- **No GitHub API calls**: `@actions/github` and `@docker/actions-toolkit` have been removed. Never reintroduce them. After building, scan `dist/index.js` (not `dist/*.map`) for any of these strings — all should return 0 matches:
  ```bash
  grep -c "octokit\|Octokit\|rest\.repos\|rest\.git\|graphql\|@octokit" dist/index.js
  grep -c "actions-toolkit\|actions/github" dist/index.js
  grep -c "api\.github\.com" dist/index.js
  ```
- **dist/ must be committed**: After any `src/` change, run `yarn build` and commit the updated `dist/index.js` along with source changes.
- **Upstream sync discipline**: See `docs/UPSTREAM_SYNC_RULES.md` before merging upstream changes. Preserve git-only/offline behavior and document sync status clearly.

## Release Process

See `docs/RELEASE.md` for full details. Floating tags (`v5`, `v5.10`) must be force-updated on release. The `release:patch/minor/major` script handles bundling, amending, and tagging in one step.

## Cursor Rules

`.cursor/rules/action-best-practices.mdc` contains detailed standards for this action type — action.yml conventions (kebab-case inputs/outputs), ncc packaging, act-based testing, permissions, and security. Consult it when making structural changes.
