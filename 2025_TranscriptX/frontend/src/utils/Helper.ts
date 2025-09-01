export function decodeJWT(token: string): {
    header: Record<string, any>;
    payload: Record<string, any>;
    signature: string;
} {
    const [header, payload, signature] = token.split('.');

    function base64UrlDecode(str: string): any {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }

    return {
        header: base64UrlDecode(header),
        payload: base64UrlDecode(payload),
        signature,
    };
}

export function getUserIdFromToken(token: string): string | null {
    try {
        const decoded = decodeJWT(token);
        return decoded.payload.sub || null;
    } catch {
        return null;
    }
}
