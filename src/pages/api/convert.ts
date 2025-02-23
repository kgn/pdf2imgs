import type { NextApiRequest, NextApiResponse } from 'next';
import * as pdfjsLib from 'pdfjs-dist';
import path from 'path';
const { createCanvas, registerFont } = require('canvas');

// Register a default font
registerFont(path.join(process.cwd(), 'fonts', 'Arial.ttf'), { family: 'Arial' });

// Basic pdf.js configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.js');
const NodeCanvasFactory = require('pdfjs-dist/build/pdf.js').NodeCanvasFactory;
(pdfjsLib as any).NodeCanvasFactory = NodeCanvasFactory;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust this limit based on your needs
    },
  },
};

type ResponseData = {
  error?: string;
  details?: string;
  images?: { page: number; data: string }[];
  // add other response types here
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Check for API key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let buffer: Buffer;
    const contentType = req.headers['content-type'];

    if (contentType === 'application/pdf') {
      // Handle raw PDF data
      buffer = req.body;
    } else if (contentType?.includes('application/json')) {
      // Handle JSON with base64
      const { pdf } = req.body;
      if (!pdf) {
        return res.status(400).json({ error: 'No PDF data provided' });
      }
      buffer = Buffer.from(pdf, 'base64');
    } else {
      return res.status(400).json({
        error: 'Invalid Content-Type',
        details: `Expected application/pdf or application/json, got ${contentType}`
      });
    }

    const uint8Array = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument(uint8Array).promise;
    const images = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 4.0 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      await page.render({ canvasContext: context, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');

      images.push({
        page: i,
        data: dataUrl
      });
    }

    return res.status(200).json({ images });

  } catch (error) {
    console.error('PDF processing error:', error);
    return res.status(500).json({
      error: 'Failed to process PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
