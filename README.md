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

```
feature/idissue_nomebranch
bugfix/idissue_nomebranch
```

Example: `feature/123_login-social`

The issue ID comes from the **GitHub Issue Board**.

## Release flow

- Merge `development` into `main` weekly through a Pull Request for production.

## Documentation

- [Branch management](docs/branch-management.md)
- [Conventional Commits](docs/conventional-commits.md)
