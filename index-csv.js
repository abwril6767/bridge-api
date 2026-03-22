require('dotenv').config();
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');

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

// Fetch data from Google Sheets using CSV export
async function fetchSheetData() {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('No data found in spreadsheet');
    }
    
    // Parse CSV rows
    const data = [];
    for (let i = 0; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      data.push(row);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

// Parse CSV line (simple implementation)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
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
          const key = header.toLowerCase().replace(/\s+/g, '_');
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

// Search by name (case-insensitive, partial matching)
function searchByName(data, name) {
  const searchName = name.toLowerCase();
  return data.filter(record => {
    const recordName = (record.nama || '').toLowerCase();
    return recordName.includes(searchName);
  });
}

// Search by NRP (exact match)
function searchByNRP(data, nrp) {
  return data.filter(record => record.nrp === nrp);
}

// Format response
function formatResponse(records) {
  if (records.length === 0) {
    return {
      found: false,
      message: 'Data tidak ditemukan'
    };
  }
  
  // Return first match for NRP search, all matches for name search
  const record = records[0];
  return {
    found: true,
    nama: record.nama || '',
    pangkat: record.pangkat || '',
    nrp: record.nrp || '',
    jabatan: record.jabatan || '',
    kesatuan: record.kesatuan || '',
    tgl_tes: record['tgl_tes'] || record['tgl tes'] || '',
    masa_berlaku: record['masa_berlaku'] || record['masa berlaku'] || '',
    tgl_hasil: record['tgl_hasil'] || record['tgl hasil'] || '',
    hasil: record.hasil === 'MS' ? 'Memenuhi Syarat (MS)' : record.hasil || ''
  };
}

// API Routes
app.get('/senpi', authenticateApiKey, async (req, res) => {
  try {
    const { nama, nrp } = req.query;
    
    if (!nama && !nrp) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide either "nama" or "nrp" parameter'
      });
    }
    
    const data = await getCachedData();
    let results = [];
    
    if (nrp) {
      results = searchByNRP(data, nrp);
    } else if (nama) {
      results = searchByName(data, nama);
    }
    
    const response = formatResponse(results);
    res.json(response);
    
  } catch (error) {
    console.error('API Error:', error);
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
  console.log('  GET /senpi?nama={name}&apikey={key}');
  console.log('  GET /senpi?nrp={nrp}&apikey={key}');
  console.log('  GET /health');
});

module.exports = app;
