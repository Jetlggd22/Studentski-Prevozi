// src/api/repositories/lokacijaRepository.jss
import pool from '../db/pool.js'; // Prepričajte se, da je pot do pool.js pravilna

export async function searchLokacijeByName(query) {
  try {
    const searchQuery = `%${query}%`; // Uporabite LIKE za iskanje podnizov
    const [rows] = await pool.execute(
      'SELECT idLokacija, Ime, Longitude, Latitude FROM Lokacija WHERE Ime LIKE ? LIMIT 10',
      [searchQuery]
    );
    return rows;
  } catch (error) {
    console.error('Error in searchLokacijeByName repository:', error);
    throw error; // Vrnite napako, da jo lahko obravnava service/controller
  }
}