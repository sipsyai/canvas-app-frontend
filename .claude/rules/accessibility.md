---
globs: ["src/components/**/*.tsx", "src/features/**/*.tsx"]
---
# Accessibility Rules (WCAG 2.1 AA)

## MANDATORY: React Aria Components

| Need | Use | Never Use |
|------|-----|-----------|
| Button | `<Button>` | `<button>` |
| Input | `<TextField>` | `<input>` |
| Checkbox | `<Checkbox>` | `<input type="checkbox">` |
| Radio | `<RadioGroup>` + `<Radio>` | `<input type="radio">` |
| Select | `<Select>` + `<ListBox>` | `<select>` |
| Modal | `<Modal>` + `<Dialog>` | Custom div overlay |
| Popover | `<Popover>` | Absolute positioned div |
| Tooltip | `<Tooltip>` | Custom hover div |
| Combobox | `<ComboBox>` | Custom autocomplete |
| Tabs | `<Tabs>` | Custom tab buttons |
| Table | `<Table>` (with TanStack) | Plain HTML table |

## Required Patterns

- Use `isDisabled`, `isRequired`, `isSelected` (not HTML attributes)
- Test keyboard navigation: Tab, Arrow keys, Enter, Space, Escape
- Focus rings: `focus:ring-2 focus:ring-primary`
- All interactive elements must work without mouse

## State Styling (data attributes)

```tsx
<Button className={cn(
  'px-4 py-2 rounded-lg',
  'focus:outline-none focus:ring-2 focus:ring-blue-500',
  'data-[pressed]:scale-95',
  'data-[disabled]:opacity-50',
  'data-[focused]:ring-2',
  'data-[selected]:bg-primary'
)}>
```

## Checklist Before Committing

- [ ] Uses React Aria component (not plain HTML)
- [ ] Keyboard accessible
- [ ] Focus ring visible
- [ ] Labels associated with inputs
- [ ] Error messages linked (aria-describedby)
- [ ] Required fields marked (isRequired)
- [ ] Disabled state properly handled

## Documentation

Official: https://react-spectrum.adobe.com/react-aria/
