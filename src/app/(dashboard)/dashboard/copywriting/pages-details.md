## **TipTap Rich Editor Integration Instructions for iDEAN AI**

### **1. Editor Placement & Layout**

**Replace Current Output Canvas:**
- Remove the static content display cards
- Replace with single full-height TipTap editor instance
- Editor takes entire right panel (60% width)
- White background with subtle shadow inset

**Editor Container Structure:**
```
Right Panel (Canvas)
├─ Toolbar (Fixed top, 48px height)
├─ Editor Content (Scrollable, flex-1)
└─ Bottom Actions Bar (Fixed, 56px height)
```

### **2. Toolbar Design Specifications**

**Visual Style:**
- White background with bottom border (1px solid #E5E7EB)
- Sticky positioning at top of canvas
- Group related tools with vertical separators
- Icon size: 20px with 36px touch targets
- Active state: Purple background (#F3E8FF) with purple icon (#8B5CF6)

**Tool Groups (Left to Right):**

**Group 1 - Text Formatting:**
- Bold (B icon)
- Italic (I icon)
- Underline (U icon)
- Strikethrough (S with line)

**Group 2 - Headings:**
- Dropdown: Normal, H1, H2, H3
- Current selection shown in dropdown

**Group 3 - Lists:**
- Bullet list
- Numbered list
- Task list (checkbox)

**Group 4 - Alignment:**
- Left align
- Center
- Right align
- Justify

**Group 5 - Insert:**
- Link (chain icon)
- Image (picture icon)
- Table (grid icon)
- Horizontal line

**Group 6 - History:**
- Undo (arrow left)
- Redo (arrow right)

**Right Side Tools:**
- Export dropdown (PDF, Markdown, DOCX)
- Full screen toggle
- Settings gear

### **3. Editor Content Area Design**

**Typography Defaults:**
- Font: System default or Inter
- Base size: 16px for body text
- Line height: 1.75 for readability
- Max width: 800px centered (for readability)
- Padding: 32px on all sides

**Content Styling:**
- H1: 32px, bold, 1.2 line height
- H2: 24px, bold, 1.3 line height
- H3: 20px, semibold, 1.4 line height
- Paragraph: 16px, regular, 1.75 line height
- Lists: 16px with 24px indent
- Links: Purple (#8B5CF6) with underline on hover

**Focus Behavior:**
- Remove default outline
- Show subtle left border (3px purple) on focused paragraph
- Smooth cursor blink animation

### **4. Generated Content Integration**

**Initial Content Load:**
When generation completes:
1. Parse generated sections into HTML structure
2. Load into TipTap with proper formatting
3. Automatically apply heading styles to section titles
4. Preserve emoji icons from generation
5. Set cursor at document start

**Section Structure in Editor:**
```
📸 Image Idea
[Generated image description as paragraph]

💬 Primary Text
Hook: [Bold text for hook]
[Body content as normal paragraph]
CTA: [Styled as emphasized text]

📌 Headline
[Larger text, H2 style]

📝 Description
[Normal paragraph text]
```

### **5. Editing Behaviors**

**Real-time Formatting:**
- Show formatting bubble menu on text selection
- Include only: Bold, Italic, Link, Highlight
- Position above selection with arrow pointing down
- Fade in/out smoothly (200ms)

**Keyboard Shortcuts:**
- Ctrl/Cmd + B: Bold
- Ctrl/Cmd + I: Italic
- Ctrl/Cmd + U: Underline
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo
- Ctrl/Cmd + K: Insert link
- Ctrl/Cmd + Enter: Save/Export

**Auto-save Behavior:**
- Save to local storage every 30 seconds
- Show "Saving..." indicator briefly
- "All changes saved" message in bottom bar

### **6. Export Functionality**

**Export Button Design:**
- Primary purple button in bottom bar
- Dropdown arrow for format selection
- Options: PDF, Markdown, Plain Text, HTML

**PDF Export Settings:**
- A4 page size default
- Include iDEAN AI watermark (optional)
- Preserve formatting and colors
- Add page numbers
- Include generation metadata in footer

**Markdown Export:**
- Clean markdown with proper heading levels
- Preserve lists and formatting
- Include front matter with metadata
- Copy to clipboard option

### **7. Bottom Actions Bar**

**Layout (Left to Right):**
```
[Word Count: 248] | [Save Status] | [Spacer] | [Regenerate] [Copy All] [Export ▼]
```

**Specifications:**
- Fixed bottom position
- White background with top border
- 56px height with 16px padding
- Right side: Action buttons group
- Left side: Status information

### **8. Mobile/Tablet Adaptations**

**Tablet (768-1024px):**
- Hide less-used toolbar items in dropdown
- Reduce editor padding to 16px
- Stack toolbar in two rows if needed

**Mobile (<768px):**
- Floating toolbar that appears on selection
- Simplified toolbar with essential tools only
- Full-width editor with 8px padding
- Export moves to hamburger menu

### **9. Performance Optimizations**

**Large Document Handling:**
- Virtualize content over 10,000 words
- Lazy load images
- Debounce auto-save (1 second after typing stops)
- Chunk PDF generation for large exports

**Memory Management:**
- Clear undo history after 50 operations
- Compress images on paste
- Limit clipboard size to 1MB

### **10. Accessibility Requirements**

**Keyboard Navigation:**
- Tab through toolbar buttons
- Arrow keys for dropdown navigation
- Escape to close dropdowns/menus
- Focus trap in fullscreen mode

**Screen Reader Support:**
- ARIA labels for all toolbar buttons
- Announce formatting changes
- Role="textbox" with proper labeling
- Status messages for save/export

### **11. Integration with Existing Features**

**Regeneration Flow:**
1. Select text section in editor
2. Right-click shows "Regenerate this section"
3. Opens modal with section-specific inputs
4. Replace selected text with new generation
5. Highlight changed text briefly (yellow fade)

**Template System:**
- Save current document as template
- Load template preserves formatting
- Template variables marked with {{variable}}
- Replace variables on generation

### **12. Styling Classes Structure**

Use these class naming patterns:
```
.idean-editor-wrapper
.idean-editor-toolbar
.idean-editor-content
.idean-editor-actions
.idean-export-menu
.idean-format-bubble
```

### **13. Error Handling**

**Export Failures:**
- Show inline error message
- Retry button
- Fallback to clipboard copy

**Content Loss Prevention:**
- Warn before closing with unsaved changes
- Recover from local storage on crash
- Version history (last 5 versions)

### **14. Visual Polish**

**Animations:**
- Toolbar buttons: Scale 0.95 on click
- Bubble menu: Fade + slide up
- Export progress: Circular progress indicator
- Format changes: Brief highlight animation

**Empty State:**
- Light gray placeholder text
- "Start typing or paste your content..."
- Disappears on focus

This implementation will give you a Google Docs-like editing experience that fits perfectly with your Jasper-inspired design while maintaining the iDEAN AI brand identity.