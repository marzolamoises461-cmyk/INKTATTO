import { createHash, createHmac, randomUUID } from 'node:crypto';
import {
  BadRequestException, Injectable, Logger, ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ReferenceImageUpload {
  objectKey: string;
  storageUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

@Injectable()
export class ReferenceImageStorageService {
  private readonly logger = new Logger(ReferenceImageStorageService.name);

  constructor(private readonly config: ConfigService) {}

  async upload(file: Express.Multer.File): Promise<ReferenceImageUpload> {
    const mimeType = detectImageMimeType(file.buffer);
    const settings = this.readSettings();
    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
    const objectKey = `booking-references/${randomUUID()}.${extension}`;
    const url = this.objectUrl(settings.endpoint, settings.bucket, objectKey);

    await this.request('PUT', url, file.buffer, mimeType, settings);
    return {
      objectKey,
      storageUrl: url.toString(),
      originalName: sanitizeFilename(file.originalname),
      mimeType,
      sizeBytes: file.size,
    };
  }

  async download(objectKey: string): Promise<Buffer> {
    const settings = this.readSettings();
    if (!objectKey.startsWith('booking-references/') || objectKey.includes('..')) {
      throw new ServiceUnavailableException('La referencia de imagen almacenada no es válida');
    }
    const response = await this.request(
      'GET',
      this.objectUrl(settings.endpoint, settings.bucket, objectKey),
      Buffer.alloc(0),
      undefined,
      settings,
    );
    return Buffer.from(await response.arrayBuffer());
  }

  async remove(objectKey: string): Promise<void> {
    const settings = this.readSettings();
    const response = await this.request(
      'DELETE',
      this.objectUrl(settings.endpoint, settings.bucket, objectKey),
      Buffer.alloc(0),
      undefined,
      settings,
    );
    if (!response.ok && response.status !== 404) {
      throw new ServiceUnavailableException('No se pudo eliminar una imagen de referencia del almacenamiento');
    }
  }

  private readSettings() {
    const endpointValue = this.config.get<string>('OBJECT_STORAGE_ENDPOINT');
    const bucket = this.config.get<string>('OBJECT_STORAGE_BUCKET');
    const region = this.config.get<string>('OBJECT_STORAGE_REGION');
    const accessKey = this.config.get<string>('OBJECT_STORAGE_ACCESS_KEY');
    const secretKey = this.config.get<string>('OBJECT_STORAGE_SECRET_KEY');
    if (!endpointValue || !bucket || !region || !accessKey || !secretKey) {
      throw new ServiceUnavailableException(
        'El almacenamiento privado de imágenes no está configurado. Define las variables OBJECT_STORAGE_*.',
      );
    }
    let endpoint: URL;
    try {
      endpoint = new URL(endpointValue);
    } catch {
      throw new ServiceUnavailableException('OBJECT_STORAGE_ENDPOINT debe ser una URL válida');
    }
    if (endpoint.search || endpoint.hash) {
      throw new ServiceUnavailableException('OBJECT_STORAGE_ENDPOINT no puede incluir query ni fragmento');
    }
    if (endpoint.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('El almacenamiento de producción debe usar HTTPS');
    }
    return { endpoint, bucket, region, accessKey, secretKey };
  }

  private objectUrl(endpoint: URL, bucket: string, key: string): URL {
    const basePath = endpoint.pathname.replace(/\/+$/, '');
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    const url = new URL(endpoint.toString());
    url.pathname = `${basePath}/${encodeURIComponent(bucket)}/${encodedKey}`;
    return url;
  }

  private async request(
    method: 'PUT' | 'GET' | 'DELETE',
    url: URL,
    body: Buffer,
    contentType: string | undefined,
    settings: ReturnType<ReferenceImageStorageService['readSettings']>,
  ): Promise<Response> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const shortDate = amzDate.slice(0, 8);
    const payloadHash = createHash('sha256').update(body).digest('hex');
    const headers: Record<string, string> = {
      host: url.host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    };
    if (contentType) headers['content-type'] = contentType;
    const signedHeaders = Object.keys(headers).sort().join(';');
    const canonicalHeaders = Object.keys(headers).sort()
      .map((name) => `${name}:${headers[name].trim()}\n`).join('');
    const canonicalRequest = [
      method,
      url.pathname,
      url.searchParams.toString(),
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');
    const scope = `${shortDate}/${settings.region}/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256', amzDate, scope,
      createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');
    const dateKey = hmac(`AWS4${settings.secretKey}`, shortDate);
    const regionKey = hmac(dateKey, settings.region);
    const serviceKey = hmac(regionKey, 's3');
    const signingKey = hmac(serviceKey, 'aws4_request');
    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    const authorization = `AWS4-HMAC-SHA256 Credential=${settings.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    const requestHeaders = { ...headers };
    delete requestHeaders.host;

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: { ...requestHeaders, Authorization: authorization },
        body: method === 'PUT' ? new Uint8Array(body).buffer as ArrayBuffer : undefined,
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      this.logger.error(`Object storage request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      throw new ServiceUnavailableException('No fue posible conectar con el almacenamiento de imágenes');
    }
    if (!response.ok) {
      this.logger.error(`Object storage returned HTTP ${response.status}`);
      throw new ServiceUnavailableException('El almacenamiento de imágenes rechazó la operación');
    }
    return response;
  }
}

function hmac(key: string | Buffer, value: string): Buffer {
  return createHmac('sha256', key).update(value).digest();
}

export function detectImageMimeType(buffer: Buffer): string {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return 'image/png';
  }
  if (
    buffer.length >= 12
    && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  throw new BadRequestException('Solo se admiten imágenes JPG, PNG y WEBP');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]/g, '_').slice(0, 255) || 'reference-image';
}
