import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Return a simple 32x32 favicon as a data URL
  const faviconSVG = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#2563eb"/>
    <text x="16" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">iD</text>
  </svg>`
  
  // Convert SVG to base64
  const base64 = Buffer.from(faviconSVG).toString('base64')
  const dataUrl = `data:image/svg+xml;base64,${base64}`
  
  // Fetch the SVG and return as ICO format (simplified)
  return new NextResponse(Buffer.from(faviconSVG), {
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}