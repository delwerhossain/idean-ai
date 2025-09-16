'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, AlertCircle, HelpCircle } from 'lucide-react'

interface KnowledgeBaseStepProps {
  knowledgeBase: File[]
  onKnowledgeBaseChange: (value: File[]) => void
  language: 'en' | 'bn'
}

export default function KnowledgeBaseStep({ knowledgeBase, onKnowledgeBaseChange, language }: KnowledgeBaseStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const MAX_FILES = 4
  const MAX_PAGES_PER_FILE = 30

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const pdfFiles = files.filter(file => file.type === 'application/pdf')

    if (pdfFiles.length !== files.length) {
      alert(language === 'en' ? 'Only PDF files are allowed' : 'কেবল PDF ফাইল অনুমোদিত')
    }

    const totalFiles = knowledgeBase.length + pdfFiles.length
    if (totalFiles > MAX_FILES) {
      alert(language === 'en' ? `You can only upload a maximum of ${MAX_FILES} files` : `আপনি সর্বোচ্চ ${MAX_FILES}টি ফাইল আপলোড করতে পারেন`)
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
          {language === 'en' ? 'Upload Business Documents' : 'ব্যবসায়িক ডকুমেন্ট আপলোড করুন'}
        </h3>
        <div className="flex items-center justify-center gap-2">
          <p className="text-gray-500 text-sm">
            {language === 'en' ? 'Up to 4 PDF documents (max 30 pages each)' : 'সর্বোচ্চ ৪টি PDF ডকুমেন্ট (প্রতিটি ৩০ পাতা)'}
          </p>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-sm rounded-lg p-3 z-10">
                <div className="font-medium mb-2">
                  {language === 'en' ? 'What documents work best?' : 'কোন ডকুমেন্টগুলো সবচেয়ে ভালো কাজ করে?'}
                </div>
                <ul className="space-y-1 text-xs">
                  {language === 'en' ? (
                    <>
                      <li>• Business plans or executive summaries</li>
                      <li>• Product catalogs or service descriptions</li>
                      <li>• Company policies or procedures</li>
                      <li>• Marketing materials or brochures</li>
                      <li>• Technical documentation or manuals</li>
                      <li>• Financial reports or projections</li>
                    </>
                  ) : (
                    <>
                      <li>• ব্যবসায়িক পরিকল্পনা বা কার্যনির্বাহী সারাংশ</li>
                      <li>• পণ্যের ক্যাটালগ বা সেবার বর্ণনা</li>
                      <li>• কোম্পানির নীতি বা প্রক্রিয়া</li>
                      <li>• মার্কেটিং ম্যাটেরিয়াল বা ব্রোশার</li>
                      <li>• প্রযুক্তিগত ডকুমেন্টেশন বা ম্যানুয়াল</li>
                      <li>• আর্থিক রিপোর্ট বা প্রক্ষেপণ</li>
                    </>
                  )}
                </ul>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
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
                {language === 'en' ? 'Click to upload or drag and drop PDF files' : 'PDF ফাইল আপলোড করতে ক্লিক করুন বা ড্র্যাগ করুন'}
              </p>
              <p className="text-sm text-gray-400">
                {language === 'en' ? `Maximum ${MAX_FILES} files • PDF only • Max ${MAX_PAGES_PER_FILE} pages each` : `সর্বোচ্চ ${MAX_FILES}টি ফাইল • কেবল PDF • প্রতিটি সর্বোচ্চ ${MAX_PAGES_PER_FILE} পাতা`}
              </p>
              <Button
                onClick={openFileDialog}
                className="mt-4"
                variant="outline"
              >
                {language === 'en' ? 'Choose Files' : 'ফাইল বাছাই করুন'}
              </Button>
            </div>
          ) : (
            <div>
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-600">
                {language === 'en' ? `Maximum of ${MAX_FILES} files reached` : `সর্বোচ্চ ${MAX_FILES}টি ফাইল পৌঁছে গেছে`}
              </p>
            </div>
          )}
        </div>

        {knowledgeBase.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">
              {language === 'en' ? `Uploaded Files (${knowledgeBase.length}/${MAX_FILES})` : `আপলোড করা ফাইল (${knowledgeBase.length}/${MAX_FILES})`}
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

        {knowledgeBase.length === 0 && (
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              {language === 'en' ? (
                <><strong>Optional:</strong> You can skip this step if you don&apos;t have relevant documents ready. You can always add them later to improve your generated content.</>
              ) : (
                <><strong>ঐচ্ছিক:</strong> যদি আপনার কাছে প্রাসঙ্গিক ডকুমেন্ট প্রস্তুত না থাকে তাহলে এই ধাপটি এড়িয়ে যেতে পারেন। আপনার তৈরি করা কন্টেন্ট উন্নত করতে পরে সেগুলো যোগ করতে পারেন।</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}