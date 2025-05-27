
import pool from "../db/pool.js"
async function createUser({ auth0UserId, ime, priimek, telefon, username}) {

  const [result] = await pool.execute(`
    INSERT INTO Uporabnik (IdUporabnik, Ime, Priimek, Telefon, Username, Datum_registriranja)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [auth0UserId, ime, priimek, telefon, username, new Date()]);

  return result;
}

async function getUserById(id) {
  const [rows] = await pool.execute(`
    SELECT * FROM Uporabnik WHERE IdUporabnik = ?
  `, [id]);

  return rows[0] || null;
}

export default { createUser, getUserById };
