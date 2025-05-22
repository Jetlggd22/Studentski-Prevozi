const express = require('express');
const router = express.Router();
const db = require('../db'); // Assume MySQL connection pool

router.get('/api/prevozi', async (req, res) => {
  try {
    const [rows] = await db.query(`
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
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Napaka pri nalaganju prevozov" });
  }
});

module.exports = router;
