'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BookmarkPlus, AlertCircle } from 'lucide-react'

interface SaveTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; description?: string }) => Promise<void>
  frameworkName: string
  loading?: boolean
  initialAdditionalInstructions?: string
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  onSave,
  frameworkName,
  loading = false,
  initialAdditionalInstructions = ''
}: SaveTemplateDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState(initialAdditionalInstructions)
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Template name is required'
    } else if (name.trim().length < 3) {
      newErrors.name = 'Template name must be at least 3 characters'
    } else if (name.trim().length > 100) {
      newErrors.name = 'Template name must be less than 100 characters'
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined
      })

      // Reset form and close dialog
      setName('')
      setDescription('')
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save template:', error)
      // Keep dialog open so user can retry
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setDescription(initialAdditionalInstructions)
    setErrors({})
    onOpenChange(false)
  }

  // Reset description when dialog opens/closes or initial value changes
  useEffect(() => {
    if (open) {
      setDescription(initialAdditionalInstructions)
    }
  }, [open, initialAdditionalInstructions])

  // Auto-suggest template name based on framework
  const suggestedName = `${frameworkName} Template - ${new Date().toLocaleDateString()}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>
                Create a reusable template from this {frameworkName} framework
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder={suggestedName}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors({ ...errors, name: undefined })
                }
              }}
              className={errors.name ? 'border-red-500' : ''}
              disabled={isSubmitting || loading}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Additional Instructions (Optional)</Label>
            <Textarea
              id="template-description"
              placeholder="Any specific requirements or context for this template..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) {
                  setErrors({ ...errors, description: undefined })
                }
              }}
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
              disabled={isSubmitting || loading}
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.description}</span>
              </div>
            )}
            <div className="text-xs text-gray-500">
              {description.length}/500 characters
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <BookmarkPlus className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Template Benefits:</p>
                <ul className="text-xs space-y-1">
                  <li>• Reuse this framework configuration for future projects</li>
                  <li>• Share with team members for consistent results</li>
                  <li>• Access from your Templates dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || loading || !name.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting || loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}