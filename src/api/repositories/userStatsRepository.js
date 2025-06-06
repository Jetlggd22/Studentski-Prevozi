import pool from '../db/pool.js';

export async function getUserStats(userId) {
  // Broj vožnji kao vozač
  const [asDriver] = await pool.query(
    `SELECT COUNT(*) as count FROM Prevoz WHERE TK_Voznik = ?`, [userId]
  );
  // Broj vožnji kao putnik
  const [asPassenger] = await pool.query(
    `SELECT COUNT(*) as count FROM Rezervacija WHERE TK_Potnik = ?`, [userId]
  );
  // Prosečna ocena korisnika
  const [avgRating] = await pool.query(
    `SELECT Ocena FROM Uporabnik WHERE idUporabnik = ?`, [userId]
  );
  // Broj različitih relacija (kao vozač ili putnik)
  const [relations] = await pool.query(
    `SELECT COUNT(DISTINCT CONCAT(p.TK_Lokacija_Odhod, '-', p.TK_Lokacija_Prihod)) as count
     FROM Prevoz p
     LEFT JOIN Rezervacija r ON p.idPrevoz = r.TK_Prevoz
     WHERE p.TK_Voznik = ? OR r.TK_Potnik = ?`, [userId, userId]
  );

  return {
    asDriver: asDriver[0].count,
    asPassenger: asPassenger[0].count,
    avgRating: avgRating[0]?.Ocena || null,
    relations: relations[0].count
  };
}