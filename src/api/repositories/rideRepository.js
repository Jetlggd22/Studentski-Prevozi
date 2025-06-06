// src/api/repositories/rideRepository.js
import pool from "../db/pool.js";

// ... (existing functions: getAllPrevozi, searchPrevoziByLocation, deletePrevozById)

export async function getAllPrevozi(limit = null) {
  let query = `
    SELECT 
      p.IdPrevoz, p.Cas_odhoda, p.Cena, p.Prosta_mesta, 
      o.Ime AS ime_odhod, 
      d.Ime AS ime_prihod,
      CONCAT(u.Ime, ' ', u.Priimek) AS voznik,
      u.Ocena AS voznik_ocena, -- Added driver's rating
      u.Avto AS avto -- Added vehicle information
    FROM Prevoz p
    JOIN Lokacija o ON p.TK_Lokacija_Odhod = o.idLokacija
    JOIN Lokacija d ON p.TK_Lokacija_Prihod = d.idLokacija
    JOIN Uporabnik u ON p.TK_Voznik = u.IdUporabnik
    ORDER BY p.Cas_odhoda DESC
  `;
  if (limit) {
    query += ` LIMIT ${parseInt(limit)}`;
  }
  const [rows] = await pool.query(query);
  return rows;
}

export async function findPrevozById(id) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        lo.idLokacija AS Odhod_idLokacija,
        lo.Ime AS Odhod_Ime,
        lo.Longitude AS Odhod_Longitude,
        lo.Latitude AS Odhod_Latitude,
        lp.idLokacija AS Prihod_idLokacija,
        lp.Ime AS Prihod_Ime,
        lp.Longitude AS Prihod_Longitude,
        lp.Latitude AS Prihod_Latitude,
        u.idUporabnik AS Voznik_idUporabnik,
        u.Ime AS Voznik_Ime,
        u.Priimek AS Voznik_Priimek,
        u.Username AS Voznik_Username,
        u.Telefon AS Voznik_Telefon,
        u.Ocena AS Voznik_Ocena,
        u.Datum_registriranja AS Voznik_Datum_registriranja, -- Corrected column name here
        u.Avto AS Voznik_Avto
      FROM Prevoz p
      LEFT JOIN Lokacija lo ON p.TK_Lokacija_Odhod = lo.idLokacija
      LEFT JOIN Lokacija lp ON p.TK_Lokacija_Prihod = lp.idLokacija
      LEFT JOIN Uporabnik u ON p.TK_Voznik = u.idUporabnik
      WHERE p.idPrevoz = ?;
    `, [id]);

    return rows.length ? rows[0] : null;

  } catch (err) {
    console.error('Repository error (findPrevozById):', err);
    throw err;
  }
}

export async function searchPrevoziByLocation(fromLocation, toLocation) {
  const [rows] = await pool.query(`
    SELECT 
      p.IdPrevoz, p.Cas_odhoda, p.Cena, p.Prosta_mesta, 
      o.Ime AS ime_odhod, 
      d.Ime AS ime_prihod,
      CONCAT(u.Ime, ' ', u.Priimek) AS voznik,
      u.Ocena AS voznik_ocena, -- Added driver's rating
      u.Avto AS avto -- Added vehicle information
    FROM Prevoz p
    JOIN Lokacija o ON p.TK_Lokacija_Odhod = o.idLokacija
    JOIN Lokacija d ON p.TK_Lokacija_Prihod = d.idLokacija
    JOIN Uporabnik u ON p.TK_Voznik = u.IdUporabnik
    WHERE o.Ime LIKE ? AND d.Ime LIKE ?
    ORDER BY p.Cas_odhoda DESC
  `, [`%${fromLocation}%`, `%${toLocation}%`]);
  return rows;
}

export async function deletePrevozById(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Delete related ratings (Ocena) first
    // Ocena can be linked via TK_Prevoz (direct rating of the ride) or TK_Rezervacija
    // We need to get Rezervacija IDs for the given Prevoz ID to delete associated ratings
    const [rezervacije] = await connection.execute('SELECT idRezervacija FROM Rezervacija WHERE TK_Prevoz = ?', [id]);
    if (rezervacije.length > 0) {
      const rezervacijaIds = rezervacije.map(r => r.idRezervacija);
      await connection.execute('DELETE FROM Ocena WHERE TK_Rezervacija IN (?)', [rezervacijaIds]);
    }
    // Delete ratings directly linked to Prevoz
    await connection.execute('DELETE FROM Ocena WHERE TK_Prevoz = ? AND TK_Rezervacija IS NULL', [id]);

    // Delete related reservations (Rezervacija)
    await connection.execute('DELETE FROM Rezervacija WHERE TK_Prevoz = ?', [id]);

    // Delete the ride (Prevoz)
    const [result] = await connection.execute('DELETE FROM Prevoz WHERE IdPrevoz = ?', [id]);

    await connection.commit();
    return result.affectedRows; // Returns the number of deleted rows (should be 1 if successful)
  } catch (error) {
    await connection.rollback();
    console.error('Repository error (deletePrevozById):', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function updatePrevozInDB(rideId, dataToUpdate) {
  // Construct the SET part of the SQL query dynamically
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(dataToUpdate)) {
    // Ensure keys match your database column names
    // e.g., if frontend sends 'Ponavljanje' but DB is 'ponavljanje'
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) {
    console.log("No fields to update for rideId:", rideId);
    return 0; // Or handle as an error/no-op
  }

  values.push(rideId); // Add rideId for the WHERE clause

  const sql = `UPDATE Prevoz SET ${fields.join(', ')} WHERE IdPrevoz = ?`;

  try {
    const [result] = await pool.execute(sql, values);
    return result.affectedRows;
  } catch (error) {
    console.error("Error updating Prevoz in DB:", error);
    throw error;
  }
}
// Expose pool if needed by services directly (though better to keep queries in repo)
export { pool };