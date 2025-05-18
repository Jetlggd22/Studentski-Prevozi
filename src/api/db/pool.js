import mysql from "mysql2/promise"


//ovo smenite za vas lokalno
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_root_password',
  database: 'studentski_prevoz'
});


export default pool
