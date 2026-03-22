# SENPI Organik Verification Chatbot - Bridge API

A Node.js API service that connects a Botpress chatbot to Google Sheets containing SENPI Organik test results.

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT`: Server port (default: 3000)
- `SPREADSHEET_ID`: Your Google Sheet ID
- `SHEET_NAME`: Sheet name (default: Sheet1)
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account key file
- `API_KEY`: Your secret API key for authentication

### 2. Google Sheets Setup
1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account
4. Download the service account key JSON file
5. Share your Google Sheet with the service account email
6. Place the key file as `service-account-key.json` in the project root

### 3. Installation & Running
```bash
# Install dependencies
npm install

# Start the server
npm start
```

## API Endpoints

### Search Personnel Data
- **GET** `/senpi?nama={name}&apikey={key}` - Search by name (case-insensitive, partial matching)
- **GET** `/senpi?nrp={nrp}&apikey={key}` - Search by NRP (exact match)

### Health Check
- **GET** `/health` - Server status and cache statistics

## Response Format

### Success Response
```json
{
  "found": true,
  "nama": "SATRIA MAHYAWAN SIBANGUN",
  "pangkat": "BRIPDA",
  "nrp": "30268817",
  "jabatan": "BA DITSAMAPTA",
  "kesatuan": "DITSAMAPTA POLDA SUMUT",
  "tgl_tes": "2025-12-02",
  "masa_berlaku": "2027-06-22",
  "tgl_hasil": "2025-12-02",
  "hasil": "Memenuhi Syarat (MS)"
}
```

### Not Found Response
```json
{
  "found": false,
  "message": "Data tidak ditemukan"
}
```

## Features
- ✅ API key authentication
- ✅ Data caching (5-minute refresh)
- ✅ Case-insensitive name search
- ✅ Exact NRP matching
- ✅ Error handling and validation
- ✅ Health monitoring endpoint

## Deployment
Ready for deployment on:
- Render
- Railway
- Vercel
- Any Node.js hosting platform

## Security Notes
- Keep your API key secret
- Use HTTPS in production
- The service account should have read-only access
- Never commit `.env` or service account keys to version control
