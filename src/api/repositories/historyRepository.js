import pool from "../db/pool.js";
export async function getUserRideHistory(userId) {
  const [rows] = await pool.execute(`
    SELECT 
  p.idPrevoz, 
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
  END AS Vloga,
  CASE
    WHEN p.TK_Voznik = ? THEN o2.Ocena
    ELSE o1.Ocena
  END AS Ocena
FROM Prevoz p
JOIN Lokacija l1 ON p.TK_Lokacija_Odhod = l1.idLokacija
JOIN Lokacija l2 ON p.TK_Lokacija_Prihod = l2.idLokacija
LEFT JOIN Rezervacija r ON p.idPrevoz = r.TK_Prevoz AND r.TK_Potnik = ?
LEFT JOIN Ocena o1 ON o1.TK_Rezervacija = r.idRezervacija
LEFT JOIN Ocena o2 ON o2.TK_Prevoz = p.idPrevoz
WHERE p.TK_Voznik = ? OR r.TK_Potnik = ?
ORDER BY p.Cas_odhoda DESC
  `, [userId, userId, userId, userId, userId, userId, userId]);

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
    JOIN Lokacija l1 ON p.TK_Lokacija_Odhod = l1.idLokacija
    JOIN Lokacija l2 ON p.TK_Lokacija_Prihoda = l2.idLokacija
    JOIN Uporabnik u ON p.TK_Voznik = u.IdUporabnik
    WHERE p.IdPrevoz = ?
  `, [prevozId]);

  const [rezervacijeRows] = await pool.execute(`
    SELECT 
      r.*,
      u.Ime AS Potnik_ime,
      u.Priimek AS Potnik_priimek,
      o.Ocena AS Ocena_potnika
    FROM Rezervacija r
    JOIN Uporabnik u ON r.TK_Potnik = u.IdUporabnik
    LEFT JOIN Ocena o ON o.TK_Rezervacija = r.idRezervacija
    WHERE r.TK_Prevoz = ?
  `, [prevozId]);

  const [voznikOceneRows] = await pool.execute(`
    SELECT AVG(Ocena) AS Povprecna_ocena_voznika
    FROM Ocena
    WHERE TK_Prevoz = ?
  `, [prevozId]);

  return {
    prevoz: prevozRows[0] || null,
    rezervacije: rezervacijeRows,
    ocena_voznika: voznikOceneRows[0]?.Povprecna_ocena_voznika || null,
  }
}
