// repositories/adminHistoryRepository.js
import pool from "../db/pool.js";

export async function getAllRideHistories() {
  // Pridobimo vse prevoze iz sistema
  const [rides] = await pool.execute(`
    SELECT
      p.idPrevoz AS IdPrevoz,
      p.Cas_odhoda,
      p.Cena,
      p.TK_Voznik,
      u.Ime AS Voznik_ime,
      u.Priimek AS Voznik_priimek,
      l1.Ime AS Lokacija_odhoda,
      l2.Ime AS Lokacija_prihoda
    FROM Prevoz p
    JOIN Uporabnik u ON p.TK_Voznik = u.idUporabnik
    JOIN Lokacija l1 ON p.TK_Lokacija_Odhod = l1.idLokacija
    JOIN Lokacija l2 ON p.TK_Lokacija_Prihod = l2.idLokacija
    ORDER BY p.Cas_odhoda DESC
  `);

  const histories = [];

  for (const ride of rides) {
    // Za vsak prevoz pridobimo seznam potnikov z ocenami in komentarji
    const [passengers] = await pool.execute(`
      SELECT
        r.idRezervacija AS idRezervacija,
        u.idUporabnik AS idUporabnik,
        u.Ime AS Potnik_ime,
        u.Priimek AS Potnik_priimek,
        o1.Ocena AS Ocena_za_voznika,
        o1.Komentar AS Komentar_potnika,
        o2.Ocena AS Ocena_voznika_za_potnika
      FROM Rezervacija r
      JOIN Uporabnik u ON r.TK_Potnik = u.idUporabnik
      LEFT JOIN Ocena o1 ON o1.TK_Rezervacija = r.idRezervacija
      LEFT JOIN Ocena o2 ON o2.TK_Prevoz = r.TK_Prevoz AND o2.TK_Rezervacija IS NULL
      WHERE r.TK_Prevoz = ?
    `, [ride.IdPrevoz]);

    histories.push({
      ...ride,
      potniki: passengers
    });
  }

  return histories;
}
