  # Bridge API Usage Guide

  ## Overview
  The Bridge API provides access to SENPI Organik test result data from Google Sheets. It serves as middleware between Botpress chatbot and the spreadsheet database.

  ## Base URL
  ```
  https://bridge-api-ruddy.vercel.app
  ```

  ## Authentication
  All API requests require an API key passed as a query parameter or header:
  - **Query Parameter**: `?apikey=AQ.Ab8RN6Im-X5-M2W4r95pKgPimRzIumD_Uo4E0baii3mBB5cjEQ`
  - **Header**: `X-API-Key: AQ.Ab8RN6Im-X5-M2W4r95pKgPimRzIumD_Uo4E0baii3mBB5cjEQ`

  ## Endpoints

  ### 1. Search Personnel by Name
  **GET** `/senpi?nama={name}&apikey={key}`

  Search for personnel records using partial name matching (case-insensitive).

  #### Parameters
  - `nama` (string, required): Name or partial name to search
  - `apikey` (string, required): Your API authentication key

  #### Example Request
  ```bash
  curl "https://bridge-api-ruddy.vercel.app/senpi?nama=satria&apikey=AQ.Ab8RN6Im-X5-M2W4r95pKgPimRzIumD_Uo4E0baii3mBB5cjEQ"
  ```

  #### Example Response (Success)
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

  #### Example Response (Not Found)
  ```json
  {
    "found": false,
    "message": "Data tidak ditemukan"
  }
  ```

  ### 2. Search Personnel by NRP
  **GET** `/senpi?nrp={nrp}&apikey={key}`

  Search for personnel record using exact NRP (Police Identification Number).

  #### Parameters
  - `nrp` (string, required): Exact NRP to search
  - `apikey` (string, required): Your API authentication key

  #### Example Request
  ```bash
  curl "https://bridge-api-ruddy.vercel.app/senpi?nrp=30268817&apikey=AQ.Ab8RN6Im-X5-M2W4r95pKgPimRzIumD_Uo4E0baii3mBB5cjEQ"
  ```

  #### Response Format
  Same as name search response.

  ### 3. Health Check
  **GET** `/health`

  Check API status and cache statistics.

  #### Example Request
  ```bash
  curl "https://bridge-api-ruddy.vercel.app/health"
  ```

  #### Example Response
  ```json
  {
    "status": "OK",
    "timestamp": "2026-03-02T09:03:36.747Z",
    "cache_stats": {
      "hits": 0,
      "misses": 0,
      "keys": 0,
      "ksize": 0,
      "vsize": 0
    }
  }
  ```

  ## Search Behavior

  ### Name Search
  - **Case-insensitive**: "satria" matches "SATRIA"
  - **Partial matching**: "sat" matches "SATRIA"
  - **Returns**: First matching record found

  ### NRP Search
  - **Exact matching**: "30268817" only matches "30268817"
  - **Unique identifier**: Each NRP should return only one record
  - **Returns**: Exact match record

  ## Data Fields

  | Field | Description | Example |
  |--------|-------------|----------|
  | `nama` | Full name | "SATRIA MAHYAWAN SIBANGUN" |
  | `pangkat` | Rank | "BRIPDA" |
  | `nrp` | Police identification number | "30268817" |
  | `jabatan` | Position | "BA DITSAMAPTA" |
  | `kesatuan` | Unit | "DITSAMAPTA POLDA SUMUT" |
  | `tgl_tes` | Test date | "2025-12-02" |
  | `masa_berlaku` | Validity period | "2027-06-22" |
  | `tgl_hasil` | Result date | "2025-12-02" |
  | `hasil` | Test result | "Memenuhi Syarat (MS)" |

  ## Error Handling

  ### HTTP Status Codes
  - `200 OK`: Request successful
  - `400 Bad Request`: Missing or invalid parameters
  - `401 Unauthorized`: Invalid or missing API key
  - `500 Internal Server Error`: Server error occurred

  ### Error Response Format
  ```json
  {
    "error": "Error Type",
    "message": "Detailed error message"
  }
  ```

  ## Integration Examples

  ### JavaScript (Fetch API)
  ```javascript
  // Search by name
  const searchByName = async (name) => {
    const response = await fetch(
      `https://bridge-api-ruddy.vercel.app/senpi?nama=${encodeURIComponent(name)}&apikey=AQ.Ab8RN6Im-X5-M2W4r95pKgPimRzIumD_Uo4E0baii3mBB5cjEQ`
    );
    return await response.json();
  };

  // Search by NRP
  const searchByNRP = async (nrp) => {
    const response = await fetch(
      `https://bridge-api-ruddy.vercel.app/senpi?nrp=${nrp}&apikey=AQ.Ab8RN6Im-X5-M2W4r95pKgPimRzIumD_Uo4E0baii3mBB5cjEQ`
    );
    return await response.json();
  };
  ```

  ### Python (requests)
  ```python
  import requests

  API_BASE = "https://bridge-api-ruddy.vercel.app"
  API_KEY = "AQ.Ab8RN6Im-X5-M2W4r95pKgPimRzIumD_Uo4E0baii3mBB5cjEQ"

  def search_by_name(name):
      url = f"{API_BASE}/senpi"
      params = {"nama": name, "apikey": API_KEY}
      response = requests.get(url, params=params)
      return response.json()

  def search_by_nrp(nrp):
      url = f"{API_BASE}/senpi"
      params = {"nrp": nrp, "apikey": API_KEY}
      response = requests.get(url, params=params)
      return response.json()
  ```

  ### Botpress Integration
  In Botpress, you can use the HTTP Request action to call this API:

  1. **Create HTTP Request Action**
  2. **Set Method**: GET
  3. **Set URL**: `https://bridge-api-ruddy.vercel.app/senpi`
  4. **Add Query Parameters**:
    - `nama`: `{{workflow.variable}}` (for name search)
    - `nrp`: `{{workflow.variable}}` (for NRP search)
    - `apikey`: `AQ.Ab8RN6Im-X5-M2W4r95pKgPimRzIumD_Uo4E0baii3mBB5cjEQ`

  ## Performance Features

  ### Caching
  - **Cache Duration**: 5 minutes
  - **Purpose**: Reduce Google Sheets API calls
  - **Benefit**: Faster response times

  ### Rate Limiting
  - **No explicit rate limiting** (handled by Vercel)
  - **Recommended**: Don't exceed 100 requests per minute

  ## Security Notes

  - **API Key**: Keep secret and don't expose in client-side code
  - **HTTPS Only**: API only accessible via HTTPS
  - **CORS Enabled**: Cross-origin requests allowed
  - **Read-Only**: API cannot modify spreadsheet data

  ## Support

  For issues or questions:
  - Check the health endpoint: `/health`
  - Verify API key is correct
  - Ensure Google Sheet is publicly accessible
  - Check parameter names and values
