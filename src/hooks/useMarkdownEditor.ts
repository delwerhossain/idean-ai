'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'

export interface UseMarkdownEditorOptions {
  initialContent?: string
  onChange?: (content: string) => void
  onUpdate?: (content: string) => void
  debounceMs?: number
  autoSave?: boolean
  autoSaveInterval?: number
}

export interface MarkdownEditorState {
  content: string
  isModified: boolean
  wordCount: number
  characterCount: number
  lastSaved: Date | null
}

export function useMarkdownEditor({
  initialContent = '',
  onChange,
  onUpdate,
  debounceMs = 500,
  autoSave = false,
  autoSaveInterval = 30000 // 30 seconds
}: UseMarkdownEditorOptions = {}) {
  const [state, setState] = useState<MarkdownEditorState>({
    content: initialContent,
    isModified: false,
    wordCount: 0,
    characterCount: 0,
    lastSaved: null
  })

  const editorRef = useRef<Editor | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const autoSaveRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounced content update
  const debouncedUpdate = useCallback((content: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      onChange?.(content)
      onUpdate?.(content)
      
      setState(prev => ({
        ...prev,
        isModified: content !== initialContent
      }))
    }, debounceMs)
  }, [onChange, onUpdate, debounceMs, initialContent])

  // Handle editor updates
  const handleEditorUpdate = useCallback((editor: Editor) => {
    const html = editor.getHTML()
    const text = editor.getText()
    
    // Simple word count (split by whitespace and filter empty)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const wordCount = text.trim() === '' ? 0 : words.length
    const characterCount = text.length

    setState(prev => ({
      ...prev,
      content: html,
      wordCount,
      characterCount
    }))

    debouncedUpdate(html)
  }, [debouncedUpdate])

  // Set editor reference
  const setEditor = useCallback((editor: Editor | null) => {
    editorRef.current = editor
    
    if (editor) {
      // Initialize word/character count
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(word => word.length > 0)
      const wordCount = text.trim() === '' ? 0 : words.length
      
      setState(prev => ({
        ...prev,
        wordCount,
        characterCount: text.length
      }))
    }
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && state.isModified) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }

      autoSaveRef.current = setTimeout(() => {
        // Trigger save
        onChange?.(state.content)
        setState(prev => ({
          ...prev,
          lastSaved: new Date(),
          isModified: false
        }))
      }, autoSaveInterval)
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [autoSave, state.isModified, state.content, onChange, autoSaveInterval])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [])

  // Manual save function
  const save = useCallback(() => {
    if (state.isModified) {
      onChange?.(state.content)
      setState(prev => ({
        ...prev,
        lastSaved: new Date(),
        isModified: false
      }))
    }
  }, [state.content, state.isModified, onChange])

  // Reset function
  const reset = useCallback(() => {
    setState({
      content: initialContent,
      isModified: false,
      wordCount: 0,
      characterCount: 0,
      lastSaved: null
    })
    
    if (editorRef.current) {
      editorRef.current.commands.setContent(initialContent)
    }
  }, [initialContent])

  // Update content programmatically
  const setContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      content,
      isModified: content !== initialContent
    }))
    
    if (editorRef.current) {
      editorRef.current.commands.setContent(content)
    }
  }, [initialContent])

  // Get current content in different formats
  const getContent = useCallback(() => {
    if (editorRef.current) {
      return {
        html: editorRef.current.getHTML(),
        text: editorRef.current.getText(),
        json: editorRef.current.getJSON()
      }
    }
    return {
      html: state.content,
      text: '',
      json: null
    }
  }, [state.content])

  // Editor commands
  const commands = {
    bold: () => editorRef.current?.chain().focus().toggleBold().run(),
    italic: () => editorRef.current?.chain().focus().toggleItalic().run(),
    heading: (level: 1 | 2 | 3 | 4) => 
      editorRef.current?.chain().focus().toggleHeading({ level }).run(),
    paragraph: () => editorRef.current?.chain().focus().setParagraph().run(),
    undo: () => editorRef.current?.chain().focus().undo().run(),
    redo: () => editorRef.current?.chain().focus().redo().run(),
    selectAll: () => editorRef.current?.chain().focus().selectAll().run(),
    focus: () => editorRef.current?.chain().focus().run(),
  }

  // Editor state queries
  const isActive = {
    bold: () => editorRef.current?.isActive('bold') || false,
    italic: () => editorRef.current?.isActive('italic') || false,
    heading: (level?: number) => 
      level 
        ? editorRef.current?.isActive('heading', { level }) || false
        : editorRef.current?.isActive('heading') || false,
  }

  const canExecute = {
    undo: () => editorRef.current?.can().undo() || false,
    redo: () => editorRef.current?.can().redo() || false,
  }

  return {
    // State
    state,
    
    // Core functions
    setEditor,
    handleEditorUpdate,
    save,
    reset,
    setContent,
    getContent,
    
    // Commands
    commands,
    isActive,
    canExecute,
    
    // Utilities
    editor: editorRef.current
  }
}