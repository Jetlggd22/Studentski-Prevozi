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