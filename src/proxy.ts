import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

function isRedirect(response: NextResponse) {
  return response.status >= 300 && response.status < 400;
}

export function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // next-intl is still normalizing the locale prefix (e.g. adding it to the
  // URL) — defer any auth redirect until that settles on a following request.
  if (isRedirect(intlResponse)) {
    return intlResponse;
  }

  const segments = request.nextUrl.pathname.split('/');
  const locale = segments[1];
  const path = '/' + segments.slice(2).join('/');

  const hasSession = Boolean(
    request.cookies.get('admin_access_token')?.value ||
      request.cookies.get('admin_refresh_token')?.value
  );

  if (path.startsWith('/admin') && !hasSession) {
    const response = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    intlResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  }

  if (path === '/login' && hasSession) {
    const response = NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    intlResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  }

  return intlResponse;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
