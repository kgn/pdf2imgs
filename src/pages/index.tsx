import { useState } from 'react';

interface ImageData {
  page: number;
  data: string;
}

export default function Home() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          const buffer = Buffer.from(reader.result as ArrayBuffer);
          resolve(buffer.toString('base64'));
        };
        reader.onerror = reject;
      });

      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ pdf: base64 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to convert PDF');
      }

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border p-2 mr-2"
        />
      </div>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={loading}
      />

      {loading && <p>Converting PDF...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {response && (
        <>
          <pre className="mt-4 p-4 bg-gray-100 overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>

          <div className="mt-4 space-y-4">
            {response.images?.map((image: ImageData) => (
              <img
                key={image.page}
                src={image.data}
                alt={`Page ${image.page}`}
                className="max-w-full border border-gray-200"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
