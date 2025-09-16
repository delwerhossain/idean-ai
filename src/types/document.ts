export interface DocumentState {
  id: string
  title: string
  content: string
  editedContent?: string
  isEditing: boolean
  wordCount: number
  characterCount: number
  lastModified: Date
  type?: 'section' | 'document' | 'page'
  index: number
  emoji?: string
  status?: 'draft' | 'editing' | 'complete'
}

export interface ExportOptions {
  format: 'markdown' | 'pdf' | 'html' | 'txt'
  includeMetadata: boolean
  combineDocuments: boolean
  filename?: string
}

export interface GenerationEditorState {
  documents: DocumentState[]
  activeDocument: string | null
  previewDocument: string | null
  viewMode: 'cards' | 'canvas' | 'list' | 'sections'
  exportOptions: ExportOptions
  totalWordCount: number
  totalCharacterCount: number
  lastSaved?: Date
}

export interface MultiDocumentCanvasProps {
  documents: DocumentState[]
  framework: {
    id: string
    name: string
    description?: string
  }
  isGenerating?: boolean
  onDocumentChange: (documentId: string, content: string) => void
  onDocumentToggleEdit: (documentId: string) => void
  onDocumentPreview: (documentId: string) => void
  onExport: (options: ExportOptions) => void
  viewMode: 'cards' | 'canvas' | 'list' | 'sections'
  onViewModeChange: (mode: 'cards' | 'canvas' | 'list' | 'sections') => void
}