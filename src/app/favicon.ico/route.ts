import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  // Read the logo icon from public directory
  const iconPath = path.join(process.cwd(), 'public', 'ideanai_logo_icon.png')
  const iconBuffer = fs.readFileSync(iconPath)

  return new NextResponse(iconBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}