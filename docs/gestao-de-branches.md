# How to manage branches

This guide presents practices for keeping the project history organised and making teamwork easier. These guidelines complement the project's branch policy.

## Before creating a branch

- Make sure the issue is well defined and use its ID in the branch name.
- Update the source branch before starting:

```bash
git switch development
git pull origin development
```

- Create the branch from `development`:

```bash
git switch -c feature/123_nome-da-feature
```

## During development

- Keep each branch focused on a single issue or change.
- Make small, focused commits that describe what you changed.
- Avoid including temporary files, credentials, or changes unrelated to the issue.
- Regularly synchronise the branch with `development` to reduce conflicts:

```bash
git fetch origin
git rebase origin/development
```

- Run the tests locally before opening a Pull Request.

## When finishing the work

- Review the changes before pushing them:

```bash
git status
git diff
```

- Push the branch to the remote repository:

```bash
git push -u origin feature/123_nome-da-feature
```

- Open a Pull Request targeting `development` and link it to the corresponding issue.
- Explain in the Pull Request what was changed, how to validate it, and any limitations.
- Ask at least one colleague to review it and resolve all comments before merging.

## After merging

- Confirm that the branch was merged correctly.
- Delete the remote and local branches when they are no longer needed:

```bash
git push origin --delete feature/123_nome-da-feature
git branch -d feature/123_nome-da-feature
```

- Do not commit directly to `main` or `development`; always use Pull Requests.

## Resolving conflicts

1. Update the branch with the latest version of `development`.
2. Resolve the conflicts manually while preserving the correct behaviour of both changes.
3. Make sure no markers such as `<<<<<<<` or `>>>>>>>` remain.
4. Run the tests, then push the changes and update the Pull Request.

If you are unsure about the result of a conflict, ask for a review before continuing.