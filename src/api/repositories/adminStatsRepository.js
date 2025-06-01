import pool from '../db/pool.js';

export async function getUserCount() {
  const [rows] = await pool.execute('SELECT COUNT(*) AS userCount FROM Uporabnik');
  return rows[0]?.userCount || 0;
}

export async function getActiveRidesCount() {
  const [rows] = await pool.execute('SELECT COUNT(*) AS rideCount FROM Prevoz WHERE Cas_odhoda > NOW()');
  return rows[0]?.rideCount || 0;
}

export async function getAverageRating() {
  const [rows] = await pool.execute('SELECT ROUND(AVG(Ocena), 2) AS avgRating FROM Ocena');
  return rows[0]?.avgRating || 0;
}