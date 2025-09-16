'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface ExportOptions {
  filename?: string
  quality?: number
  format?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// Convert HTML to Markdown
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
          // Block code
          markdown += '```\n'
          element.childNodes.forEach(processNode)
          markdown += '\n```\n\n'
        } else {
          // Inline code
          markdown += '`'
          element.childNodes.forEach(processNode)
          markdown += '`'
        }
        break
      case 'table':
        processTable(element)
        break
      default:
        // For other elements, just process children
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
      
      // Add separator after first row (header)
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
  
  // Clean up extra whitespace
  return markdown
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Convert Markdown to HTML (basic conversion)
export function markdownToHtml(markdown: string): string {
  const html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    
    // Line breaks and paragraphs
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>')

  return `<p>${html}</p>`.replace(/<p><\/p>/g, '')
}

// Export content as Markdown file
export async function exportAsMarkdown(
  content: string,
  filename: string = 'document.md'
): Promise<void> {
  // Ensure filename has .md extension
  if (!filename.endsWith('.md')) {
    filename += '.md'
  }

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Export content as PDF
export async function exportAsPDF(
  elementOrHtml: HTMLElement | string,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'document.pdf',
    quality = 1.0,
    format = 'a4',
    orientation = 'portrait',
    margins = { top: 20, right: 20, bottom: 20, left: 20 }
  } = options

  try {
    let element: HTMLElement

    if (typeof elementOrHtml === 'string') {
      // Create temporary element for HTML string
      element = document.createElement('div')
      element.innerHTML = elementOrHtml
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.top = '-9999px'
      element.style.width = '794px' // A4 width in pixels (210mm * 96dpi / 25.4)
      element.style.padding = '20px'
      element.style.fontFamily = 'Arial, sans-serif'
      element.style.fontSize = '14px'
      element.style.lineHeight = '1.6'
      element.style.color = '#333333'
      element.style.backgroundColor = 'white'
      document.body.appendChild(element)
    } else {
      element = elementOrHtml
    }

    // Generate canvas from element
    const canvas = await html2canvas(element, {
      quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2 // Higher resolution
    })

    // Clean up temporary element
    if (typeof elementOrHtml === 'string' && element.parentNode) {
      element.parentNode.removeChild(element)
    }

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    })

    // Calculate dimensions
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    const imgWidth = pageWidth - margins.left - margins.right
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = margins.top

    // Add first page
    pdf.addImage(
      imgData,
      'PNG',
      margins.left,
      position,
      imgWidth,
      imgHeight
    )
    
    heightLeft -= (pageHeight - margins.top - margins.bottom)

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + margins.top
      pdf.addPage()
      pdf.addImage(
        imgData,
        'PNG',
        margins.left,
        position,
        imgWidth,
        imgHeight
      )
      heightLeft -= (pageHeight - margins.top - margins.bottom)
    }

    // Download PDF
    pdf.save(filename)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

// Generate PDF-optimized HTML
export function generatePrintableHTML(
  content: string,
  title: string = 'Document',
  framework?: { name: string; description?: string }
): string {
  const date = new Date().toLocaleDateString()
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
        }
        
        .header {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
        }
        
        .header .meta {
            font-size: 14px;
            color: #6b7280;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .content {
            font-size: 16px;
            line-height: 1.7;
        }
        
        .content h1 { font-size: 24px; margin: 30px 0 15px 0; }
        .content h2 { font-size: 20px; margin: 25px 0 12px 0; }
        .content h3 { font-size: 18px; margin: 20px 0 10px 0; }
        .content h4 { font-size: 16px; margin: 15px 0 8px 0; }
        
        .content p {
            margin: 0 0 16px 0;
        }
        
        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .content th,
        .content td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
        }
        
        .content th {
            background-color: #f9fafb;
            font-weight: 600;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .header {
                page-break-after: avoid;
            }
            
            h1, h2, h3, h4 {
                page-break-after: avoid;
            }
            
            table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="meta">
            ${framework ? `<span>Framework: ${framework.name}</span>` : '<span>Generated Content</span>'}
            <span>${date}</span>
        </div>
    </div>
    
    <div class="content">
        ${content}
    </div>
    
    <div class="footer">
        Generated by Idean AI Platform • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
    </div>
</body>
</html>`
}