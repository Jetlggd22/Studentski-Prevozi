const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database connection, use pools for better performance and multiple connections if necessary
// REPLACE NAMES WHEN FINAL DECISION IS MADE 
const pool = mysql.createPool({
  host: 'localhost',
  user: 'passione',
  password: '',
  database: 'Studentski_Prevozi'
});

// Router to get user's ride history through use specific ID
router.get('/api/zgodovina/uporabnik/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user's ride history (both as driver and passenger)
    const [rows] = await pool.execute(`
      SELECT 
        p.IdPrevoz, 
        p.Cas_odhoda, 
        p.Cena, 
        l1.Ime AS Odhod, 
        l2.Ime AS Prihod,
        r.Status,
        r.Ustvarjeno AS Datum_rezervacije,
        'Potnik' AS Vloga
      FROM Rezervacija r
      JOIN Prevoz p ON r.TK_Prevoz = p.IdPrevoz
      JOIN Lokacija l1 ON p.TK_Lokacija_Odhoda = l1.idLokacija
      JOIN Lokacija l2 ON p.TK_Lokacija_Prihoda = l2.idLokacija
      WHERE r.TK_Putnik = ?
      
      UNION
      
      SELECT 
        p.IdPrevoz, 
        p.Cas_odhoda, 
        p.Cena, 
        l1.Ime AS Odhod, 
        l2.Ime AS Prihod,
        'Izveden' AS Status,
        p.Cas_odhoda AS Datum_rezervacije,
        'Voznik' AS Vloga
      FROM Prevoz p
      JOIN Lokacija l1 ON p.TK_Lokacija_Odhoda = l1.idLokacija
      JOIN Lokacija l2 ON p.TK_Lokacija_Prihoda = l2.idLokacija
      WHERE p.TK_Voznik = ?
      
      ORDER BY Cas_odhoda DESC
    `, [userId, userId]);
    
    // Return all data
    res.json({
      success: true,
      data: rows
    });
  } 
  // Catch any errors and return a 500 status code
  catch (error) {
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
      JOIN Lokacija l1 ON p.TK_Lokacija_Odhoda = l1.idLokacija
      JOIN Lokacija l2 ON p.TK_Lokacija_Prihoda = l2.idLokacija
      JOIN Uporabnik u ON p.TK_Voznik = u.IdUporabnik
      WHERE p.IdPrevoz = ?
    `, [prevozId]);
    
    // Get reservations for this ride
    const [rezervacijeRows] = await pool.execute(`
      SELECT 
        r.*,
        u.Ime AS Potnik_ime,
        u.Priimek AS Potnik_priimek
      FROM Rezervacija r
      JOIN Uporabnik u ON r.TK_Putnik = u.IdUporabnik
      WHERE r.TK_Prevoz = ?
    `, [prevozId]);
    
    // Get ratings for this ride
    const [oceneRows] = await pool.execute(`
      SELECT * FROM Ocena WHERE TK_Prevoz = ?
    `, [prevozId]);
    
    
    // Return ride details, reservations, and ratings
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
// Export the router to use in the main app
module.exports = router;