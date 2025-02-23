import type { NextApiRequest, NextApiResponse } from 'next';
import * as pdfjsLib from 'pdfjs-dist';
const { createCanvas } = require('canvas');

// Configure pdf.js to use the Node canvas and fake worker
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
    const { pdf } = req.body;
    if (!pdf) {
      return res.status(400).json({ error: 'No PDF data provided' });
    }

    // Convert base64 to Buffer
    const base64Data = pdf.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');

    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument(uint8Array).promise;
    console.log('PDF loaded successfully, pages:', doc.numPages);
    const images = [];

    // Convert each page to an image
    for (let i = 1; i <= doc.numPages; i++) {
      console.log(`Processing page ${i}`);
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      // Create canvas using node-canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      await page.render({ canvasContext: context, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');

      images.push({
        page: i,
        data: dataUrl
      });
      console.log(`Page ${i} converted successfully`);
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
