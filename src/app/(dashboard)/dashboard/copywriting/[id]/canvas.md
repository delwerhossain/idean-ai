# **Idean AI Copywriting Canvas - Multi-Page Document Editor**

## **Project Integration Context**

This canvas is specifically designed for the Idean AI copywriting platform to handle:
- **Framework-based content generation** (NeuroCopywriting™, Nuclear Content™, etc.)
- **Multi-section documents** with AI-generated content blocks
- **Campaign sequences** and email series
- **Export to multiple formats** for client deliverables
- **Real-time collaboration** on copywriting projects
- **Performance optimization** for documents up to 100+ pages

## **1. Enhanced Core Libraries for Idean AI**

Install these performance-optimized libraries:
```bash
pnpm add @lexical/react @lexical/headless @lexical/rich-text @lexical/selection
pnpm add react-intersection-observer react-window react-window-infinite-loader
pnpm add react-to-print html2canvas turndown file-saver
pnpm add react-hotkeys-hook @react-spring/web framer-motion
pnpm add comlink worker-loader
pnpm add @radix-ui/react-toolbar @radix-ui/react-dropdown-menu
pnpm add lucide-react class-variance-authority clsx tailwind-merge
pnpm add @tanstack/react-query zustand immer
```

### **AI Integration Dependencies**
```bash
pnpm add openai @ai-sdk/openai ai
pnpm add react-markdown remark-gfm rehype-highlight
pnpm add @types/turndown @types/file-saver
```

## **2. Idean AI Canvas Architecture**

### **Multi-Page Document Structure**

**Primary Layout (VentureKit-inspired):**
```tsx
interface CanvasLayout {
  sidebar: 'framework-navigator' | 'page-thumbnails' | 'ai-assistant'
  main: 'document-canvas'
  rightPanel: 'ai-suggestions' | 'export-options' | 'collaboration'
}
```

**Container Hierarchy:**
```
┌─ Dashboard Layout (100vh)
├─ Toolbar (64px) - Framework selection, AI tools, export
├─ Canvas Container (flex-1)
│  ├─ Left Sidebar (280px) - Page navigator, AI prompts
│  ├─ Document Viewport (flex-1)
│  │  ├─ Canvas Background (#F8F9FA)
│  │  ├─ Page Container (centered)
│  │  │  ├─ Page 1 (816px × 1056px)
│  │  │  ├─ Page 2 (816px × 1056px)
│  │  │  └─ Page N...
│  │  └─ Floating AI Assistant
│  └─ Right Panel (320px) - Export, sharing, analytics
└─ Status Bar (32px) - Word count, zoom, save status
```

### **Responsive Breakpoints**
- **Desktop (>1400px)**: Full three-panel layout
- **Laptop (1024-1400px)**: Collapsible sidebars
- **Tablet (768-1024px)**: Single sidebar toggle
- **Mobile (<768px)**: Stack layout, floating toolbars

## **3. Advanced Performance Strategy for Idean AI**

### **Virtual Document Rendering**

**Intelligent Page Management:**
```typescript
interface PageManager {
  activePages: Set<number>  // Currently rendered pages
  bufferPages: Set<number>  // Pre-loaded for smooth scroll
  cachedContent: Map<number, PageContent>
  aiGeneratedSections: Map<string, AIContent>
  frameworkData: FrameworkState
}
```

**Performance Targets:**
- **First Page Render**: <200ms
- **Page Switching**: <50ms
- **AI Content Insertion**: <500ms with animation
- **Document Export**: <3s for 50 pages
- **Memory Usage**: <100MB for 100-page document

### **Optimized Content Chunking**

**Framework-Aware Chunking:**
- **Section-based**: Break at framework boundaries (Intro → Hook → Body → CTA)
- **AI content blocks**: Separate virtual containers for generated content
- **Dynamic sizing**: Pages adjust based on content density
- **Smart pagination**: Keep related content together

