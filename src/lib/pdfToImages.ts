import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

export async function pdfToImages(pdfData: ArrayBuffer): Promise<string[]> {
  const doc = await pdfjsLib.getDocument(new Uint8Array(pdfData)).promise;
  const imagePaths = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');

    await page.render({ canvasContext: context, viewport }).promise;
    imagePaths.push(canvas.toDataURL('image/png'));
  }

  return imagePaths;
}
