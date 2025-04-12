import type { NextApiRequest, NextApiResponse } from 'next';
import * as pdfjsLib from 'pdfjs-dist';
import path from 'path';
const { createCanvas } = require('canvas');

// Configure pdf.js worker
// This is required for pdf.js to work in Node.js environment
pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

// Set up canvas factory for Node environment
// pdf.js needs this to render PDFs without a browser
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

type RequestData = {
  url?: string;
  pdf?: string; // Keeping for backward compatibility
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
    // Handle URL, JSON with base64, and raw PDF input
    let uint8Array: Uint8Array;
    const requestData = req.body as RequestData;

    if (req.headers['content-type'] === 'application/pdf') {
      // Handle raw PDF input
      const chunks: Uint8Array[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      uint8Array = Buffer.concat(chunks);
    } else if (requestData.url) {
      // Handle URL input - fetch the PDF from the provided URL
      try {
        const response = await fetch(requestData.url);
        if (!response.ok) {
          return res.status(400).json({ 
            error: 'Failed to fetch PDF from URL',
            details: `HTTP status ${response.status}: ${response.statusText}`
          });
        }
        
        const arrayBuffer = await response.arrayBuffer();
        uint8Array = new Uint8Array(arrayBuffer);
      } catch (fetchError) {
        return res.status(400).json({ 
          error: 'Failed to fetch PDF from URL',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        });
      }
    } else if (requestData.pdf) {
      // Handle JSON with base64 input (for backward compatibility)
      const buffer = Buffer.from(requestData.pdf, 'base64');
      uint8Array = new Uint8Array(buffer);
    } else {
      return res.status(400).json({ error: 'No PDF URL or data provided' });
    }

    // Point to standard fonts directory in project root
    // These fonts are required for proper text rendering in PDFs
    // We keep them in the repo to ensure they're available in production
    const doc = await pdfjsLib.getDocument({
      data: uint8Array,
      standardFontDataUrl: path.join(process.cwd(), 'standard_fonts/')
    }).promise;

    const images = [];

    // Convert each page to an image
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      images.push({
        page: i,
        data: imageData
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
