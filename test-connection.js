require('dotenv').config();
const { google } = require('googleapis');

async function testGoogleSheetsConnection() {
  try {
    console.log('Testing Google Sheets connection...');
    console.log('Spreadsheet ID:', process.env.SPREADSHEET_ID);
    console.log('Sheet Name:', process.env.SHEET_NAME);
    console.log('Credentials file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    console.log('Auth object created successfully');
    
    const authClient = await auth.getClient();
    console.log('Auth client obtained successfully');
    
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    console.log('Sheets client created successfully');
    
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

testGoogleSheetsConnection();