**Advanced Debouncing:**
```typescript
const debounceTimes = {
  typing: 0,              // Immediate response
  formatting: 16,         // Single frame
  aiGeneration: 100,      // Prevent rapid AI calls
  autoSave: 2000,         // Standard auto-save
  analytics: 5000,        // Performance tracking
  exportPreview: 1000     // Export preview update
}
```

## **4. Multi-Page Rendering System**

### **Dynamic Page Creation**

**Page Types for Idean AI:**
```typescript
type PageType = 
  | 'cover'           // Framework intro, client info
  | 'strategy'        // Strategic framework content
  | 'content'         // Generated copy sections
  | 'appendix'        // Resources, references
  | 'export-summary'  // Campaign overview

interface PageConfig {
  type: PageType
  template: FrameworkTemplate
  aiSections: string[]
  exportFormat: 'pdf' | 'docx' | 'notion' | 'gdocs'
}
```

### **Intelligent Page Management**

**Auto-Pagination Rules:**
- **Framework sections**: Natural breaks between components
- **AI content blocks**: Keep generated sections intact
- **Campaign sequences**: Group related emails/posts
- **Client presentations**: Professional page breaks

**Visual Enhancement:**
```css
.idean-page {
  width: 816px;
  min-height: 1056px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 8px;
  margin: 24px auto;
  position: relative;
}

.page-header {
  /* Framework branding */
  border-bottom: 2px solid var(--orange-600);
  padding: 24px;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
}

.ai-content-block {
  border-left: 4px solid var(--orange-500);
  background: rgba(251, 146, 60, 0.05);
  margin: 16px 0;
  padding: 16px;
}
```

## **5. Idean AI Enhanced Editing Experience**

### **AI-Powered Editing Features**

**Smart Content Recognition:**
```typescript
interface ContentRecognition {
  frameworkSection: 'hook' | 'story' | 'offer' | 'cta'
  contentType: 'headline' | 'body' | 'bullet' | 'quote'
  aiSuggestions: ContentSuggestion[]
  brandVoice: 'professional' | 'casual' | 'persuasive' | 'urgent'
}
```

**Intelligent Typing Enhancements:**
- **AI auto-complete**: Framework-aware suggestions
- **Brand voice consistency**: Real-time tone analysis
- **Conversion optimization**: Highlight weak phrases
- **A/B testing prompts**: Generate variations on-the-fly

### **Framework-Specific Editing**

**NeuroCopywriting™ Mode:**
- Highlight psychological triggers
- Suggest power words and emotional hooks
- Track persuasion score in real-time

**Nuclear Content™ Mode:**
- Viral potential meter
- Hook strength indicator
- Engagement prediction

**Email Sequence Mode:**
- Subject line optimizer
- CTA placement suggestions
- Deliverability score

### **Advanced Selection & Formatting**
```css
.idean-selection {
  background: rgba(251, 146, 60, 0.2);
  color: inherit;
  border-radius: 2px;
}

.ai-suggestion-highlight {
  background: linear-gradient(120deg, transparent 0%, rgba(251, 146, 60, 0.3) 50%, transparent 100%);
  animation: suggestion-pulse 2s ease-in-out infinite;
}

.framework-section {
  border-left: 3px solid var(--section-color);
  padding-left: 16px;
  margin: 24px 0;
}
```

## **6. Idean AI Smart Toolbar System**

### **Context-Aware Toolbar**

**Framework-Specific Toolbars:**
```tsx
interface ToolbarConfig {
  framework: FrameworkType
  activeSection: ContentSection
  aiTools: AIToolSet
  exportOptions: ExportFormat[]
}

// NeuroCopywriting™ Toolbar
const neuroCopyToolbar = {
  psychologyTriggers: ['scarcity', 'authority', 'social-proof'],
  powerWords: ['exclusive', 'limited', 'proven'],
  emotionalHooks: ['fear', 'desire', 'curiosity'],
  cta Optimizer: true
}
```

### **AI-Enhanced Formatting**

