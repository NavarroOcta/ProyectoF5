const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_minimum_32_characters';

/**
 * Codifica un objeto JSON en formato Base64URL compatible con el Edge Runtime.
 */
export function base64UrlEncode(obj: object): string {
  const str = JSON.stringify(obj);
  const base64 = btoa(str);
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Genera un token JWT firmado criptográficamente mediante HMAC SHA-256
 * usando la API de Web Crypto.
 */
export async function generateJwt(payload: object): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const data = `${encodedHeader}.${encodedPayload}`;

  const keyData = encoder.encode(JWT_SECRET);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(data)
  );

  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureBase64 = btoa(String.fromCharCode.apply(null, signatureArray));
  const encodedSignature = signatureBase64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${encodedSignature}`;
}

/**
 * Verifica la firma criptográfica (HMAC SHA-256) de un JWT y decodifica su contenido.
 */
export async function verifyJwt(token: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const encoder = new TextEncoder();

    const keyData = encoder.encode(JWT_SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBase64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    const rawSignature = atob(signatureBase64);
    const signatureBuffer = new Uint8Array(rawSignature.length);
    for (let i = 0; i < rawSignature.length; i++) {
      signatureBuffer[i] = rawSignature.charCodeAt(i);
    }

    const dataBuffer = encoder.encode(`${header}.${payload}`);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signatureBuffer,
      dataBuffer
    );

    if (!isValid) return null;

    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(decodedPayload);

    if (data.exp && Date.now() >= data.exp * 1000) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}
