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
  // 1. Obriši ocene vezane za rezervacije gde je korisnik putnik
  await pool.execute(
    `DELETE o FROM Ocena o
     JOIN Rezervacija r ON o.TK_Rezervacija = r.idRezervacija
     WHERE r.TK_Potnik = ?`,
    [id]
  );
  // 2. Obriši rezervacije gde je korisnik putnik
  await pool.execute('DELETE FROM Rezervacija WHERE TK_Potnik=?', [id]);

  // 3. Obriši ocene vezane za rezervacije na prevozima gde je korisnik vozač
  await pool.execute(
    `DELETE o FROM Ocena o
     JOIN Rezervacija r ON o.TK_Rezervacija = r.idRezervacija
     JOIN Prevoz p ON r.TK_Prevoz = p.idPrevoz
     WHERE p.TK_Voznik = ?`,
    [id]
  );
  // 4. Obriši rezervacije na prevozima gde je korisnik vozač
  await pool.execute(
    `DELETE r FROM Rezervacija r
     JOIN Prevoz p ON r.TK_Prevoz = p.idPrevoz
     WHERE p.TK_Voznik = ?`,
    [id]
  );
  // 5. Obriši ocene direktno vezane za prevoze gde je korisnik vozač
  await pool.execute(
    `DELETE o FROM Ocena o
     JOIN Prevoz p ON o.TK_Prevoz = p.idPrevoz
     WHERE p.TK_Voznik = ?`,
    [id]
  );
  // 6. Obriši prevoze gde je korisnik vozač
  await pool.execute('DELETE FROM Prevoz WHERE TK_Voznik=?', [id]);
  // 7. Na kraju obriši korisnika
  const [result] = await pool.execute('DELETE FROM Uporabnik WHERE idUporabnik=?', [id]);
  return result.affectedRows === 1;
}

export async function getTopDrivers(limit = 5) {
  limit = Number(limit) || 5; // sigurnost
  const [rows] = await pool.execute(
    `SELECT * FROM Uporabnik WHERE Ocena IS NOT NULL ORDER BY Ocena DESC LIMIT ${limit}`
  );
  return rows;
}


export async function getDriversWithCarsAndRides(limit = null) {
  let query = `
    SELECT
      u.idUporabnik,
      u.Ime,
      u.Priimek,
      u.Username,
      u.Telefon,
      u.Ocena,
      u.Datum_registriranja,
      u.Avto,
      COUNT(DISTINCT p.idPrevoz) AS SteviloVozenj, // Uporabljen DISTINCT
      (SELECT COUNT(*) FROM Ocena o_check WHERE o_check.TK_Prevoz IS NOT NULL AND o_check.TK_Prevoz IN (SELECT IdPrevoz FROM Prevoz pr_check WHERE pr_check.TK_Voznik = u.idUporabnik)) AS SteviloOcenVoznika
    FROM Uporabnik u
    LEFT JOIN Prevoz p ON u.idUporabnik = p.TK_Voznik
    WHERE u.Avto IS NOT NULL AND u.Avto != ''
    GROUP BY u.idUporabnik, u.Ime, u.Priimek, u.Username, u.Telefon, u.Ocena, u.Datum_registriranja, u.Avto // Ekspliciten GROUP BY za vsa neagregirana polja
    HAVING COUNT(DISTINCT p.idPrevoz) > 0 // Uporabljen DISTINCT
    ORDER BY COALESCE(u.Ocena, 0) DESC, SteviloVozenj DESC // Bolj robusten ORDER BY
  `;
  if (limit) {
    query += ` LIMIT ${parseInt(limit)}`;
  }
  const [rows] = await pool.execute(query);
  return rows;
}