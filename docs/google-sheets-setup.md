# Google Sheets Integration Setup Guide

## Overview

The Fisheries Dashboard can synchronize data with Google Sheets for real-time collaboration and data backup.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in:
   - Service account name: `fisheries-dashboard`
   - Service account description: `Fisheries Dashboard Service Account`
4. Click "Create and Continue"
5. Skip adding roles (optional)
6. Click "Done"

## Step 3: Create Service Account Key

1. Find the service account you just created
2. Click on the email address
3. Go to "Keys" tab
4. Click "Add Key" > "Create new key"
5. Select "JSON" format
6. Click "Create"
7. Download the JSON file (save it securely!)

## Step 4: Copy Service Account Credentials

Open the downloaded JSON file and copy these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "fisheries-dashboard@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Step 5: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: "Data Pelaku Usaha Budidaya Perikanan"
4. Copy the spreadsheet ID from URL:
   - URL: `https://docs.google.com/spreadsheets/d/1ABC123...XYZ/edit`
   - Sheet ID: `1ABC123...XYZ`

## Step 6: Share Sheet with Service Account

1. In your Google Sheet, click "Share"
2. Paste the service account email:
   - `fisheries-dashboard@your-project.iam.gserviceaccount.com`
3. Set permission to "Editor"
4. Click "Send"

## Step 7: Configure Environment Variables

Add the following to your `.env` file:

```bash
# Google Sheets Configuration
GOOGLE_SHEET_ID=your-sheet-id-here

# Service Account Credentials
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email
```

**Important Notes:**
- Keep `GOOGLE_PRIVATE_KEY` in quotes to preserve newlines
- Replace `\n` with actual newlines or keep `\n` in the string
- Never commit `.env` file to version control
- Keep your service account key file secure

## Step 8: Initialize the Sheet

After configuration, the system will automatically:
1. Create a sheet named "Data Pelaku Usaha" (if not exists)
2. Add headers to the first row
3. Sync existing data from database to sheet

## Sheet Structure

The Google Sheet will have the following columns:

| Column | Header | Description |
|--------|--------|-------------|
| A | ID | Unique identifier |
| B | Nama Pelaku Usaha | Business owner name |
| C | Kelompok | Group name |
| D | Kecamatan | District name |
| E | Desa | Village name |
| F | Jenis Usaha | Business type |
| G | Wadah Budidaya | Cultivation container |
| H | Jenis Ikan | Fish species |
| I | Jumlah Kolam | Number of ponds |
| J | Luas Lahan (m²) | Land area in m² |
| K | Produksi (kg/tahun) | Production in kg/year |
| L | Latitude | GPS latitude |
| M | Longitude | GPS longitude |
| N | CBIB | CBIB certificate |
| O | KUSUKA Kelompok | KUSUKA group certificate |
| P | Dibuat Oleh | Created by user |
| Q | Tanggal Dibuat | Created date |
| R | Tanggal Diupdate | Updated date |

## Testing the Integration

1. After setup, restart the development server
2. Log in to the dashboard
3. Create a new pelaku usaha record
4. Check the Google Sheet - the new data should appear

## Troubleshooting

### Error: "Sheet not found"
- Verify GOOGLE_SHEET_ID is correct
- Check if sheet exists and is not deleted

### Error: "Permission denied"
- Verify service account email has Editor access to the sheet
- Check if GOOGLE_CLIENT_EMAIL is correct

### Error: "Invalid credentials"
- Verify all environment variables are set correctly
- Check if private key is properly formatted with \n
- Ensure service account key hasn't expired

## Security Considerations

1. **Never commit `.env` file** to version control
2. **Limit access** to service account key file
3. **Use IAM roles** to restrict what the service account can do
4. **Regularly rotate** service account keys
5. **Monitor API usage** in Google Cloud Console

## Alternative: Manual Data Import

If you prefer not to use API integration, you can:

1. Export data from dashboard to Excel/CSV
2. Import to Google Sheets manually
3. Make changes in Google Sheets
4. Import back to dashboard using CSV import feature

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set
3. Test API access using Google Cloud Console's "Try this API"
4. Contact your system administrator
