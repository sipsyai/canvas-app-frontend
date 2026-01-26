---
name: ship
description: Update documentation based on code changes, write changelog, commit and push. Use after completing a feature or fix.
argument-hint: [commit-message]
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# /ship - Documentation Update & Commit

Commit message: $ARGUMENTS

## Step 1: Analyze Changes

1. Run `git status` to see modified files
2. Run `git diff --staged` for staged changes
3. Run `git diff` for unstaged changes
4. Identify which features/areas were modified:
   - src/features/* → Update docs/features/*.md
   - src/components/ui/* → Update component docs
   - src/lib/api/* → Update docs/api/README.md
   - New files → Add to docs/architecture/project-structure.md

## Step 2: Update Documentation

For each modified area, update the corresponding documentation:

| Changed Path | Documentation to Update |
|--------------|------------------------|
| `src/features/auth/*` | `docs/features/auth.md` |
| `src/features/fields/*` | `docs/features/fields.md` |
| `src/features/objects/*` | `docs/features/objects.md` |
| `src/features/records/*` | `docs/features/records.md` |
| `src/features/relationships/*` | `docs/features/relationships.md` |
| `src/features/applications/*` | `docs/features/applications.md` |
| `src/features/dashboard/*` | `docs/features/dashboard.md` |
| `src/components/ui/*` | Component JSDoc or docs/architecture/ |
| `src/lib/api/*` | `docs/api/README.md` |
| New feature folder | `docs/SUMMARY.md`, `docs/architecture/project-structure.md` |

Documentation updates should:
- Add new functions/components to relevant docs
- Update API endpoints if changed
- Note breaking changes
- Keep Turkish language for user-facing docs

## Step 3: Write Changelog Entry

Add entry to `CHANGELOG.md` at the top (after header):

### Format
```markdown
## [Unreleased]

### Eklenen
- New feature descriptions

### Değiştirilen
- Modified behavior descriptions

### Düzeltilen
- Bug fix descriptions

### Kaldırılan
- Removed feature descriptions
```

### Changelog Rules
- Use Turkish language for changelog entries
- Be concise but descriptive
- Reference file paths for technical changes
- Group by type (Eklenen/Değiştirilen/Düzeltilen/Kaldırılan)
- Include date in release sections

## Step 4: Stage All Changes

```bash
git add -A
```

## Step 5: Create Commit

Use the provided commit message or generate one based on changes:

```bash
git commit -m "$(cat <<'EOF'
$ARGUMENTS

📝 Documentation updated
📋 Changelog updated

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

If no commit message provided ($ARGUMENTS is empty), generate one based on:
- Conventional commits format (feat:, fix:, docs:, refactor:, etc.)
- Summarize the main changes

## Step 6: Push to Remote

```bash
git push origin HEAD
```

If push fails (no upstream), set upstream:
```bash
git push -u origin $(git branch --show-current)
```

## Step 7: Summary

Output a summary:
- Files changed
- Documentation updated
- Changelog entries added
- Commit hash
- Push status

## Important Notes

- If there are no changes to commit, inform the user and exit
- If documentation doesn't exist for a changed area, create it
- Always verify push succeeded before completing
- English for commit messages, Turkish for documentation/changelog
