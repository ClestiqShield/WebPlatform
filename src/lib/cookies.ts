/**
 * Cookie management utilities
 */

export const COOKIE_NAME = 'clestiq_auth_token';

export function setCookie(name: string, value: string, days: number = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    // Don't use Secure flag in development (localhost uses HTTP)
    const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isProduction ? ';Secure' : '';

    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`;
    console.log('Cookie set:', { name, expires: expires.toUTCString(), hasSecure: isProduction });
}

export function getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
}

export function deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function getAuthToken(): string | null {
    return getCookie(COOKIE_NAME);
}

export function setAuthToken(token: string) {
    setCookie(COOKIE_NAME, token, 7); // 7 days expiry
}

export function clearAuthToken() {
    deleteCookie(COOKIE_NAME);
}
