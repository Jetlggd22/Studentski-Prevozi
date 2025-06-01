import pool from '../db/pool.js';

export async function searchDrivers(query, minRating) {
  let sql = `SELECT * FROM Uporabnik WHERE (Ime LIKE ? OR Priimek LIKE ? OR Username LIKE ?)`;
  let params = [`%${query}%`, `%${query}%`, `%${query}%`];

  if (minRating) {
    sql += ` AND (Ocena IS NULL OR Ocena >= ?)`;
    params.push(Number(minRating));
  }
  sql += ` ORDER BY COALESCE(Ocena, 0) DESC`;

  const [rows] = await pool.execute(sql, params);
  return rows;
}