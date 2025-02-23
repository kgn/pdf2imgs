# PDF Parser

A tool to parse PDF files and extract text.

## Getting Started

1. Create a `.env.local` file:
```bash
API_KEY=your-secret-key-here
```

2. Run the development server:
```bash
npm run dev
```

## API Usage

Send a POST request to `/api/convert` with:
- Headers: `x-api-key` and `Content-Type: application/json`
- Body: `{ "pdf": "base64_encoded_pdf" }`

Example JavaScript:
```javascript
const response = await fetch('/api/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  },
  body: JSON.stringify({ pdf: base64PDF })
});
```

Example curl:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key-here" \
  -d "{\"pdf\":\"$(base64 -i input.pdf)\"}" \
  http://localhost:3000/api/convert
```
