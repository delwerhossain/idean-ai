'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'

interface KnowledgeBaseStepProps {
  knowledgeBase: File[]
  onKnowledgeBaseChange: (value: File[]) => void
}

export default function KnowledgeBaseStep({ knowledgeBase, onKnowledgeBaseChange }: KnowledgeBaseStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_FILES = 3

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== files.length) {
      alert('Only PDF files are allowed')
    }
    
    const totalFiles = knowledgeBase.length + pdfFiles.length
    if (totalFiles > MAX_FILES) {
      alert(`You can only upload a maximum of ${MAX_FILES} files`)
      return
    }
    
    onKnowledgeBaseChange([...knowledgeBase, ...pdfFiles])
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = knowledgeBase.filter((_, i) => i !== index)
    onKnowledgeBaseChange(updatedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Knowledge Base Documents
        </h3>
        <p className="text-gray-600">
          Upload up to 3 PDF documents that contain important information about your business, 
          products, or services. This helps us create more accurate and relevant content.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={knowledgeBase.length >= MAX_FILES}
          />
          
          {knowledgeBase.length < MAX_FILES ? (
            <div>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">
                Click to upload or drag and drop PDF files
              </p>
              <p className="text-sm text-gray-400">
                Maximum {MAX_FILES} files • PDF only
              </p>
              <Button
                onClick={openFileDialog}
                className="mt-4"
                variant="outline"
              >
                Choose Files
              </Button>
            </div>
          ) : (
            <div>
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-600">
                Maximum of {MAX_FILES} files reached
              </p>
            </div>
          )}
        </div>

        {knowledgeBase.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">
              Uploaded Files ({knowledgeBase.length}/{MAX_FILES})
            </h4>
            {knowledgeBase.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">{file.name}</p>
                    <p className="text-sm text-blue-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">What documents work best?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Business plans or executive summaries</li>
            <li>• Product catalogs or service descriptions</li>
            <li>• Company policies or procedures</li>
            <li>• Marketing materials or brochures</li>
            <li>• Technical documentation or manuals</li>
            <li>• Financial reports or projections</li>
          </ul>
        </div>

        {knowledgeBase.length === 0 && (
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Optional:</strong> You can skip this step if you don't have relevant documents ready. 
              You can always add them later to improve your generated content.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}