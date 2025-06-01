import pool from '../db/pool.js';

export async function createPrevoz({ from, to, date, seats, price, car, note, voznikId }) {
  // Prvo pronađi ID-jeve lokacija (ili ih kreiraj ako ih nema)
  const [fromLoc] = await pool.execute('SELECT idLokacija FROM Lokacija WHERE Ime=?', [from]);
  const [toLoc] = await pool.execute('SELECT idLokacija FROM Lokacija WHERE Ime=?', [to]);
  if (!fromLoc.length || !toLoc.length) throw new Error('Lokacija ne obstaja.');

  // Kreiraj prevoz
  const [result] = await pool.execute(
    `INSERT INTO Prevoz (Cas_odhoda, Cena, Prosta_mesta, Ponavljanje, TK_Lokacija_Odhod, TK_Lokacija_Prihod, TK_Voznik)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [date, price, seats, note || '', fromLoc[0].idLokacija, toLoc[0].idLokacija, voznikId]
  );
  return result.insertId;
}