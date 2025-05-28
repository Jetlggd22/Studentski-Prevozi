import pool from '../db/pool.js';

export async function getAllUsers() {
  const [rows] = await pool.execute('SELECT * FROM Uporabnik');
  return rows;
}

export async function getUserById(id) {
  const [rows] = await pool.execute('SELECT * FROM Uporabnik WHERE idUporabnik = ?', [id]);
  return rows[0] || null;
}

export async function createUser(user) {
  const { idUporabnik, Ime, Priimek, Username, Telefon, Ocena, Datum_registriranja, Avto } = user;
  await pool.execute(
    `INSERT INTO Uporabnik (idUporabnik, Ime, Priimek, Username, Telefon, Ocena, Datum_registriranja, Avto)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [idUporabnik, Ime, Priimek, Username, Telefon, Ocena, Datum_registriranja, Avto]
  );
  return true;
}

export async function updateUser(id, user) {
  const { Ime, Priimek, Username, Telefon, Ocena, Avto } = user;
  const [result] = await pool.execute(
    `UPDATE Uporabnik SET Ime=?, Priimek=?, Username=?, Telefon=?, Ocena=?, Avto=? WHERE idUporabnik=?`,
    [Ime, Priimek, Username, Telefon, Ocena, Avto, id]
  );
  return result.affectedRows === 1;
}

export async function deleteUser(id) {
  
  await pool.execute('DELETE FROM Prevoz WHERE TK_Voznik=?', [id]);
 
  const [result] = await pool.execute('DELETE FROM Uporabnik WHERE idUporabnik=?', [id]);
  return result.affectedRows === 1;
}