import pool from "../db/pool.js";
export async function getUserRideHistory(userId) {
  const [rows] = await pool.execute(`
    SELECT 
      p.IdPrevoz, 
      p.Cas_odhoda, 
      p.Cena, 
      l1.Ime AS Odhod, 
      l2.Ime AS Prihod,
      CASE
        WHEN p.TK_Voznik = ? THEN 'Izveden'
        ELSE r.Status
      END AS Status,
      CASE
        WHEN p.TK_Voznik = ? THEN p.Cas_odhoda
        ELSE r.Ustvarjeno
      END AS Datum_rezervacije,
      CASE
        WHEN p.TK_Voznik = ? THEN 'Voznik'
        ELSE 'Potnik'
      END AS Vloga
    FROM Prevoz p
    JOIN Lokacija l1 ON p.TK_Lokacija_Odhoda = l1.idLokacija
    JOIN Lokacija l2 ON p.TK_Lokacija_Prihoda = l2.idLokacija
    LEFT JOIN Rezervacija r ON p.IdPrevoz = r.TK_Prevoz AND r.TK_Putnik = ?
    WHERE p.TK_Voznik = ? OR r.TK_Putnik = ?
    ORDER BY Cas_odhoda DESC
  `, [userId, userId, userId, userId, userId, userId]);

  return rows;
}

export async function getRideDetails(prevozId) {
  const [prevozRows] = await pool.execute(`
    SELECT 
      p.*,
      l1.Ime AS Odhod_lokacija,
      l2.Ime AS Prihod_lokacija,
      u.Ime AS Voznik_ime,
      u.Priimek AS Voznik_priimek
    FROM Prevoz p
    JOIN Lokacija l1 ON p.TK_Lokacija_Odhoda = l1.idLokacija
    JOIN Lokacija l2 ON p.TK_Lokacija_Prihoda = l2.idLokacija
    JOIN Uporabnik u ON p.TK_Voznik = u.IdUporabnik
    WHERE p.IdPrevoz = ?
  `, [prevozId]);

  const [rezervacijeRows] = await pool.execute(`
    SELECT 
      r.*,
      u.Ime AS Potnik_ime,
      u.Priimek AS Potnik_priimek
    FROM Rezervacija r
    JOIN Uporabnik u ON r.TK_Putnik = u.IdUporabnik
    WHERE r.TK_Prevoz = ?
  `, [prevozId]);

  const [oceneRows] = await pool.execute(`
    SELECT 
      o.*,
      u.Ime AS Ocenjevalec_ime,
      u.Priimek AS Ocenjevalec_priimek
    FROM Ocena o
    JOIN Uporabnik u ON o.TK_Uporabnik = u.IdUporabnik
    WHERE o.TK_Prevoz = ?
  `, [prevozId]);

  return {
    prevoz: prevozRows[0] || null,
    rezervacije: rezervacijeRows,
    ocene: oceneRows,
  }}