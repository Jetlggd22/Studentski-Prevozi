
import pool from '../db/pool.js';

export async function searchDrivers(query, minRating) {
  let sql = `
    SELECT
      u.idUporabnik, u.Ime, u.Priimek, u.Username, u.Telefon, u.Ocena, u.Datum_registriranja, u.Avto,
      COUNT(DISTINCT p.idPrevoz) AS SteviloVozenj,
      (SELECT COUNT(*) FROM Ocena o_check WHERE o_check.TK_Prevoz IS NOT NULL AND o_check.TK_Prevoz IN (SELECT IdPrevoz FROM Prevoz pr_check WHERE pr_check.TK_Voznik = u.idUporabnik)) AS SteviloOcenVoznika
    FROM Uporabnik u
    LEFT JOIN Prevoz p ON u.idUporabnik = p.TK_Voznik
    WHERE 
      (u.Ime LIKE ? OR u.Priimek LIKE ? OR u.Username LIKE ? OR u.Avto LIKE ?) /* Iskanje po imenu, priimku, uporabniškem imenu ali avtu */
      AND u.Avto IS NOT NULL AND u.Avto != '' /* Voznik mora imeti avto */
  `;
  const queryParam = `%${query}%`;
  let params = [queryParam, queryParam, queryParam, queryParam];

  if (minRating && parseFloat(minRating) > 0) { // Filter po minimalni oceni
    sql += ` AND (u.Ocena IS NOT NULL AND u.Ocena >= ?)`;
    params.push(Number(minRating));
  }

  sql += ` 
    GROUP BY u.idUporabnik, u.Ime, u.Priimek, u.Username, u.Telefon, u.Ocena, u.Datum_registriranja, u.Avto /* Grupiranje za pravilno agregacijo */
    HAVING COUNT(DISTINCT p.idPrevoz) > 0 /* Voznik mora imeti vsaj eno vožnjo */
    ORDER BY COALESCE(u.Ocena, 0) DESC, SteviloVozenj DESC /* Sortiranje */
  `;

  const [rows] = await pool.execute(sql, params);
  return rows;
}