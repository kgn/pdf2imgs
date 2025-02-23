# PDF Parser

A tool to parse PDF files and extract text.

## Getting Started

1. Set up your environment variables:
```bash
# Create a .env.local file with your API key
API_KEY=your-secret-key-here
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to view the app.

## API Usage

The PDF conversion endpoint is protected by an API key. To use it:

1. Include your API key in the request headers:
```javascript
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'your-secret-key-here'
}
```

2. Send a POST request to `/api/convert` with your PDF file as base64.

Example JavaScript usage:
```javascript
const base64PDF = // your base64 encoded PDF
const response = await fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-secret-key-here'
  },
  body: JSON.stringify({ pdf: base64PDF })
});
```

Example curl request:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key-here" \
  -d '{"pdf":"base64_encoded_pdf_here"}' \
  http://localhost:3000/api/convert
```
