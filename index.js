require('dotenv').config();
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Cache configuration - 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Google Sheets configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';
const API_KEY = process.env.API_KEY;

// Initialize Google Sheets API
let auth;
try {
  console.log('🔧 Initializing Google Auth...');
  
  // Try to use environment variable first (for Vercel)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    console.log('� Found GOOGLE_APPLICATION_CREDENTIALS_JSON');
    try {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      console.log('✅ Service account JSON parsed successfully');
      console.log('📧 Client email:', credentials.client_email);
      
      auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } catch (parseError) {
      console.error('❌ JSON parse failed, falling back to file:', parseError.message);
      // Fall back to file method
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    }
  } else {
    // Fallback to file (for local development)
    console.log('🔧 Using file for Google Auth');
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }
  console.log('✅ Google Auth initialized successfully');
} catch (error) {
  console.error('❌ Google Auth failed:', error.message);
  // Don't throw - let the API handle the error gracefully
  auth = null;
}

const sheets = google.sheets({ version: 'v4', auth });

// API Key Authentication Middleware
const authenticateApiKey = (req, res, next) => {
  const providedApiKey = req.query.apikey || req.headers['x-api-key'];
  
  if (!providedApiKey || providedApiKey !== API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }
  
  next();
};

// Fetch data from Google Sheets using API
async function fetchSheetData() {
  try {
    if (!auth) {
      throw new Error('Google Auth not initialized - check environment variables');
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in spreadsheet');
    }
    
    return rows;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

// Get cached data or fetch from sheets
async function getCachedData() {
  let cachedData = cache.get('sheetData');
  
  if (!cachedData) {
    console.log('Fetching fresh data from Google Sheets...');
    const rawData = await fetchSheetData();
    
    // Process data into structured format
    if (rawData.length < 2) {
      throw new Error('No data found in spreadsheet');
    }
    
    const headers = rawData[0];
    const processedData = [];
    
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (row.length >= headers.length) {
        const record = {};
        headers.forEach((header, index) => {
          const key = header.trim();
          record[key] = row[index] || '';
        });
        processedData.push(record);
      }
    }
    
    cache.set('sheetData', processedData);
    cachedData = processedData;
    console.log(`Cached ${processedData.length} records`);
  }
  
  return cachedData;
}

// Search by NRP (exact match)
function searchByNRP(data, nrp) {
  console.log('Searching for NRP:', nrp);
  if (data.length > 0) {
    console.log('Available keys in first record:', Object.keys(data[0]));
    console.log('Available NRP values:', data.slice(0, 5).map(record => record['NRP']));
  }
  
  const results = data.filter(record => record['NRP'] === nrp);
  console.log('Search results:', results);
  return results;
}

// Format response
function formatResponse(records) {
  if (records.length === 0) {
    return {
      found: false,
      message: 'Data tidak ditemukan'
    };
  }
  
  // Return first match
  const record = records[0];
  return {
    found: true,
    nama: record['NAMA'] || '',
    pangkat: record['PANGKAT'] || '',
    nrp: record['NRP'] || '',
    jabatan: record['JABATAN'] || '',
    kesatuan: record['KESATUAN'] || '',
    tgl_tes: record['TGL TES'] || '',
    tgl_hasil: record['TGL HASIL'] || '',
    masa_berlaku: record['MASA BERLAKU'] || '',
    hasil: record['HASIL'] || '',
    status: record['STATUS'] || ''
  };
}

// API Routes
app.get('/senpi', authenticateApiKey, async (req, res) => {
  try {
    console.log('=== API REQUEST RECEIVED ===');
    const { nrp } = req.query;
    console.log('NRP parameter:', nrp);
    
    if (!nrp) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide "nrp" parameter'
      });
    }
    
    const data = await getCachedData();
    const results = searchByNRP(data, nrp);
    
    const response = formatResponse(results);
    res.json(response);
    
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process request'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    cache_stats: cache.getStats()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bridge API server running on port ${PORT}`);
  console.log('Endpoints:');
  console.log('  GET /senpi?nrp={nrp}&apikey={key}');
  console.log('  GET /health');
  
  // Debug environment variables
  console.log('\n🔍 Environment Variables Check:');
  console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID ? '✅ SET' : '❌ NOT SET');
  console.log('SHEET_NAME:', process.env.SHEET_NAME ? '✅ SET' : '❌ NOT SET');
  console.log('API_KEY:', process.env.API_KEY ? '✅ SET' : '❌ NOT SET');
  console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅ SET' : '❌ NOT SET');
  console.log('GOOGLE_APPLICATION_CREDENTIALS_JSON:', process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? '✅ SET' : '❌ NOT SET');
});

module.exports = app;
