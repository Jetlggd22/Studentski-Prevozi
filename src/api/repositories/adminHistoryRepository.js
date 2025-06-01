// In StudentskiPrevoz/src/api/repositories/adminHistoryRepository.js
import pool from "../db/pool.js";
export async function getAllRideHistories() {
  const [rides] = await pool.execute(`
    SELECT
      p.idPrevoz AS IdPrevoz,
      p.Cas_odhoda,
      p.Cena,
      p.Prosta_mesta,        -- <<<< MUST BE PRESENT
      p.TK_Voznik,
      u.Ime AS Voznik_ime,
      u.Priimek AS Voznik_priimek,
      u.Ocena AS Voznik_ocena,   -- <<<< MUST BE PRESENT
      u.Avto AS Voznik_avto,     -- <<<< MUST BE PRESENT
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
    // ... (passenger fetching logic remains the same)
    const [passengers] = await pool.execute(`
      SELECT
        r.idRezervacija AS idRezervacija,
        u.idUporabnik AS idPotnik,
        u.Ime AS Potnik_ime,
        u.Priimek AS Potnik_priimek,
        o_user.Ocena AS Ocena_za_voznika,
        o_user.Komentar AS Komentar_za_voznika,
        o_driver.Ocena AS Ocena_voznika_za_potnika,
        o_driver.Komentar AS Komentar_voznika_za_potnika
      FROM Rezervacija r
      JOIN Uporabnik u ON r.TK_Potnik = u.idUporabnik
      LEFT JOIN Ocena o_user
        ON o_user.TK_Prevoz = r.TK_Prevoz
        AND o_user.TK_Rezervacija IS NULL
      LEFT JOIN Ocena o_driver
        ON o_driver.TK_Rezervacija = r.idRezervacija
        AND o_driver.TK_Prevoz IS NULL
      WHERE r.TK_Prevoz = ?
    `, [ride.IdPrevoz]);

    histories.push({
      ...ride, // This now correctly includes Prosta_mesta, Voznik_ocena, Voznik_avto
      potniki: passengers
    });
  }
  return histories;
}