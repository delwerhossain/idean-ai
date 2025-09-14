'use client'

import { useState, useEffect } from 'react'
import { 
  Grid, 
  List, 
  Layers, 
  FileText,
  Download,
  Copy,
  Plus,
  Settings,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DocumentCard } from './DocumentCard'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { DocumentState, MultiDocumentCanvasProps, ExportOptions } from '@/types/document'
import { 
  copyDocumentToClipboard,
  exportDocumentAsMarkdown,
  exportDocumentAsPDF,
  exportDocumentsAsZip,
  exportCombinedDocument
} from '@/utils/multiDocumentExport'
import { cn } from '@/lib/utils'

export function MultiDocumentCanvas({
  documents,
  framework,
  isGenerating = false,
  onDocumentChange,
  onDocumentToggleEdit,
  onDocumentPreview,
  onExport,
  viewMode,
  onViewModeChange
}: MultiDocumentCanvasProps) {
  const [previewDocument, setPreviewDocument] = useState<DocumentState | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())

  // Filter documents based on search and filter
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.content + (doc.editedContent || '')).toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
      doc.status === filterStatus ||
      (filterStatus === 'edited' && doc.editedContent)

    return matchesSearch && matchesFilter
  })

  // Statistics
  const stats = {
    total: documents.length,
    totalWords: documents.reduce((sum, doc) => sum + doc.wordCount, 0),
    totalCharacters: documents.reduce((sum, doc) => sum + doc.characterCount, 0),
    edited: documents.filter(doc => doc.editedContent).length,
    drafts: documents.filter(doc => doc.status === 'draft').length,
    complete: documents.filter(doc => doc.status === 'complete').length
  }

  // Handle document preview navigation
  const handlePreviewNavigation = (direction: 'next' | 'prev') => {
    if (!previewDocument) return
    
    const currentIndex = documents.findIndex(doc => doc.id === previewDocument.id)
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (newIndex >= 0 && newIndex < documents.length) {
      setPreviewDocument(documents[newIndex])
    }
  }

  // Handle individual document actions
  const handleDocumentCopy = async (document: DocumentState) => {
    try {
      await copyDocumentToClipboard(document)
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy document:', error)
    }
  }

  const handleDocumentExport = async (document: DocumentState) => {
    try {
      await exportDocumentAsMarkdown(document)
    } catch (error) {
      console.error('Failed to export document:', error)
    }
  }

  // Handle bulk export
  const handleBulkExport = async (options: ExportOptions) => {
    const docsToExport = selectedDocuments.size > 0 
      ? documents.filter(doc => selectedDocuments.has(doc.id))
      : documents

    try {
      if (options.combineDocuments) {
        await exportCombinedDocument(docsToExport, options)
      } else {
        await exportDocumentsAsZip(docsToExport, options)
      }
      onExport(options)
    } catch (error) {
      console.error('Failed to export documents:', error)
    }
  }

  // Toggle document selection
  const toggleDocumentSelection = (docId: string) => {
    const newSelection = new Set(selectedDocuments)
    if (newSelection.has(docId)) {
      newSelection.delete(docId)
    } else {
      newSelection.add(docId)
    }
    setSelectedDocuments(newSelection)
  }

  const ViewModeButton = ({ mode, icon, label }: {
    mode: typeof viewMode,
    icon: React.ReactNode,
    label: string
  }) => (
    <Button
      variant={viewMode === mode ? 'default' : 'outline'}
      size="sm"
      onClick={() => onViewModeChange(mode)}
      className="gap-2"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Title and Stats */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {framework.name} Documents
              </h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>{stats.total} documents</span>
                <span>{stats.totalWords} total words</span>
                {stats.edited > 0 && <Badge variant="secondary">{stats.edited} edited</Badge>}
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              {selectedDocuments.size > 0 && (
                <Badge variant="outline" className="gap-1">
                  {selectedDocuments.size} selected
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkExport({
                    format: 'markdown',
                    includeMetadata: false,
                    combineDocuments: false
                  })}>
                    <FileText className="h-4 w-4 mr-2" />
                    Individual Markdown Files
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkExport({
                    format: 'markdown',
                    includeMetadata: false,
                    combineDocuments: true
                  })}>
                    <FileText className="h-4 w-4 mr-2" />
                    Combined Markdown File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkExport({
                    format: 'html',
                    includeMetadata: true,
                    combineDocuments: false
                  })}>
                    <FileText className="h-4 w-4 mr-2" />
                    HTML Files (ZIP)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkExport({
                    format: 'pdf',
                    includeMetadata: false,
                    combineDocuments: true
                  })}>
                    <FileText className="h-4 w-4 mr-2" />
                    Combined PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Search and Filter */}
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Documents ({stats.total})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('edited')}>
                    Edited ({stats.edited})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                    Drafts ({stats.drafts})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('complete')}>
                    Complete ({stats.complete})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1">
              <ViewModeButton 
                mode="cards" 
                icon={<Grid className="h-4 w-4" />} 
                label="Cards" 
              />
              <ViewModeButton 
                mode="list" 
                icon={<List className="h-4 w-4" />} 
                label="List" 
              />
              <ViewModeButton 
                mode="sections" 
                icon={<Layers className="h-4 w-4" />} 
                label="Sections" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {isGenerating ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Documents</h3>
              <p className="text-sm text-gray-600">Creating your multi-document content...</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {documents.length === 0 ? 'No Documents Yet' : 'No Matching Documents'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {documents.length === 0 
                  ? 'Generate some content to get started with your multi-document canvas.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className={cn(
            "gap-6",
            viewMode === 'cards' && "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
            viewMode === 'list' && "space-y-4",
            viewMode === 'sections' && "space-y-6"
          )}>
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onEdit={() => onDocumentToggleEdit(document.id)}
                onPreview={() => setPreviewDocument(document)}
                onContentChange={(content) => onDocumentChange(document.id, content)}
                onCopy={() => handleDocumentCopy(document)}
                onExport={() => handleDocumentExport(document)}
                isActive={selectedDocuments.has(document.id)}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedDocuments.has(document.id) && "ring-2 ring-purple-500",
                  viewMode === 'list' && "max-w-none"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        documents={documents}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        onNext={() => handlePreviewNavigation('next')}
        onPrevious={() => handlePreviewNavigation('prev')}
        onEdit={() => {
          if (previewDocument) {
            onDocumentToggleEdit(previewDocument.id)
          }
        }}
        onCopy={() => {
          if (previewDocument) {
            handleDocumentCopy(previewDocument)
          }
        }}
        onExport={() => {
          if (previewDocument) {
            handleDocumentExport(previewDocument)
          }
        }}
        showNavigation={documents.length > 1}
      />
    </div>
  )
}