**Primary Toolbar (Left → Right):**
1. **Framework Selector** - Switch between content types
2. **AI Assistant** - Generate/improve content
3. **Brand Voice** - Maintain consistency
4. **Format Tools** - Standard text formatting
5. **Structure Tools** - Headings, lists, sections
6. **Export Tools** - PDF, Notion, Google Docs

### **Smart Formatting Options**

**Framework Styles:**
```typescript
const frameworkStyles = {
  'hook-headline': {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#EA580C',
    lineHeight: '1.2'
  },
  'story-paragraph': {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#374151'
  },
  'cta-button': {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    background: '#EA580C',
    padding: '12px 24px',
    borderRadius: '6px'
  }
}
```

### **Dynamic Toolbar States**

**Context-Sensitive Tools:**
- **Writing Mode**: Focus on content generation
- **Editing Mode**: Formatting and structure tools
- **Review Mode**: Comments and suggestions
- **Export Mode**: Format and sharing options

## **7. Intelligent Zoom & View Modes**

### **Multi-Modal Viewing System**

**View Modes for Different Use Cases:**
```typescript
type ViewMode = 
  | 'writing'      // Full focus, single page
  | 'review'       // Multi-page overview
  | 'present'      // Client presentation mode
  | 'export'       // Print preview

interface ViewConfig {
  mode: ViewMode
  zoom: number
  pagesVisible: number
  sidebarsVisible: boolean
  aiAssistantVisible: boolean
}
```

### **Smart Zoom Implementation**

**Contextual Zoom Levels:**
- **Writing Mode**: 100%, 125% (optimal for typing)
- **Review Mode**: 75%, 90% (see more content)
- **Present Mode**: Fit to screen
- **Export Mode**: 100% (WYSIWYG)

**Zoom Controls:**
```tsx
const ZoomControls = () => (
  <div className="flex items-center gap-2">
    <Button size="sm" onClick={zoomOut}>−</Button>
    <Slider value={zoom} onChange={setZoom} className="w-24" />
    <Button size="sm" onClick={zoomIn}>+</Button>
    <DropdownMenu>
      <DropdownMenuTrigger>{zoom}%</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setZoom(50)}>50%</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setZoom(75)}>75%</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setZoom(100)}>100%</DropdownMenuItem>
        <DropdownMenuItem onClick={() => fitToWidth()}>Fit Width</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)
```

### **8. Content Generation Integration**

**Generated Content Insertion:**

When AI generates content, insert it with smooth animation:
1. Show brief highlight animation where content appears
2. Preserve formatting from generation (headings, lists, emphasis)
3. Auto-scroll to inserted content
4. Flash yellow background that fades over 2 seconds

**Section Management:**
- Each generated section gets invisible markers
- Right-click any section to regenerate
- Maintain section boundaries for targeted regeneration
- Show section hints on hover (subtle left border)

### **9. Export Implementation with react-to-print**

**PDF Export Configuration:**

Configure react-to-print to maintain exact document appearance:
- Set page size to 8.5" x 11" in print CSS
- Remove shadows and backgrounds in print mode
- Ensure page breaks align with visual pages
- Include headers/footers if present
- Maintain font embedding for consistency

**Export Quality Settings:**
- High resolution: 300 DPI equivalent
- Compress images but maintain readability
- Embed fonts when possible
- Generate searchable PDF (text layer preserved)

**Multiple Format Support:**
- PDF: Direct via react-to-print
- Markdown: Convert HTML to MD preserving structure
- Plain Text: Strip all formatting, maintain line breaks
- HTML: Clean HTML with inline styles

### **10. Auto-Save and Recovery**

**Auto-Save Strategy:**

Implement three-tier saving:
1. Local Storage: Every 2 seconds after changes
2. Session Storage: Complete document state
3. Server: Every 30 seconds (if changed)

**Recovery Features:**
- Detect unsaved changes on page leave
- Restore from local storage on crash
- Version snapshots every 5 minutes
- Conflict resolution for concurrent edits

### **11. Responsive Behavior**

**Screen Size Adaptations:**

Desktop (>1200px):
- Full page width (816px)
- All toolbar options visible
- Side margins for comfortable viewing

