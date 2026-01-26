# Changelog Entry Template

Use this template when adding entries to CHANGELOG.md.

## Entry Format

```markdown
## [Unreleased]

### Eklenen
- Yeni özellik açıklaması (`dosya/yolu.ts`)

### Değiştirilen
- Değişiklik açıklaması

### Düzeltilen
- Hata düzeltmesi açıklaması

### Kaldırılan
- Kaldırılan özellik açıklaması
```

## Categories (Turkish)

| English | Turkish | Usage |
|---------|---------|-------|
| Added | Eklenen | New features, components, files |
| Changed | Değiştirilen | Changes in existing functionality |
| Fixed | Düzeltilen | Bug fixes |
| Removed | Kaldırılan | Removed features or deprecated code |
| Security | Güvenlik | Security-related changes |
| Deprecated | Kullanımdan Kaldırılacak | Features to be removed in future |

## Examples

### Feature Addition
```markdown
### Eklenen
- Kullanıcı profil sayfası eklendi (`src/features/users/pages/ProfilePage.tsx`)
- Avatar bileşeni eklendi (`src/components/ui/Avatar.tsx`)
```

### Bug Fix
```markdown
### Düzeltilen
- Login sayfasında redirect sorunu giderildi
- Form validation hata mesajları düzeltildi
```

### Refactoring
```markdown
### Değiştirilen
- API client yapısı yeniden düzenlendi
- Component props interface'leri güncellendi
```

## Release Format

When creating a release, change `[Unreleased]` to version and date:

```markdown
## [1.2.0] - 2026-01-26

### Eklenen
- ...
```
