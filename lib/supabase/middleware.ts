import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

function getSupabaseCredentials() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not defined")
  }

  if (!supabaseKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) is not defined")
  }

  return { supabaseUrl, supabaseKey }
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const { supabaseUrl, supabaseKey } = getSupabaseCredentials()
  const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "")
      const {
        data: { user },
      } = await supabase.auth.getUser(token)

      if (
        request.nextUrl.pathname !== "/" &&
        !user &&
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/auth")
      ) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
  }

  return supabaseResponse
}
