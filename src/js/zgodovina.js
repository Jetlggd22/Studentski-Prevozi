const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'passione',
  password: '',
  database: 'studentski_prevoz' // Changed to match your SQL file
});

// Get user's ride history
router.get('http://localhost:3000/api/zgodovina/uporabnik/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user's ride history (both as driver and passenger)
    const [rows] = await pool.execute(`
      SELECT 
        p.idPrevoz, 
        p.Cas_odhoda, 
        p.Cena, 
        l1.Ime AS Odhod, 
        l2.Ime AS Prihod,
        r.Status,
        r.Ustvarjeno AS Datum_rezervacije,
        'Potnik' AS Vloga
      FROM Rezervacija r
      JOIN Prevoz p ON r.TK_Prevoz = p.idPrevoz
      JOIN Lokacija l1 ON p.TK_Lokacija_Odhod = l1.idLokacija
      JOIN Lokacija l2 ON p.TK_Lokacija_Prihod = l2.idLokacija
      JOIN Uporabnik u ON r.TK_Potnik = u.idUporabnik
      WHERE r.TK_Potnik = ?
      
      UNION
      
      SELECT 
        p.idPrevoz, 
        p.Cas_odhoda, 
        p.Cena, 
        l1.Ime AS Odhod, 
        l2.Ime AS Prihod,
        'Izveden' AS Status,
        p.Cas_odhoda AS Datum_rezervacije,
        'Voznik' AS Vloga
      FROM Prevoz p
      JOIN Lokacija l1 ON p.TK_Lokacija_Odhod = l1.idLokacija
      JOIN Lokacija l2 ON p.TK_Lokacija_Prihod = l2.idLokacija
      JOIN Uporabnik u ON p.TK_Voznik = u.idUporabnik
      WHERE p.TK_Voznik = ?
      
      ORDER BY Cas_odhoda DESC
    `, [userId, userId]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching zgodovina:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching zgodovina'
    });
  }
});

// Get ride details with reservations and ratings
router.get('/api/zgodovina/prevoz/:id', async (req, res) => {
  try {
    const prevozId = req.params.id;
    
    // Get ride details
    const [prevozRows] = await pool.execute(`
      SELECT 
        p.*,
        l1.Ime AS Odhod_lokacija,
        l2.Ime AS Prihod_lokacija,
        u.Ime AS Voznik_ime,
        u.Priimek AS Voznik_priimek
      FROM Prevoz p
      JOIN Lokacija l1 ON p.TK_Lokacija_Odhod = l1.idLokacija
      JOIN Lokacija l2 ON p.TK_Lokacija_Prihod = l2.idLokacija
      JOIN Uporabnik u ON p.TK_Voznik = u.idUporabnik
      WHERE p.idPrevoz = ?
    `, [prevozId]);
    
    // Get reservations for this ride
    const [rezervacijeRows] = await pool.execute(`
      SELECT 
        r.*,
        u.Ime AS Potnik_ime,
        u.Priimek AS Potnik_priimek
      FROM Rezervacija r
      JOIN Uporabnik u ON r.TK_Potnik = u.idUporabnik
      WHERE r.TK_Prevoz = ?
    `, [prevozId]);
    
    // Get ratings for this ride
    const [oceneRows] = await pool.execute(`
      SELECT 
        o.*,
        u.Ime AS Ocenjevalec_ime,
        u.Priimek AS Ocenjevalec_priimek
      FROM Ocena o
      LEFT JOIN Rezervacija r ON o.TK_Rezervacija = r.idRezervacija
      LEFT JOIN Uporabnik u ON r.TK_Potnik = u.idUporabnik
      WHERE o.TK_Prevoz = ?
    `, [prevozId]);
    
    res.json({
      success: true,
      data: {
        prevoz: prevozRows[0] || null,
        rezervacije: rezervacijeRows,
        ocene: oceneRows
      }
    });
  } catch (error) {
    console.error('Error fetching prevoz zgodovina:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prevoz zgodovina'
    });
  }
});

module.exports = router;