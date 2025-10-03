# Loading System Documentation

## Overview
This project uses a consistent, brand-aligned loading system with multiple variants for different use cases. All loading components follow the Idean brand colors and design language.

## Components

### 1. LoadingState (Primary)
**File:** `loading-states.tsx`

The main loading component for full-page and major transitions.

#### Variants

##### `brand` (Default)
Full-page loading with Idean branding, logo animation, and progress bar.
```tsx
<LoadingState
  message="Loading copywriting framework..."
  submessage="Setting up your AI-powered content studio"
  variant="brand"
  size="lg"
/>
```
**Use for:** Initial page loads, framework loading, major transitions

##### `default`
Simpler loading state with icon and spinner.
```tsx
<LoadingState
  message="Loading..."
  submessage="Please wait"
  variant="default"
  size="md"
/>
```
**Use for:** Modal loading, section loading

##### `minimal`
Compact loading with animated icon.
```tsx
<LoadingState
  message="Processing..."
  variant="minimal"
  size="sm"
/>
```
**Use for:** Inline loading, compact spaces

##### `spinner-only`
Just the spinner, no text or decoration.
```tsx
<LoadingState variant="spinner-only" size="md" />
```
**Use for:** Very compact spaces, icon replacements

---

### 2. InlineLoader
**File:** `loading-states.tsx`

Small spinner for inline use in buttons and compact UI elements.

```tsx
<InlineLoader size="sm" />
<InlineLoader size="md" className="text-blue-600" />
```

**Sizes:** `xs`, `sm`, `md`, `lg`

**Use for:**
- Button loading states
- Inline text loading
- Small UI components

**Example in Button:**
```tsx
<Button disabled={isLoading}>
  {isLoading ? <InlineLoader size="sm" className="mr-2" /> : null}
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

---

### 3. ContentSkeleton
**File:** `loading-states.tsx`

Shimmer effect skeleton for content placeholders.

```tsx
<ContentSkeleton lines={3} />
<ContentSkeleton lines={5} className="mt-4" />
```

**Use for:**
- List item placeholders
- Text content loading
- Profile information loading

---

### 4. CardSkeleton
**File:** `loading-states.tsx`

Complete card skeleton with icon, title, and content areas.

```tsx
<CardSkeleton />
<CardSkeleton className="mb-4" />
```

**Use for:**
- Card grid placeholders
- Dashboard widgets
- List cards

---

### 5. ProcessingAnimation
**File:** `loading-states.tsx`

Animated loading for AI processing and long operations.

```tsx
<ProcessingAnimation
  message="Generating content..."
  submessage="This may take a few moments"
/>
```

**Use for:**
- AI generation
- Heavy processing
- Background operations
- Upload/download progress

**Features:**
- Orbiting particles
- Pulsing logo
- Bouncing dots
- Spinner

---

## Color Scheme

All loading components use the Idean brand colors:

```css
--idean-navy-blue: #1e2a4a
--idean-blue: #515d8f
--idean-blue-light: #f8f9fc
--idean-blue-pale: #eef1f7
--idean-blue-dark: #404a73
--idean-blue-medium: #6b77a8
```

---

## Animations

### Available Animations
- `animate-pulse` - Built-in Tailwind pulse
- `animate-spin` - Built-in Tailwind spin
- `animate-bounce` - Built-in Tailwind bounce
- `animate-loading-bar` - Custom progress bar animation
- `animate-shimmer` - Custom shimmer effect
- `animate-spin-slow` - Slow rotation (3s)
- `animate-pulse-slow` - Slow pulse (3s)

### Custom Keyframes
Defined in `globals.css`:

```css
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## Usage Guidelines

### Full Page Loading
```tsx
// In page components
if (loading) {
  return (
    <LoadingState
      message="Loading framework..."
      submessage="Setting up your workspace"
      variant="brand"
      size="lg"
    />
  )
}
```

### Button Loading
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting && <InlineLoader size="sm" className="mr-2" />}
  {isSubmitting ? 'Processing...' : 'Submit'}
</Button>
```

### Content Placeholder
```tsx
{loading ? (
  <CardSkeleton />
) : (
  <Card>{content}</Card>
)}
```

### List Loading
```tsx
{loading ? (
  <>
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </>
) : (
  items.map(item => <ItemCard key={item.id} {...item} />)
)}
```

### AI Generation
```tsx
{isGenerating && (
  <ProcessingAnimation
    message="AI is generating your content..."
    submessage="Analyzing your inputs and creating personalized content"
  />
)}
```

---

## Migration from Old LoadingSpinner

### Before
```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner'

<LoadingSpinner size="lg" />
```

### After
```tsx
import { InlineLoader } from '@/components/ui/loading-states'

<InlineLoader size="lg" />
```

Or for full page:
```tsx
import { LoadingState } from '@/components/ui/loading-states'

<LoadingState message="Loading..." variant="brand" />
```

---

## Examples

### Example 1: Page Loading
```tsx
'use client'

import { LoadingState } from '@/components/ui/loading-states'

export default function MyPage() {
  const [loading, setLoading] = useState(true)

  if (loading) {
    return (
      <LoadingState
        message="Loading your dashboard..."
        submessage="Fetching latest data"
        variant="brand"
        size="lg"
      />
    )
  }

  return <div>Page Content</div>
}
```

### Example 2: Modal Loading
```tsx
import { LoadingState } from '@/components/ui/loading-states'

<Dialog open={isOpen}>
  <DialogContent>
    {loading ? (
      <LoadingState
        message="Processing..."
        variant="minimal"
        size="md"
      />
    ) : (
      <DialogContent>{content}</DialogContent>
    )}
  </DialogContent>
</Dialog>
```

### Example 3: Form Submission
```tsx
import { InlineLoader } from '@/components/ui/loading-states'

<form onSubmit={handleSubmit}>
  <Input {...fields} />

  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting && <InlineLoader size="sm" className="mr-2" />}
    {isSubmitting ? 'Saving...' : 'Save Changes'}
  </Button>
</form>
```

### Example 4: List with Skeletons
```tsx
import { CardSkeleton } from '@/components/ui/loading-states'

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map(item => <Card key={item.id}>{item.content}</Card>)}
  </div>
)}
```

---

## Best Practices

1. **Choose the right variant**
   - Use `brand` for major page loads
   - Use `minimal` for compact spaces
   - Use `spinner-only` for tight inline spaces

2. **Provide context with messages**
   - Always include a message explaining what's loading
   - Add submessages for longer operations

3. **Match size to context**
   - `lg` for full pages
   - `md` for modals and sections
   - `sm` for buttons and inline elements
   - `xs` for very compact spaces

4. **Consistent brand colors**
   - All loading states use Idean brand colors
   - Don't override with custom colors unless necessary

5. **Accessibility**
   - Loading components are visible and clear
   - Messages provide context for screen readers
   - Animations are smooth and not jarring

---

## Troubleshooting

### Loading component not animating
- Check that `globals.css` is imported
- Verify Tailwind config includes animations
- Ensure `tw-animate-css` is imported

### Colors not matching brand
- Verify CSS variables are defined in `globals.css`
- Check that root `:root` has Idean color variables
- Ensure you're using the CSS variable syntax: `var(--idean-blue)`

### Skeleton shimmer not working
- Check `animate-shimmer` class is applied
- Verify background gradient is set with `bg-[length:200%_100%]`
- Ensure keyframes are defined in `globals.css`

---

## Future Enhancements

- [ ] Progress percentage display
- [ ] Estimated time remaining
- [ ] Cancellable loading states
- [ ] Retry functionality
- [ ] Custom animation speeds
- [ ] Dark mode variants
