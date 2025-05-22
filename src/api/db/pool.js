import mysql from "mysql2/promise"


//ovo smenite za vas lokalno
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'studentski_prevoz'
});


export default pool
