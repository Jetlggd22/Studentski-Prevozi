import mysql from "mysql2/promise"


//Ovo promjeniti lokalno za uredjaj
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'studentski_prevoz'
});


export default pool
