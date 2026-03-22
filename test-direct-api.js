require('dotenv').config();
const { google } = require('googleapis');

async function testDirectAPI() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('Testing direct API call...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: process.env.SHEET_NAME,
    });
    
    console.log('API Response status:', response.status);
    console.log('Data rows found:', response.data.values.length);
    
    // Find first record with NRP 3020887
    const targetNRP = '3020887';
    const headers = response.data.values[0];
    const foundRecord = response.data.values.find(row => row[headers.indexOf('NRP')] === targetNRP);
    
    if (foundRecord) {
      console.log('✅ Found record:', foundRecord);
    } else {
      console.log('❌ NRP not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDirectAPI();
