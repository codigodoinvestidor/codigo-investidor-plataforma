import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/cadastro") ||
    request.nextUrl.pathname.startsWith("/auth/callback");

  if (!session && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const isAdmin = session?.user?.app_metadata?.role === "admin";

  if (session && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  // A conta admin é só para administração: sem acesso às telas financeiras pessoais.
  const rotasFinanceiras = ["/dashboard", "/patrimonio", "/proventos", "/lancamentos-ativos", "/rentabilidade", "/metas"];
  if (isAdmin && rotasFinanceiras.some((rota) => request.nextUrl.pathname.startsWith(rota))) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
