const pool = require('../../db/mysqlPool');

async function updateUser(userId, userData) {
  const { Ime, Priimek, Username, Telefon, Univerza } = userData;
  const [result] = await pool.execute(
    `UPDATE Uporabnik SET Ime=?, Priimek=?, Username=?, Telefon=?, WHERE idUporabnik=?`,
    [Ime, Priimek, Username, Telefon, userId]
  );
  return result.affectedRows === 1;
}

async function getUserById(userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM Uporabnik WHERE idUporabnik=?`,
    [userId]
  );
  return rows[0] || null;
}

module.exports = { updateUser, getUserById };