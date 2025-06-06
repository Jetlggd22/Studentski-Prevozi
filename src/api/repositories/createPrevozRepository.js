import pool from '../db/pool.js';

// Helper function to get or create a location
async function getOrCreateLocation(locationName, longitude, latitude) {
  // First, try to find the location
  let [rows] = await pool.execute('SELECT idLokacija FROM Lokacija WHERE Ime = ?', [locationName]);
  if (rows.length > 0) {
    return rows[0].idLokacija; // Return existing ID
  } else {
    // Location not found, so insert it
    const insertLongitude = longitude || '0'; // Use provided longitude or a default
    const insertLatitude = latitude || '0';   // Use provided latitude or a default
    
    // For AUTO_INCREMENT, DO NOT specify idLokacija in the column list
    const [result] = await pool.execute(
      'INSERT INTO Lokacija (Ime, Longitude, Latitude) VALUES (?, ?, ?)',
      [locationName, insertLongitude, insertLatitude]
    );
    return result.insertId; // This will return the auto-generated ID by MySQL
  }
}

export async function createPrevoz({ from, to, date, seats, price, car, note, voznikId, fromLongitude, fromLatitude, toLongitude, toLatitude }) {
  // Get or create location IDs
  const fromLocationId = await getOrCreateLocation(from, fromLongitude, fromLatitude);
  const toLocationId = await getOrCreateLocation(to, toLongitude, toLatitude);

  if (!fromLocationId || !toLocationId) {
    throw new Error('Napaka pri pridobivanju ali ustvarjanju lokacije.');
  }

  // Kreiraj prevoz
  const [result] = await pool.execute(
    `INSERT INTO Prevoz (Cas_odhoda, Cena, Prosta_mesta, Ponavljanje, TK_Lokacija_Odhod, TK_Lokacija_Prihod, TK_Voznik)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [date, price, seats, note || '', fromLocationId, toLocationId, voznikId]
  );
  return result.insertId;
}