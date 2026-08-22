import type { IncomingMessage, ServerResponse } from 'http';
import {
  extractDocumentWithGemini,
  analyzeRootCauseWithGemini,
  generateWhatIfWithGemini,
} from './geminiService';

export async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', (err) => reject(err));
  });
}

export function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';

  if (url === '/api/health') {
    sendJson(res, 200, {
      status: 'ok',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      environment: process.env.NODE_ENV || 'development',
      service: 'DocFixyy AI Engine',
    });
    return true;
  }

  if (req.method === 'POST' && url === '/api/extract') {
    try {
      const body = await parseJsonBody(req);
      const { text, fileName, mimeType } = body;
      const result = await extractDocumentWithGemini(text || JSON.stringify(body), fileName, mimeType);
      sendJson(res, 200, result);
    } catch (err: any) {
      console.error('[API /api/extract] error:', err);
      sendJson(res, 500, { error: err.message || 'Extraction failed' });
    }
    return true;
  }

  if (req.method === 'POST' && url === '/api/root-cause') {
    try {
      const body = await parseJsonBody(req);
      const { diffsSummary, poData, grnData, invoiceData } = body;
      const result = await analyzeRootCauseWithGemini(diffsSummary, poData, grnData, invoiceData);
      sendJson(res, 200, result);
    } catch (err: any) {
      console.error('[API /api/root-cause] error:', err);
      sendJson(res, 500, { error: err.message || 'Root cause analysis failed' });
    }
    return true;
  }

  if (req.method === 'POST' && url === '/api/what-if') {
    try {
      const body = await parseJsonBody(req);
      const { exceptionType, rootCause, financialImpact, riskLevel, recommendation } = body;
      const result = await generateWhatIfWithGemini(
        exceptionType,
        rootCause,
        financialImpact || 295000,
        riskLevel || 'HIGH',
        recommendation || 'Hold invoice'
      );
      sendJson(res, 200, result);
    } catch (err: any) {
      console.error('[API /api/what-if] error:', err);
      sendJson(res, 500, { error: err.message || 'What-if analysis failed' });
    }
    return true;
  }

  return false;
}
