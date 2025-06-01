import pool from '../db/pool.js';

/**
 * Ustvari novo rezervacijo v bazi podatkov.
 * @param {object} rezervacijaData Podatki za rezervacijo.
 * @param {number} rezervacijaData.TK_Prevoz ID prevoza.
 * @param {string} rezervacijaData.TK_Potnik ID potnika.
 * @returns {Promise<number>} ID ustvarjene rezervacije.
 */
export async function createRezervacija({ TK_Prevoz, TK_Potnik }) {
  const status = 'čaka'; // Privzeti status
  // 'Ustvarjeno' bo samodejno nastavljen z DEFAULT CURRENT_TIMESTAMP, če je tako v shemi,
  // ali pa ga lahko eksplicitno nastavimo tukaj z NOW() v SQL.
  // Ker zame.sql nima DEFAULT CURRENT_TIMESTAMP za Ustvarjeno, ga bomo dodali.
  // V db.sql je Ustvarjeno TIMESTAMP DEFAULT CURRENT_TIMESTAMP

  // Preverimo, katero shemo uporabljamo za 'Ustvarjeno'
  // Glede na zame.sql, Ustvarjeno je DATETIME in nima privzete vrednosti.
  // Glede na db.sql, Ustvarjeno je TIMESTAMP DEFAULT CURRENT_TIMESTAMP.
  // Za združljivost z zame.sql, bomo vrednost 'Ustvarjeno' posredovali.
  
  const sql = `
    INSERT INTO Rezervacija (Status, Ustvarjeno, TK_Prevoz, TK_Potnik) 
    VALUES (?, NOW(), ?, ?)
  `;
  // Opomba: Če idRezervacija ni AUTO_INCREMENT v zame.sql, boste morali
  // zagotoviti vrednost za idRezervacija ali prilagoditi tabelo.
  // db.sql ima IdRezervacija AUTO_INCREMENT, zato bo to delovalo z njo.
  // Za zame.sql, če idRezervacija ni auto_increment, bo ta INSERT spodletel brez idRezervacija.
  // Za potrebe te naloge predvidevam, da boste posodobili zame.sql, da bo imel idRezervacija AUTO_INCREMENT
  // ali pa da je že poskrbljeno za generiranje ID-ja.
  // Če zame.sql uporablja `idRezervacija INT PRIMARY KEY` brez AUTO_INCREMENT,
  // potem je potrebno to poizvedbo spremeniti, da vključi tudi idRezervacija,
  // ki bi ga morali nekako generirati.
  // Za zdaj predvidevam, da je ID samodejno generiran.

  const [result] = await pool.execute(sql, [status, TK_Prevoz, TK_Potnik]);
  return result.insertId;
}

/**
 * Preveri, če uporabnik že ima aktivno rezervacijo za ta prevoz.
 * @param {number} TK_Prevoz ID prevoza.
 * @param {string} TK_Potnik ID potnika.
 * @returns {Promise<boolean>} True, če rezervacija že obstaja, sicer false.
 */
export async function checkIfReservationExists(TK_Prevoz, TK_Potnik) {
  const sql = `
    SELECT idRezervacija 
    FROM Rezervacija 
    WHERE TK_Prevoz = ? AND TK_Potnik = ? AND Status IN ('čaka', 'potrjeno')
  `;
  const [rows] = await pool.execute(sql, [TK_Prevoz, TK_Potnik]);
  return rows.length > 0;
}



/**
 * Posodobi status rezervacije.
 * @param {number} idRezervacija ID rezervacije.
 * @param {string} status Novi status.
 * @returns {Promise<number>} Število posodobljenih vrstic.
 */
export async function updateRezervacijaStatus(idRezervacija, status) {
  const sql = `UPDATE Rezervacija SET Status = ? WHERE idRezervacija = ?`;
  const [result] = await pool.execute(sql, [status, idRezervacija]);
  return result.affectedRows;
}

/**
 * Najde uporabnikovo rezervacijo za določen prevoz.
 * @param {string} TK_Potnik ID potnika.
 * @param {number} TK_Prevoz ID prevoza.
 * @returns {Promise<object|null>} Podatki o rezervaciji ali null.
 */
export async function findUserRezervacijaForPrevoz(TK_Potnik, TK_Prevoz) {
  const sql = `
    SELECT idRezervacija, Status 
    FROM Rezervacija 
    WHERE TK_Potnik = ? AND TK_Prevoz = ? 
    ORDER BY Ustvarjeno DESC LIMIT 1 
  `;
  const [rows] = await pool.execute(sql, [TK_Potnik, TK_Prevoz]);
  return rows.length > 0 ? rows[0] : null;
}