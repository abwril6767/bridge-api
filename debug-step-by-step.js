require('dotenv').config();
const { google } = require('googleapis');

async function debugStepByStep() {
  try {
    console.log('=== STEP 1: Initialize Google Sheets API ===');
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('=== STEP 2: Fetch data ===');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: process.env.SHEET_NAME,
    });
    
    console.log('=== STEP 3: Process data ===');
    const headers = response.data.values[0];
    console.log('Headers:', headers);
    
    const nrpIndex = headers.findIndex(header => header.includes('NRP'));
    console.log('NRP column index:', nrpIndex);
    
    const targetNRP = '3020887';
    console.log('Searching for NRP:', targetNRP);
    
    const foundRecord = response.data.values.find(row => row[nrpIndex] === targetNRP);
    
    if (foundRecord) {
      console.log('✅ SUCCESS: Found record');
      console.log('NRP:', foundRecord[nrpIndex]);
      console.log('Name:', foundRecord[headers.indexOf('NAMA')]);
    } else {
      console.log('❌ FAILED: NRP not found');
    }
    
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugStepByStep();
