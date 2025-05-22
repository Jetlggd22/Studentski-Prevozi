import pool from "../db/pool.js";

export async function getAllPrevozi() {
  const [rows] = await pool.query(`
    SELECT 
      p.IdPrevoz, p.Cas_odhoda, p.Cena, p.Prosta_mesta, 
      o.Ime AS ime_odhod, 
      d.Ime AS ime_prihod,
      CONCAT(u.Ime, ' ', u.Priimek) AS voznik
    FROM Prevoz p
    JOIN Lokacija o ON p.TK_Lokacija_Odhoda = o.idLokacija
    JOIN Lokacija d ON p.TK_Lokacija_Prihoda = d.idLokacija
    JOIN Uporabnik u ON p.TK_Voznik = u.IdUporabnik
  `);
  return rows;
i}

export async function findPrevozById(id) {
  try {
    const [rows] = await pool.query(`
SELECT 
  p.*,
  
  lo.idLokacija AS Odhod_idLokacija,
  lo.Ime AS Odhod_Ime,
  lo.Longitude AS Odhod_Longitude,
  lo.Latitude AS Odhod_Latitude,
  
  lp.idLokacija AS Prihod_idLokacija,
  lp.Ime AS Prihod_Ime,
  lp.Longitude AS Prihod_Longitude,
  lp.Latitude AS Prihod_Latitude,
  
  u.idUporabnik AS Voznik_idUporabnik,
  u.Ime AS Voznik_Ime,
  u.Priimek AS Voznik_Priimek,
  u.Username AS Voznik_Username,
  u.Telefon AS Voznik_Telefon,
  u.Ocena AS Voznik_Ocena,
  u.Datum_registriranja AS Voznik_Datum_registriranja,
  u.Avto AS Voznik_Avto

FROM Prevoz p
LEFT JOIN Lokacija lo ON p.TK_Lokacija_Odhod = lo.idLokacija
LEFT JOIN Lokacija lp ON p.TK_Lokacija_Prihod = lp.idLokacija
LEFT JOIN Uporabnik u ON p.TK_Voznik = u.idUporabnik

WHERE p.idPrevoz = '1';

    `, [id]);

    return rows.length ? rows[0] : null;

  } catch (err) {
    console.error('Repository error (join):', err);
    throw err;
  }
}