Tablet (768-1200px):
- Scale page to fit width
- Collapse toolbar groups into dropdowns
- Hide status bar labels (icons only)

Mobile (not recommended but supported):
- Full width with minimal margins
- Floating toolbar on text selection
- Simplified formatting options
- Zoom disabled (always fit to width)

### **12. Accessibility Enhancements**

**Keyboard Navigation:**
- Full keyboard control for all formatting
- Tab navigation through toolbar
- Screen reader announcements for operations
- High contrast mode support
- Focus indicators on all interactive elements

**ARIA Implementation:**
- Proper roles for document structure
- Live regions for status updates
- Descriptive labels for all controls
- Keyboard shortcut announcements

### **13. Memory Management**

**Optimization Techniques:**
- Limit undo history to 100 operations
- Clear clipboard after large pastes
- Compress images on insertion
- Release memory for non-visible pages
- Use WeakMap for temporary data

### **14. Error Handling**

**Graceful Degradation:**
- Fallback to simple textarea if Lexical fails
- Local save if server unreachable
- Alternative export if react-to-print fails
- Recovery prompt for corrupted documents
- Clear error messages with recovery actions

### **15. Polish Details**

**Micro-Interactions:**
- Toolbar buttons depress on click (scale 0.95)
- Smooth scroll between pages
- Format changes animate (200ms transition)
- Hover effects on all interactive elements
- Loading skeletons for async operations

**Visual Refinements:**
- Subpixel antialiasing for text
- Consistent shadow depths
- Smooth color transitions
- Proper spacing rhythm (8px base unit)
- Professional color palette (grays, blues)

This implementation will deliver a professional, performant MS Word-like editing experience that users will find familiar and efficient.


## **Multi-Page Canvas Implementation for Document View/Edit**

### **1. Multi-Canvas Architecture**

**Yes, using multiple canvases for each page is actually the BEST approach for performance.** Here's how to implement it:

### **2. Page Canvas Strategy**

**Individual Canvas Per Page:**

Instead of one large scrollable container, create separate canvas elements for each page. This provides several advantages:

- Each page is an independent editing context
- Memory efficient - only active pages consume resources
- Smooth pagination without reflow
- Better print quality per page
- Isolated page operations (delete, reorder, duplicate)

### **3. Implementation Structure**

**Document Container Setup:**

Create a virtualized list container that holds multiple page components. Each page component contains its own Lexical/TipTap editor instance with isolated state.

**Page Component Architecture:**
- Container: Fixed dimensions wrapper
- Canvas: Individual editor instance
- Observer: Intersection observer per page
- State: Separate content state per page

### **4. Virtual Scrolling with Multiple Editors**

**Rendering Strategy:**

Only mount editor instances for visible pages plus buffer:
- Viewport detection using Intersection Observer
- Mount editor when page enters viewport + 100px buffer
- Unmount editor when page exits viewport + 500px buffer
- Keep content in memory, only unmount editor UI

**Performance Benefits:**
- 100-page document only renders 3-5 editor instances
- Scroll remains smooth regardless of document length
- Memory usage stays constant
- No lag on long documents

### **5. Page Management System**

**Page State Management:**

Each page maintains:
- Unique page ID
- Content state (Lexical/TipTap state object)
- Page number
- Modified flag
- Lock status (for concurrent editing)

**Page Operations:**
- Add new page when current fills
- Delete empty pages automatically
- Reorder pages via drag and drop
- Split pages at cursor position
- Merge pages when content deleted

### **6. Content Flow Between Pages**

**Automatic Text Flow:**

When content exceeds page height:
1. Calculate content height in real-time
2. Detect overflow at 950px (leaving margin)
3. Split content at nearest paragraph break
4. Move overflow to next page
5. Create new page if needed

**Smart Breaking Rules:**
- Never break inside word
- Avoid breaking headers from following text
- Keep list items together when possible
- Maintain table integrity

### **7. Synchronized Editing**

**Cross-Page Features:**

