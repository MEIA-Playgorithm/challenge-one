# challenge-one
Inference Engine

# Branch Policy

## Main branches

- **main** - production. Changes are merged through Pull Requests only.
- **development** - testing and playground. Changes are merged through Pull Requests only.

## Working branches

- **feature/** - new features
- **bugfix/** - bug fixes

Always create them from `development` and merge them back into `development`.

### Naming convention

```bash
feature/issueid_branch-name
bugfix/issueid_branch-name
```

Example: `feature/123_social-login`

The issue ID comes from the **GitHub Issue Board**.

## Release flow

- Merge `development` into `main` weekly through a Pull Request for production.

## Documentation

- [Branch management](docs/branch-management.md)
- [Conventional Commits](docs/conventional-commits.md)
