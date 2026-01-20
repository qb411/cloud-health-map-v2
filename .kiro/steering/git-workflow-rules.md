---
inclusion: always
---

# Git Workflow Rules for Cloud Health Map v2

## Mandatory Git Workflow

For this project, ALL changes must be immediately committed and pushed to the remote repository.

### Rules:

1. **Immediate Commit**: After making ANY file changes, immediately stage and commit them
2. **Immediate Push**: After committing, immediately push to `origin master`
3. **Descriptive Commits**: Always include detailed commit messages with:
   - **Previous configuration**: What the values/settings were before
   - **Updated configuration**: What the values/settings are now
   - **Changes**: List of specific changes made

### Commit Message Format:

```
<type>: <short description>

Previous configuration:
- <key>: <old value>
- <key>: <old value>

Updated configuration:
- <key>: <new value>
- <key>: <new value>

Changes:
- <specific change 1>
- <specific change 2>
- <specific change 3>
```

### Commit Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks
- `config`: Configuration changes

### Example:

```
docs: update version to 0.1.1 and fix documentation accuracy

Previous configuration:
- Version: 0.0.0
- Status: production-ready
- Region count: 108+ regions

Updated configuration:
- Version: 0.1.1
- Status: development-ready
- Region count: 176 regions

Changes:
- Updated package.json version
- Changed project status claims
- Fixed region counts to reflect actual implementation
```

### Workflow Steps:

1. Make changes to files
2. `git add <files>`
3. `git commit -m "<detailed message>"`
4. `git push origin master`
5. Confirm push succeeded

### Why This Rule Exists:

- Ensures remote repository is always up-to-date
- Provides clear audit trail of all changes
- Prevents loss of work
- Makes collaboration easier
- Keeps deployed version in sync with local development

## CRITICAL: Never Skip This Process

Every single change, no matter how small, must be committed and pushed immediately.
