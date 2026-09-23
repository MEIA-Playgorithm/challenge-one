---
name: create-commits
description: 'Create focused Git commits using this project''s Conventional Commits rules. Use when preparing, reviewing, or creating commits, writing commit messages, staging changes, or linking commits to GitHub issues.'
argument-hint: 'Describe the changes to commit or ask me to inspect the current worktree.'
---

# Create Commits

Create small, focused commits that follow the project's branch policy and the Conventional Commits 1.0.0 format.

## When to Use

Use this skill when you need to:

- Inspect pending changes before committing.
- Create a Conventional Commit message in English.
- Stage and commit a focused set of changes.
- Link a commit to a GitHub issue.
- Review whether an existing commit message follows the project rules.

## Project Rules

- Use commit messages in English.
- Use the imperative form in the description.
- Keep the subject short and focused.
- Use this format:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

- Use the issue ID in the branch name when creating a branch, following the repository policy:
  - `feature/<issue-id>_<name>`
  - `bugfix/<issue-id>_<name>`
- Do not commit directly to `main` or `development`; use a Pull Request.
- Keep each commit limited to one logical change.
- Do not include unrelated files, credentials, generated files, or temporary files.

## Conventional Commit Types

Use the type that best describes the primary purpose of the change:

- `feat`: add a new feature
- `fix`: fix a bug
- `docs`: update documentation
- `refactor`: change code without fixing a bug or adding a feature
- `test`: add or update tests
- `chore`: perform maintenance work
- `perf`: improve performance
- `build`: change the build system or dependencies
- `ci`: change CI/CD configuration
- `style`: change formatting without affecting behaviour

Use a scope when it adds useful context, for example `docs(branches)` or `fix(auth)`.

## Procedure

1. Inspect the current branch and worktree:

   ```bash
   git branch --show-current
   git status --short
   git diff
   git diff --cached
   ```

2. Identify the logical change represented by the diff.

3. Check for unrelated, sensitive, temporary, or generated files. Do not stage them.

4. If the changes contain multiple unrelated logical changes, separate them into multiple commits. Ask for clarification only when the correct grouping cannot be inferred safely.

5. Select the commit type and optional scope. Prefer `docs` for documentation-only changes, `feat` for new functionality, and `fix` for bug corrections.

6. Write an English imperative subject, following this pattern:

   ```text
   type(scope): short imperative description
   ```

   Examples:

   ```text
   docs(branches): update pull request workflow
   feat(auth): add Google login
   fix(api): handle expired access tokens
   ```

7. Add a body only when the reason, impact, or implementation is not clear from the subject. Separate it from the subject with one blank line.

8. Add issue references when applicable:

   ```text
   Closes #42
   ```

   Use `Closes` when the commit completes the issue. Use `Refs` when it only relates to the issue.

9. Mark backwards-incompatible changes with `!` after the type or scope and explain them with a `BREAKING CHANGE` footer when needed:

   ```text
   feat(api)!: change authentication response format
   ```

10. Show or state the proposed commit message and the files that will be included before staging when the user has not explicitly requested an immediate commit.

11. Stage only the intended files and validate the staged diff:

    ```bash
    git add <file>...
    git diff --cached --check
    git diff --cached --stat
    git diff --cached
    ```

12. Create the commit using the approved message:

    ```bash
    git commit -m "type(scope): short imperative description"
    ```

13. Verify the result:

    ```bash
    git log -1 --oneline
    git status --short
    ```

## Quality Checklist

Before finishing, confirm that:

- The commit contains one logical change.
- The message uses a valid Conventional Commit type.
- The description is in English and uses the imperative form.
- The scope is useful and consistent with the affected area.
- The subject does not end with a full stop.
- The staged diff contains no unrelated or sensitive files.
- `git diff --cached --check` reports no whitespace errors.
- Tests or relevant validation have been run when the change affects code.
- The final commit hash and clean or remaining worktree state are reported.

## Handling Existing Commits

If the user asks to correct a commit message before it is merged or released, prefer interactive rebase or amend as appropriate. Do not rewrite shared history without explicit confirmation. If the commit is already part of shared history, create a new corrective commit instead of rewriting it.
