import pool from '../db/pool.js';

export async function updateUser(userId, userData) {
  const { Ime, Priimek, Username, Telefon } = userData;
  const [result] = await pool.execute(
    `UPDATE Uporabnik SET Ime=?, Priimek=?, Username=?, Telefon=? WHERE idUporabnik=?`,
    [Ime, Priimek, Username, Telefon, userId]
  );
  return result.affectedRows === 1;
}

export async function getUserById(userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM Uporabnik WHERE idUporabnik=?`,
    [userId]
  );
  return rows[0] || null;
}