Find and Replace:
- Search across all page canvases
- Highlight results in non-active pages
- Jump to page on result selection

Selection:
- Allow selection across page boundaries
- Ctrl+A selects all pages content
- Copy/paste maintains page context

Formatting:
- Apply format to selection spanning pages
- Maintain consistency across page breaks

### **8. Optimized Rendering Pipeline**

**Render Optimization Techniques:**

Lazy Component Loading:
- Page shell renders immediately (gray placeholder)
- Editor initializes after 100ms delay
- Content loads progressively
- Smooth fade-in animation

Request Animation Frame:
- Batch DOM updates
- Smooth scroll calculations
- Prevent layout thrashing
- 60 FPS maintained

### **9. Memory Management**

**Efficient Memory Usage:**

Page Lifecycle:
- Active: Full editor mounted
- Idle: Editor unmounted, content cached
- Archived: Content compressed
- Destroyed: Memory released

Cache Strategy:
- Keep 10 pages in active memory
- Compress older pages
- Reload from storage when needed
- Maximum 50MB memory footprint

### **10. Export with Multiple Canvases**

**React-to-Print Configuration:**

Export All Pages:
1. Temporarily mount all page editors
2. Wait for render completion
3. Trigger react-to-print
4. Unmount non-visible pages after export

Export Quality:
- Each page renders at full resolution
- No scaling artifacts
- Maintain vector graphics
- Preserve exact positioning

### **11. Navigation Improvements**

**Page Navigation UI:**

Thumbnail Sidebar:
- Mini preview of each page
- Click to jump
- Drag to reorder
- Visual page numbers

Page Indicator:
- Current page / Total pages
- Quick jump input
- Previous/Next buttons
- Keyboard shortcuts (PgUp/PgDn)

### **12. Responsive Page Grid**

**Multiple View Modes:**

Single Page View:
- One page centered
- Maximum readability
- Best for editing

Two-Page Spread:
- Side-by-side pages
- Book-like view
- Good for review

Thumbnail Grid:
- 4-6 pages visible
- Overview mode
- Quick navigation

### **13. Performance Metrics**

**Target Performance:**

Initial Load:
- First page visible < 500ms
- Editable < 1 second
- All UI responsive < 2 seconds

Scrolling:
- 60 FPS smooth scroll
- No jank on fast scroll
- Instant page swap

Typing:
- Zero input latency
- No lag up to 120 WPM
- Smooth cursor movement

### **14. Progressive Enhancement**

**Fallback Strategy:**

If multi-canvas fails:
1. Detect performance issues
2. Switch to single canvas mode
3. Maintain functionality
4. Show performance warning
5. Offer to reduce features

### **15. Implementation Benefits Summary**

**Why Multiple Canvases are Superior:**

Performance:
- Constant memory usage regardless of document size
- No performance degradation with length
- Smooth operations on all devices

User Experience:
- True page-by-page editing
- Accurate print preview
- Professional document feel
- Familiar pagination

Technical:
- Easier to implement page features
- Better error isolation
- Simpler state management
- Cleaner codebase

## **Implementation Summary**

This enhanced Idean AI copywriting canvas delivers:

✅ **Superior Performance**: Virtual rendering handles 100+ page documents smoothly  
✅ **Framework Integration**: Seamless AI content generation with proven methodologies  
✅ **Multi-Page Support**: Independent page canvases for optimal memory management  
✅ **Professional Export**: Client-ready deliverables in multiple formats  
✅ **Team Collaboration**: Real-time editing with role-based access  
✅ **Responsive Design**: Optimized experience across all devices  
✅ **Accessibility**: WCAG 2.1 AA compliant with inclusive design  

### **Next Steps**
1. Review the detailed module specifications in `canvas-modules.md`  
2. Install the enhanced dependency stack  
3. Implement the multi-page canvas architecture  
4. Integrate with Idean AI's framework system  
5. Add team collaboration features  
6. Optimize for mobile and tablet experiences  

This architecture ensures the Idean AI copywriting platform provides a best-in-class experience for creating high-converting content using proven frameworks.