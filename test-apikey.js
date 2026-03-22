require('dotenv').config();
const { google } = require('googleapis');

async function testWithAPIKey() {
  try {
    console.log('Testing Google Sheets with API Key...');
    console.log('Spreadsheet ID:', process.env.SPREADSHEET_ID);
    console.log('Sheet Name:', process.env.SHEET_NAME);
    
    // Use API key approach
    const sheets = google.sheets({ 
      version: 'v4',
      auth: process.env.GOOGLE_API_KEY || 'AIzaSyDummyKeyForTesting' // You'll need to provide real API key
    });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: process.env.SHEET_NAME,
    });
    
    console.log('SUCCESS: Data retrieved from Google Sheets');
    console.log('Number of rows:', response.data.values ? response.data.values.length : 0);
    
    if (response.data.values && response.data.values.length > 0) {
      console.log('Headers:', response.data.values[0]);
      console.log('First data row:', response.data.values[1]);
    }
    
  } catch (error) {
    console.error('ERROR: Failed to connect to Google Sheets');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Error details:', error.errors);
    }
  }
}

testWithAPIKey();
