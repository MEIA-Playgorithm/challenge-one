# Conventional Commits

This project uses the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification to keep commit history clear and consistent.

## Commit format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Keep the first line short and write the description in the imperative form.

## Commit types

- `feat`: add a new feature
- `fix`: fix a bug
- `docs`: update documentation
- `refactor`: change the code without fixing a bug or adding a feature
- `test`: add or update tests
- `chore`: perform maintenance tasks
- `perf`: improve performance
- `build`: change the build system or dependencies
- `ci`: change CI/CD configuration
- `style`: change formatting without affecting behaviour

## Examples

```text
feat(auth): add Google login
fix(api): handle expired access tokens
docs(branches): update pull request workflow
refactor(users): simplify validation logic
test(auth): add tests for login flow
chore(deps): update dependencies
```

## Breaking changes

Use `!` after the type or scope when a change is not backwards-compatible:

```text
feat(api)!: change authentication response format
```

Alternatively, use a `BREAKING CHANGE` footer:

```text
feat(api): change authentication response format

BREAKING CHANGE: clients must now use the `accessToken` field.
```

Breaking changes normally require a major version increase under Semantic Versioning. A `feat` normally represents a minor version increase, while a `fix` normally represents a patch version increase.

## Referencing issues

Reference the related GitHub issue in the commit footer when useful:

```text
fix(auth): prevent duplicate sessions

Closes #42
```

```text
feat(profile): add avatar upload

Refs #128
```

## Commit guidelines

- Keep each commit focused on one logical change.
- Prefer several small, understandable commits over one large mixed commit.
- Do not combine unrelated features, fixes, documentation, or formatting changes.
- Use the scope to identify the affected area when it adds useful context.
- Review the commit message before opening a Pull Request.
- If a Pull Request is squashed, use a Conventional Commit message for the final commit.
