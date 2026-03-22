require('dotenv').config();
const { google } = require('googleapis');

async function testGoogleSheets() {
  try {
    console.log('Testing Google Sheets API...');
    console.log('Spreadsheet ID:', process.env.SPREADSHEET_ID);
    console.log('Sheet Name:', process.env.SHEET_NAME);
    console.log('Service Account:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: process.env.SHEET_NAME,
    });
    
    console.log('Success! Found', response.data.values.length, 'rows');
    console.log('Headers:', response.data.values[0]);
    console.log('First data row:', response.data.values[1]);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Details:', error);
  }
}

testGoogleSheets();
