import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Handle CORS
  const origin = request.headers.get('origin') || '*'
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204 })
  }

  // API key protection for specific endpoints
  const protectedEndpoints = [
    '/api/vehicles/create',
    '/api/inquiry',
    '/api/locations/create'
  ]

  const isProtectedEndpoint = protectedEndpoints.some(endpoint => 
    request.nextUrl.pathname.startsWith(endpoint)
  )

  if (isProtectedEndpoint && (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')) {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
} 