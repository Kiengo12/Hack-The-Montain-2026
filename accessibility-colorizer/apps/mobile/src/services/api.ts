import axios from 'axios';

import type {
  AnalysisResponse,
  CorrectParams,
  ImageResponse,
  SimulateParams,
  UploadResponse,
} from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

const client = axios.create({ baseURL: BASE_URL, timeout: 30_000 });

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

  const { data } = await client.post<UploadResponse>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
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
