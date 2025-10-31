
import { useCallback } from 'react';
import { HMAC_SECRET_KEY } from '../constants';

const encoder = new TextEncoder();

const getCryptoKey = async (secret: string): Promise<CryptoKey> => {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
};

export const useWebCrypto = () => {
  const signData = useCallback(async (data: string): Promise<string> => {
    const key = await getCryptoKey(HMAC_SECRET_KEY);
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(data)
    );
    // Convert ArrayBuffer to Base64 string
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    return signature;
  }, []);

  return { signData };
};
