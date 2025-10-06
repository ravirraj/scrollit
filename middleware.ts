import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        return NextResponse.next()
    }
    , { callbacks: {
        authorized: ({ req ,token }) => {
            const { pathname } = req.nextUrl
            if(pathname.startsWith('/api/auth') || pathname.startsWith('/login') || pathname.startsWith('/register')) {
                return true
            }
            if(pathname.startsWith('/') || pathname.startsWith('/api/videos')) {
                return true;
            }
            return !!token
        }
    } }
)


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}