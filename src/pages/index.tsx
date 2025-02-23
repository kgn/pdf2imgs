import { useState } from 'react';

interface ImageData {
  page: number;
  data: string;
}

export default function Home() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

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
