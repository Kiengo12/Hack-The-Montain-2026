import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

import type {
  AnalysisResponse,
  CorrectParams,
  ImageResponse,
  SimulateParams,
  UploadResponse,
} from '../types';

const API_PORT = '8000';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function getDevServerHost(): string | null {
  const sourceCode = NativeModules.SourceCode as { scriptURL?: string } | undefined;
  const scriptURL = sourceCode?.scriptURL;
  if (!scriptURL) return null;

  try {
    return new URL(scriptURL).hostname;
  } catch {
    const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
    return match?.[1] ?? null;
  }
}

function isLocalhostUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return value.includes('localhost') || value.includes('127.0.0.1');
  }
}

function resolveBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl && !isLocalhostUrl(configuredUrl)) {
    return trimTrailingSlash(configuredUrl);
  }

  const devServerHost = getDevServerHost();
  if (
    devServerHost &&
    devServerHost !== 'localhost' &&
    devServerHost !== '127.0.0.1'
  ) {
    return `http://${devServerHost}:${API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return trimTrailingSlash(configuredUrl ?? `http://localhost:${API_PORT}`);
}

const BASE_URL = resolveBaseUrl();

const client = axios.create({ baseURL: BASE_URL, timeout: 30_000 });

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === 'string') return body.detail;
    if (typeof body?.message === 'string') return body.message;
  } catch {
    // Fall back to the status text below when the response is not JSON.
  }

  return response.statusText || `Request failed with status ${response.status}`;
}

async function upload(imageUri: string): Promise<UploadResponse> {
  const form = new FormData();
  const filename = imageUri.split('/').pop() ?? 'image.jpg';
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeType =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  form.append('file', {
    uri: imageUri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return response.json() as Promise<UploadResponse>;
}

async function simulate(params: SimulateParams): Promise<ImageResponse> {
  const { data } = await client.post<ImageResponse>('/simulate', params);
  return data;
}

async function correct(params: CorrectParams): Promise<ImageResponse> {
  const { data } = await client.post<ImageResponse>('/correct', params);
  return data;
}

async function analyze(imageId: string): Promise<AnalysisResponse> {
  const { data } = await client.post<AnalysisResponse>('/analyze', {
    image_id: imageId,
  });
  return data;
}

export const api = { upload, simulate, correct, analyze };
