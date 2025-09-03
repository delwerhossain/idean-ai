'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Share2, ArrowLeft } from 'lucide-react'
import { DocumentData, generatePDF, formatContentForDisplay } from '@/lib/documentUtils'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function SharedDocumentPage() {
  const params = useParams()
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const shareId = params.id as string
    const storedDoc = localStorage.getItem(`shared_${shareId}`)
    
    if (storedDoc) {
      try {
        setDocument(JSON.parse(storedDoc))
      } catch (error) {
        console.error('Error parsing shared document:', error)
      }
    }
    
    setIsLoading(false)
  }, [params.id])

  const handleDownloadPDF = async () => {
    if (document) {
      await generatePDF(document)
    }
  }

  const handleShare = async () => {
    if (document) {
      const currentUrl = window.location.href
      try {
        await navigator.clipboard.writeText(currentUrl)
        alert('Share link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
        alert('Failed to copy link')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading shared document...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mt-20">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Document Not Found</h2>
              <p className="text-gray-600 mb-6">
                The shared document you&apos;re looking for doesn&apos;t exist or has expired.
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Badge variant="default" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Shared Document
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  {document.title}
                </CardTitle>
                {document.businessName && (
                  <p className="text-gray-600 mt-1">
                    {document.businessName}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Generated on {document.generatedDate}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button size="sm" onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg border p-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatContentForDisplay(document.content) 
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This document was generated by{' '}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              iDEAN AI
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}