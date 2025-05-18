
import pool from "../db/pool.js"
async function createUser({ auth0UserId, ime, priimek, telefon, username}) {

  const [result] = await pool.execute(`
    INSERT INTO Uporabnik (IdUporabnik, Ime, Priimek, Telefon, Username)
    VALUES (?, ?, ?, ?, ?)
  `, [auth0UserId, ime, priimek, telefon, username]);

  return result;
}

export default { createUser };
