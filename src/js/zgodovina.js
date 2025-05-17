const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Ustvari povezavo na bazo
const pool = mysql.createPool({
  host: 'localhost',
  user: 'passione',
  password: '',
  database: 'Studentski_Prevozi'
});

// GET: Zgodovina prevozov za uporabnika (voznik in potnik), z ocenami in komentarji
router.get('/api/zgodovina/uporabnik/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Pridobi vse prevoze kot potnik z ocenami
    const [potnikRows] = await pool.execute(`
      SELECT 
        p.IdPrevoz,
        p.Cas_odhoda,
        p.Cena,
        l1.Ime AS Odhod,
        l2.Ime AS Prihod,
        r.Status,
        r.Ustvarjeno AS Datum_rezervacije,
        'Potnik' AS Vloga,
        o.Ocena,
        o.Komentar
      FROM Rezervacija r
      JOIN Prevoz p ON r.TK_Prevoz = p.IdPrevoz
      JOIN Lokacija l1 ON p.TK_Lokacija_Odhoda = l1.idLokacija
      JOIN Lokacija l2 ON p.TK_Lokacija_Prihoda = l2.idLokacija
      LEFT JOIN Ocena o ON o.TK_Rezervacija = r.IdRezervacija
      WHERE r.TK_Putnik = ?
    `, [userId]);

    // Pridobi vse prevoze kot voznik z ocenami
    const [voznikRows] = await pool.execute(`
      SELECT 
        p.IdPrevoz,
        p.Cas_odhoda,
        p.Cena,
        l1.Ime AS Odhod,
        l2.Ime AS Prihod,
        'Izveden' AS Status,
        p.Cas_odhoda AS Datum_rezervacije,
        'Voznik' AS Vloga,
        AVG(o.Ocena) AS Ocena,
        GROUP_CONCAT(o.Komentar SEPARATOR ' || ') AS Komentar
      FROM Prevoz p
      JOIN Lokacija l1 ON p.TK_Lokacija_Odhoda = l1.idLokacija
      JOIN Lokacija l2 ON p.TK_Lokacija_Prihoda = l2.idLokacija
      LEFT JOIN Ocena o ON o.TK_Prevoz = p.IdPrevoz
      WHERE p.TK_Voznik = ?
      GROUP BY p.IdPrevoz
    `, [userId]);

    // Združi potnik in voznik rezultate
    const combined = [...potnikRows, ...voznikRows].sort((a, b) =>
      new Date(b.Cas_odhoda) - new Date(a.Cas_odhoda)
    );

    // Izračunaj povprečno oceno uporabnika (če je bil kdaj ocenjen)
    const [avgOcenaRows] = await pool.execute(`
      SELECT AVG(Ocena) AS Povprecna_Ocena
      FROM Ocena o
      JOIN Rezervacija r ON o.TK_Rezervacija = r.IdRezervacija
      WHERE r.TK_Putnik = ?
      UNION ALL
      SELECT AVG(Ocena)
      FROM Ocena o
      JOIN Prevoz p ON o.TK_Prevoz = p.IdPrevoz
      WHERE p.TK_Voznik = ?
    `, [userId, userId]);

    // Povprečje obeh vlog
    const ocene = avgOcenaRows.map(row => row.Povprecna_Ocena).filter(Boolean);
    const povprecnaOcena = ocene.length > 0
      ? (ocene.reduce((a, b) => a + b, 0) / ocene.length).toFixed(2)
      : null;

    // Odgovor
    res.json({
      success: true,
      povprecna_ocena: povprecnaOcena,
      zgodovina: combined
    });
  } catch (error) {
    console.error('Napaka pri pridobivanju zgodovine:', error);
    res.status(500).json({
      success: false,
      message: 'Napaka pri pridobivanju zgodovine uporabnika.'
    });
  }
});

module.exports = router;
