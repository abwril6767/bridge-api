Project Overview
SENPI Organik Verification Chatbot – Bridge API
1. Project Description

The project aims to build a Bridge API service that connects a chatbot built with Botpress to personnel test result data stored in Google Sheets.

The API acts as a middleware layer responsible for retrieving, processing, and returning SENPI Organik test data in a structured format that can be easily consumed by the chatbot.

This architecture ensures that the chatbot can query up-to-date information without directly accessing the spreadsheet.

2. System Architecture
User (WhatsApp)
      ↓
Botpress Chatbot
      ↓
Bridge API (Custom Backend)
      ↓
Google Sheets Database

Component roles:

User

Sends query via WhatsApp chatbot.

Botpress

Handles conversation flow.

Extracts query parameters (Name / NRP).

Calls Bridge API.

Bridge API

Fetches spreadsheet data.

Searches the requested record.

Returns structured JSON response.

Google Sheets

Serves as the database storing SENPI Organik test results.

3. Data Structure

Each personnel record contains:

Field	Description
Nama	Full name
Pangkat	Rank
NRP	Police identification number
Jabatan	Position
Kesatuan	Unit
Tgl TES	Test date
Masa Berlaku	Validity date
Tgl Hasil	Result date
Hasil	Test result (MS / Tidak)
4. API Responsibilities

The Bridge API is responsible for:

Connecting to the Google Sheets API

Retrieving spreadsheet data

Performing search operations

Returning results in JSON format

Handling errors and invalid queries

Protecting access with authentication (API key)

5. API Endpoints
Search by Name
GET /senpi?nama={name}

Example:

GET /senpi?nama=satria

Function:
Search personnel records based on name.

Search by NRP
GET /senpi?nrp={nrp}

Example:

GET /senpi?nrp=30268817

Function:
Search personnel record using the unique NRP identifier.

6. API Response Format
Successful Response
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
Data Not Found
{
  "found": false,
  "message": "Data tidak ditemukan"
}
7. Data Processing Rules

The API must follow these rules:

Search operations must be case insensitive

Partial name matching is allowed

NRP search must match exactly

Only verified spreadsheet data should be returned

No data should be generated artificially

8. Performance Strategy

To improve performance, the API will implement data caching.

Process:

Load spreadsheet data
↓
Store in server memory
↓
Refresh every 5 minutes

Benefits:

Reduces API calls to Google

Faster chatbot response time

Prevents rate limiting

9. Security

Security measures include:

API key authentication

Limited read-only access to spreadsheet

No modification permissions

Restricting API usage to chatbot service only

Example request with key:

GET /senpi?nrp=30268817&apikey=xxxxx
10. Technology Stack

Backend server:

Node.js

Express.js

Database:

Google Sheets

Chatbot platform:

Botpress

Hosting options:

Render

Railway

Vercel

11. Expected Workflow

User sends query through WhatsApp.

Botpress processes the message.

Botpress extracts name or NRP.

Botpress sends request to Bridge API.

Bridge API searches Google Sheets.

API returns structured JSON.

Botpress formats the result into a user-friendly message.

12. Future Improvements

Possible future features include:

Search suggestions when multiple names match

Query logging system

Admin dashboard for monitoring requests

Migration to a dedicated database if data size increases