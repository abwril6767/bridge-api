require('dotenv').config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME;

async function testCSV() {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    console.log('Raw CSV (first 500 chars):');
    console.log(csvText.substring(0, 500));
    console.log('\n---\n');
    
    // Parse CSV
    const lines = parseCSV(csvText);
    console.log('Total lines:', lines.length);
    
    // Show first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      console.log(`Line ${i}:`, lines[i]);
    }
    
    // Parse first line (headers)
    const headers = parseCSVLine(lines[0]);
    console.log('\nParsed headers:', headers);
    
    // Parse first data row
    if (lines.length > 1) {
      const firstRow = parseCSVLine(lines[1]);
      console.log('First data row:', firstRow);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Parse CSV with better handling of line breaks
function parseCSV(csvText) {
  // First, split by lines but handle quoted fields that contain newlines
  const lines = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  return lines.filter(line => line.trim());
}

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

testCSV();
