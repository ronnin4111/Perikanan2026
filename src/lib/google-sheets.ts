import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Google Sheets Configuration
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const SHEET_NAME = 'Data Pelaku Usaha';

interface PelakuUsahaSheetData {
  id?: string;
  nama: string;
  kelompok: string;
  kecamatan: string;
  desa: string;
  jenisUsaha: string;
  wadahBudidaya: string;
  jenisIkan: string;
  kolam: number;
  lahan: number;
  produksi: number;
  lat: number;
  lng: number;
  cbib: number;
  kusukaKelompok: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Initialize Google Sheets API
async function getSheetsClient() {
  try {
    // Using Service Account authentication
    const auth = new GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client as any });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
}

// Initialize Google Sheet with headers
export async function initializeSheet(): Promise<boolean> {
  try {
    if (!SHEET_ID) {
      console.log('Google Sheet ID not configured, skipping initialization');
      return false;
    }

    const sheets = await getSheetsClient();

    // Check if sheet exists
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID,
      });
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Google Sheet not found, please create it first');
        return false;
      }
      throw error;
    }

    // Add headers if sheet is empty
    const headers = [
      'ID',
      'Nama Pelaku Usaha',
      'Kelompok',
      'Kecamatan',
      'Desa',
      'Jenis Usaha',
      'Wadah Budidaya',
      'Jenis Ikan',
      'Jumlah Kolam',
      'Luas Lahan (m²)',
      'Produksi (kg/tahun)',
      'Latitude',
      'Longitude',
      'CBIB',
      'KUSUKA Kelompok',
      'Dibuat Oleh',
      'Tanggal Dibuat',
      'Tanggal Diupdate'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:R1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers]
      }
    });

    console.log('Google Sheet initialized successfully');
    return true;
  } catch (error: any) {
    console.error('Error initializing sheet:', error.message);
    return false;
  }
}

// Read all data from Google Sheets
export async function readFromSheet(): Promise<PelakuUsahaSheetData[]> {
  try {
    if (!SHEET_ID) {
      console.log('Google Sheet ID not configured');
      return [];
    }

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:R`, // Skip header row
    });

    const rows = response.data.values || [];
    const data: PelakuUsahaSheetData[] = [];

    rows.forEach((row) => {
      if (row.length > 0 && row[0]) {
        data.push({
          id: row[0],
          nama: row[1] || '',
          kelompok: row[2] || '',
          kecamatan: row[3] || '',
          desa: row[4] || '',
          jenisUsaha: row[5] || '',
          wadahBudidaya: row[6] || '',
          jenisIkan: row[7] || '',
          kolam: parseInt(row[8]) || 0,
          lahan: parseFloat(row[9]) || 0,
          produksi: parseFloat(row[10]) || 0,
          lat: parseFloat(row[11]) || 0,
          lng: parseFloat(row[12]) || 0,
          cbib: parseInt(row[13]) || 0,
          kusukaKelompok: parseInt(row[14]) || 0,
          createdBy: row[15] || '',
          createdAt: row[16] || '',
          updatedAt: row[17] || '',
        });
      }
    });

    return data;
  } catch (error: any) {
    console.error('Error reading from sheet:', error.message);
    return [];
  }
}

// Add new row to Google Sheets
export async function addToSheet(
  data: PelakuUsahaSheetData,
  rowId: string
): Promise<boolean> {
  try {
    if (!SHEET_ID) {
      console.log('Google Sheet ID not configured');
      return false;
    }

    const sheets = await getSheetsClient();

    const row = [
      rowId,
      data.nama,
      data.kelompok,
      data.kecamatan,
      data.desa,
      data.jenisUsaha,
      data.wadahBudidaya,
      data.jenisIkan,
      data.kolam,
      data.lahan,
      data.produksi,
      data.lat,
      data.lng,
      data.cbib,
      data.kusukaKelompok,
      data.createdBy,
      data.createdAt,
      data.updatedAt
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:A`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row]
      }
    });

    console.log('Data added to Google Sheet successfully');
    return true;
  } catch (error: any) {
    console.error('Error adding to sheet:', error.message);
    return false;
  }
}

// Update row in Google Sheets
export async function updateSheet(
  data: PelakuUsahaSheetData,
  rowNumber: number
): Promise<boolean> {
  try {
    if (!SHEET_ID) {
      console.log('Google Sheet ID not configured');
      return false;
    }

    const sheets = await getSheetsClient();

    const row = [
      data.id,
      data.nama,
      data.kelompok,
      data.kecamatan,
      data.desa,
      data.jenisUsaha,
      data.wadahBudidaya,
      data.jenisIkan,
      data.kolam,
      data.lahan,
      data.produksi,
      data.lat,
      data.lng,
      data.cbib,
      data.kusukaKelompok,
      data.createdBy,
      data.createdAt,
      data.updatedAt
    ];

    // Update the row (rowNumber + 1 because of header)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber + 1}:R${rowNumber + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    console.log('Data updated in Google Sheet successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating sheet:', error.message);
    return false;
  }
}

// Delete row from Google Sheets
export async function deleteFromSheet(rowNumber: number): Promise<boolean> {
  try {
    if (!SHEET_ID) {
      console.log('Google Sheet ID not configured');
      return false;
    }

    const sheets = await getSheetsClient();

    // Delete the row (rowNumber + 1 because of header)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: rowNumber, // 0-indexed (excluding header)
                endIndex: rowNumber + 1
              }
            }
          }
        ]
      }
    });

    console.log('Data deleted from Google Sheet successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting from sheet:', error.message);
    return false;
  }
}

// Find row number by ID
export async function findRowNumberById(id: string): Promise<number | null> {
  try {
    if (!SHEET_ID) {
      return null;
    }

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:A`, // Skip header row, get all IDs
    });

    const rows = response.data.values || [];

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        return i; // Return 0-indexed row number (excluding header)
      }
    }

    return null;
  } catch (error: any) {
    console.error('Error finding row number:', error.message);
    return null;
  }
}

// Check if Google Sheets is configured
export function isSheetConfigured(): boolean {
  return !!SHEET_ID;
}
