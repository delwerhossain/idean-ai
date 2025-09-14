'use client'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { DocumentState, ExportOptions } from '@/types/document'

// Enhanced HTML to Markdown converter
export function htmlToMarkdown(html: string): string {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  let markdown = ''

  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      markdown += node.textContent || ''
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const element = node as Element
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case 'h1':
        markdown += '# '
        element.childNodes.forEach(processNode)
        markdown += '\n\n'
        break
      case 'h2':
        markdown += '## '
        element.childNodes.forEach(processNode)
        markdown += '\n\n'
        break
      case 'h3':
        markdown += '### '
        element.childNodes.forEach(processNode)
        markdown += '\n\n'
        break
      case 'h4':
        markdown += '#### '
        element.childNodes.forEach(processNode)
        markdown += '\n\n'
        break
      case 'h5':
        markdown += '##### '
        element.childNodes.forEach(processNode)
        markdown += '\n\n'
        break
      case 'h6':
        markdown += '###### '
        element.childNodes.forEach(processNode)
        markdown += '\n\n'
        break
      case 'p':
        element.childNodes.forEach(processNode)
        markdown += '\n\n'
        break
      case 'strong':
      case 'b':
        markdown += '**'
        element.childNodes.forEach(processNode)
        markdown += '**'
        break
      case 'em':
      case 'i':
        markdown += '*'
        element.childNodes.forEach(processNode)
        markdown += '*'
        break
      case 'br':
        markdown += '\n'
        break
      case 'hr':
        markdown += '\n---\n\n'
        break
      case 'ul':
        element.childNodes.forEach(processNode)
        markdown += '\n'
        break
      case 'ol':
        element.childNodes.forEach(processNode)
        markdown += '\n'
        break
      case 'li':
        const parent = element.parentElement
        if (parent?.tagName.toLowerCase() === 'ol') {
          markdown += '1. '
        } else {
          markdown += '- '
        }
        element.childNodes.forEach(processNode)
        markdown += '\n'
        break
      case 'blockquote':
        markdown += '> '
        element.childNodes.forEach(processNode)
        markdown += '\n\n'
        break
      case 'code':
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          markdown += '```\n'
          element.childNodes.forEach(processNode)
          markdown += '\n```\n\n'
        } else {
          markdown += '`'
          element.childNodes.forEach(processNode)
          markdown += '`'
        }
        break
      case 'table':
        processTable(element)
        break
      default:
        element.childNodes.forEach(processNode)
        break
    }
  }

  function processTable(table: Element): void {
    const rows = table.querySelectorAll('tr')
    let isFirstRow = true

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td, th')
      markdown += '| '
      
      cells.forEach((cell) => {
        const cellText = cell.textContent?.trim() || ''
        markdown += cellText + ' | '
      })
      
      markdown += '\n'
      
      if (isFirstRow && cells.length > 0) {
        markdown += '| '
        for (let i = 0; i < cells.length; i++) {
          markdown += '--- | '
        }
        markdown += '\n'
        isFirstRow = false
      }
    })
    
    markdown += '\n'
  }

  tempDiv.childNodes.forEach(processNode)
  
  return markdown
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Copy formatted content to clipboard
export async function copyDocumentToClipboard(document: DocumentState): Promise<void> {
  const content = document.editedContent || document.content

  try {
    // Try to use the modern Clipboard API with HTML support
    if (navigator.clipboard && window.ClipboardItem) {
      // Create HTML content for rich paste
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
              }
              h1, h2, h3, h4, h5, h6 { color: #2d3748; margin-top: 1.5em; margin-bottom: 0.5em; }
              h1 { font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
              h2 { font-size: 1.5em; }
              h3 { font-size: 1.17em; }
              p { margin-bottom: 1em; }
              ul, ol { margin-bottom: 1em; }
              li { margin-bottom: 0.5em; }
              blockquote { 
                border-left: 4px solid #e2e8f0; 
                margin: 1em 0; 
                padding-left: 1em; 
                color: #4a5568; 
                font-style: italic; 
              }
              code { 
                background-color: #f7fafc; 
                color: #e53e3e; 
                padding: 0.2em 0.4em; 
                border-radius: 3px; 
                font-size: 0.9em; 
              }
              pre { 
                background-color: #2d3748; 
                color: #68d391; 
                padding: 1em; 
                border-radius: 0.375rem; 
                overflow-x: auto; 
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 1em 0; 
              }
              th, td { 
                border: 1px solid #e2e8f0; 
                padding: 0.5em; 
                text-align: left; 
              }
              th { background-color: #f7fafc; font-weight: 600; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `

      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([htmlToMarkdown(content)], { type: 'text/plain' })
      })

      await navigator.clipboard.write([clipboardItem])
    } else {
      // Fallback to plain text
      await navigator.clipboard.writeText(htmlToMarkdown(content))
    }
  } catch (error) {
    // Final fallback using textarea method
    const textArea = document.createElement('textarea')
    textArea.value = htmlToMarkdown(content)
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Export individual document as Markdown
export async function exportDocumentAsMarkdown(document: DocumentState): Promise<void> {
  const content = document.editedContent || document.content
  const markdown = htmlToMarkdown(content)
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const filename = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
  
  saveAs(blob, filename)
}

// Export individual document as PDF
export async function exportDocumentAsPDF(document: DocumentState): Promise<void> {
  const content = document.editedContent || document.content
  
  // Create temporary element for PDF generation
  const element = document.createElement('div')
  element.innerHTML = content
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.top = '-9999px'
  element.style.width = '794px' // A4 width
  element.style.padding = '40px'
  element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  element.style.fontSize = '14px'
  element.style.lineHeight = '1.6'
  element.style.color = '#333333'
  element.style.backgroundColor = 'white'
  
  document.body.appendChild(element)

  try {
    const canvas = await html2canvas(element, {
      quality: 1.0,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margins = { top: 20, right: 20, bottom: 20, left: 20 }
    
    const imgWidth = pageWidth - margins.left - margins.right
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = margins.top

    pdf.addImage(imgData, 'PNG', margins.left, position, imgWidth, imgHeight)
    heightLeft -= (pageHeight - margins.top - margins.bottom)

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + margins.top
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', margins.left, position, imgWidth, imgHeight)
      heightLeft -= (pageHeight - margins.top - margins.bottom)
    }

    const filename = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
    pdf.save(filename)
  } finally {
    document.body.removeChild(element)
  }
}

// Export multiple documents as ZIP
export async function exportDocumentsAsZip(
  documents: DocumentState[], 
  options: ExportOptions
): Promise<void> {
  const zip = new JSZip()
  const { format, includeMetadata, filename } = options

  for (const doc of documents) {
    const content = doc.editedContent || doc.content
    const docFilename = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    
    if (format === 'markdown') {
      const markdown = htmlToMarkdown(content)
      zip.file(`${docFilename}.md`, markdown)
    } else if (format === 'html') {
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${doc.title}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px; 
        }
        h1, h2, h3, h4, h5, h6 { color: #2d3748; margin-top: 1.5em; margin-bottom: 0.5em; }
        h1 { font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
        pre { background-color: #2d3748; color: #68d391; padding: 1em; border-radius: 0.375rem; overflow-x: auto; }
        code { background-color: #f7fafc; color: #e53e3e; padding: 0.2em 0.4em; border-radius: 3px; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #e2e8f0; padding: 0.5em; text-align: left; }
        th { background-color: #f7fafc; font-weight: 600; }
        blockquote { border-left: 4px solid #e2e8f0; margin: 1em 0; padding-left: 1em; color: #4a5568; font-style: italic; }
    </style>
</head>
<body>
    <h1>${doc.title}</h1>
    ${content}
    ${includeMetadata ? `
    <hr>
    <div style="margin-top: 2em; padding: 1em; background-color: #f7fafc; border-radius: 0.375rem; font-size: 0.875em; color: #4a5568;">
        <strong>Document Information:</strong><br>
        Word Count: ${doc.wordCount}<br>
        Character Count: ${doc.characterCount}<br>
        Last Modified: ${doc.lastModified.toLocaleString()}<br>
        Status: ${doc.status || 'draft'}
    </div>
    ` : ''}
</body>
</html>`
      zip.file(`${docFilename}.html`, html)
    } else if (format === 'txt') {
      // Convert to plain text
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const plainText = tempDiv.textContent || tempDiv.innerText || ''
      zip.file(`${docFilename}.txt`, plainText)
    }
  }

  // Add metadata file if requested
  if (includeMetadata) {
    const metadata = {
      exportDate: new Date().toISOString(),
      documentCount: documents.length,
      totalWords: documents.reduce((sum, doc) => sum + doc.wordCount, 0),
      totalCharacters: documents.reduce((sum, doc) => sum + doc.characterCount, 0),
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        wordCount: doc.wordCount,
        characterCount: doc.characterCount,
        lastModified: doc.lastModified.toISOString(),
        status: doc.status
      }))
    }
    zip.file('metadata.json', JSON.stringify(metadata, null, 2))
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const zipFilename = filename || `documents_${new Date().toISOString().split('T')[0]}.zip`
  
  saveAs(blob, zipFilename)
}

// Export combined document
export async function exportCombinedDocument(
  documents: DocumentState[], 
  options: ExportOptions
): Promise<void> {
  const { format, includeMetadata, filename } = options
  
  let combinedContent = ''
  let combinedTitle = 'Combined Documents'
  
  documents.forEach((doc, index) => {
    const content = doc.editedContent || doc.content
    
    if (index > 0) {
      combinedContent += format === 'markdown' ? '\n\n---\n\n' : '<hr>\n\n'
    }
    
    combinedContent += format === 'markdown' 
      ? `# ${doc.title}\n\n${htmlToMarkdown(content)}`
      : `<h1>${doc.title}</h1>\n${content}`
  })
  
  const baseFilename = filename || `${combinedTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
  
  if (format === 'markdown') {
    const blob = new Blob([combinedContent], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, `${baseFilename}.md`)
  } else if (format === 'html') {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${combinedTitle}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px; 
        }
        h1, h2, h3, h4, h5, h6 { color: #2d3748; margin-top: 1.5em; margin-bottom: 0.5em; }
        hr { margin: 3em 0; border: 0; height: 1px; background-color: #e2e8f0; }
        pre { background-color: #2d3748; color: #68d391; padding: 1em; border-radius: 0.375rem; overflow-x: auto; }
        code { background-color: #f7fafc; color: #e53e3e; padding: 0.2em 0.4em; border-radius: 3px; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #e2e8f0; padding: 0.5em; text-align: left; }
        th { background-color: #f7fafc; font-weight: 600; }
        blockquote { border-left: 4px solid #e2e8f0; margin: 1em 0; padding-left: 1em; color: #4a5568; font-style: italic; }
    </style>
</head>
<body>
    ${combinedContent}
    ${includeMetadata ? `
    <hr>
    <div style="margin-top: 2em; padding: 1em; background-color: #f7fafc; border-radius: 0.375rem; font-size: 0.875em; color: #4a5568;">
        <strong>Export Information:</strong><br>
        Documents Combined: ${documents.length}<br>
        Total Words: ${documents.reduce((sum, doc) => sum + doc.wordCount, 0)}<br>
        Total Characters: ${documents.reduce((sum, doc) => sum + doc.characterCount, 0)}<br>
        Export Date: ${new Date().toLocaleString()}
    </div>
    ` : ''}
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    saveAs(blob, `${baseFilename}.html`)
  } else if (format === 'pdf') {
    // Create temporary element for combined PDF
    const element = document.createElement('div')
    element.innerHTML = combinedContent
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.top = '-9999px'
    element.style.width = '794px'
    element.style.padding = '40px'
    element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    element.style.fontSize = '14px'
    element.style.lineHeight = '1.6'
    element.style.color = '#333333'
    element.style.backgroundColor = 'white'
    
    document.body.appendChild(element)

    try {
      const canvas = await html2canvas(element, {
        quality: 1.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margins = { top: 20, right: 20, bottom: 20, left: 20 }
      
      const imgWidth = pageWidth - margins.left - margins.right
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = margins.top

      pdf.addImage(imgData, 'PNG', margins.left, position, imgWidth, imgHeight)
      heightLeft -= (pageHeight - margins.top - margins.bottom)

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margins.top
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', margins.left, position, imgWidth, imgHeight)
        heightLeft -= (pageHeight - margins.top - margins.bottom)
      }

      pdf.save(`${baseFilename}.pdf`)
    } finally {
      document.body.removeChild(element)
    }
  }
}