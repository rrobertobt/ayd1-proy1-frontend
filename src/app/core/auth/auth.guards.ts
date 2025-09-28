import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

function normalizeFirstSegment(path: string): string {
  return path
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter((segment) => segment.length > 0)[0] ?? '';
}

function getHomeSegment(auth: AuthService, role?: string | null): string {
  const home = auth.getHomeRouteForRole(role);
  return normalizeFirstSegment(home);
}

function ensureAuthenticated(auth: AuthService, router: Router): true | UrlTree {
  const user = auth.getUserInfo();
  if (user) {
    return true;
  }
  return router.parseUrl('/login');
}

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUserInfo();

  if (!user) return true;

  const redirectUrl = auth.getHomeRouteForRole(user.role);
  return router.parseUrl(redirectUrl);
};

export const roleCanMatchGuard: CanMatchFn = (
  _route,
  segments: UrlSegment[]
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const authResult = ensureAuthenticated(auth, router);
  if (authResult !== true) {
    return authResult;
  }

  const user = auth.getUserInfo();
  const targetSegment = segments[0]?.path ?? '';
  const homeSegment = getHomeSegment(auth, user?.role);

  if (homeSegment && targetSegment && targetSegment !== homeSegment) {
    const redirectUrl = auth.getHomeRouteForRole(user?.role);
    return router.parseUrl(redirectUrl);
  }

  return true;
};

export const roleCanActivateGuard: CanActivateFn = (
  _route,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const authResult = ensureAuthenticated(auth, router);
  if (authResult !== true) {
    return authResult;
  }

  const user = auth.getUserInfo();
  const targetSegment = normalizeFirstSegment(state.url);
  const homeSegment = getHomeSegment(auth, user?.role);

  if (homeSegment && targetSegment && targetSegment !== homeSegment) {
    const redirectUrl = auth.getHomeRouteForRole(user?.role);
    return router.parseUrl(redirectUrl);
  }

  return true;
};
