import { useState } from 'react';
import { pdfToImages } from '../lib/pdfToImages';

export default function Home() {
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const paths = await pdfToImages(arrayBuffer);
    setImagePaths(paths);
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {imagePaths.map((path, index) => (
        <img key={index} src={path} alt={`Page ${index + 1}`} />
      ))}
    </div>
  );
}
