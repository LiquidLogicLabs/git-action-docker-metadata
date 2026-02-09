## Upstream Sync Rules (docker/metadata-action v5.x)

This fork must track upstream features while remaining 100% GitHub-API free (git-only, offline-friendly). Follow these steps for every sync.

### Guardrails
- Do **not** add `@actions/github` or `@docker/actions-toolkit`; keep `simple-git` for context.
- Derive context from git and workflow event payloads only (`GITHUB_EVENT_PATH`, `GITHUB_REF`, `GITHUB_SHA`).
- `base_ref`/PR metadata: use event payload when present; otherwise leave empty.
- Default branch: use git remote HEAD (`origin/HEAD` fallback to `main`/`master`).
- Keep outputs + env exports parity with upstream.
- The `github-token` input may exist for upstream compatibility, but it must remain unused (no GitHub API calls).
- Workflows must match upstream exactly; remove local workflow-only tweaks during sync.
- If grepping `dist/` for GitHub API indicators, check `dist/index.js` (runtime) and ignore `dist/*.map` (sourcemaps may include URLs in dependency comments).

### Workflow
1. Fetch the latest upstream tag to mirror (e.g., `v5.10.0` or newer) and diff `action.yml`, `src/`, `__tests__/`, docs. Source: https://github.com/docker/metadata-action
2. Map changes: replace any GitHub API usage with git/event-payload equivalents or document omissions.
3. Update context handling to support new upstream expressions/inputs without adding API calls.
4. Refresh README sync note to record the upstream tag being mirrored; bump `package.json` only if you are publishing a fork release.
5. Regenerate `dist/` via `yarn install && yarn build` (or repo-standard build) and commit `dist/`.
6. Run `yarn lint`, `yarn test`, and `yarn build`; fix regressions before tagging.
7. Note any intentional deviations (API-only features) in README.

### Quick checklist
- [ ] Upstream tag diffed and reconciled
- [ ] Git-only context preserved (no new API deps)
- [ ] README sync status reflects upstream tag
- [ ] README sync status updated
- [ ] workflows match upstream
- [ ] dist rebuilt
- [ ] Lint/test/build pass
