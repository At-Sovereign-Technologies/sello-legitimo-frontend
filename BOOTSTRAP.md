# Bootstrap Notes

## Source

This repository adopts the organization-wide devcontainer migration baseline from the Sello Legitimo workspace.

## Applied Migration Steps

1. Added `.devcontainer/devcontainer.json` with Node 20 + Git feature.
2. Added `.devcontainer/post-create.sh` for lockfile-safe dependency installation.
3. Added `DEV_ENVIRONMENT.md`.
4. Added changelog entry.

## Dependency Decisions

- Node runtime pinned to 20 via devcontainer image.
- Install strategy is lockfile-first (`npm ci` when lock exists).

## Idempotency

- Reopening the container re-runs setup safely.
- No secrets are stored in repository files.
