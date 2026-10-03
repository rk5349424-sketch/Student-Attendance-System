const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Database connection
const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'RaniDB',
  password: 'Rani@123',
  port: 5432
});



app.get('/students', async (req, res) => {
  const date = req.query.date;

  try {
    const sql = `
      SELECT s.id, s.name,
             COALESCE(a.status, 'Not Marked') AS status
      FROM student s
      LEFT JOIN attendance a
      ON s.id = a.student_id AND a.date = $1
      ORDER BY s.id
    `;

    const result = await db.query(sql, [date]);
    res.json(result.rows);

  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).send("Error fetching students");
  }
});

app.post('/students', async (req, res) => {
  const { name } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO student(name) VALUES($1) RETURNING id, name',
      [name]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error("INSERT ERROR:", err);
    res.status(500).send("Error adding student");
  }
});

app.post('/attendance', async (req, res) => {
  const { student_id, date, status } = req.body;

  try {
    const sql = `
      INSERT INTO attendance(student_id, date, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (student_id, date)
      DO UPDATE SET status = EXCLUDED.status
    `;

    await db.query(sql, [student_id, date, status]);

    res.json({ success: true });

  } catch (err) {
    console.error("ATTENDANCE ERROR:", err);
    res.status(500).send("Error saving attendance");
  }
});

app.delete('/students/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await db.query('DELETE FROM attendance WHERE student_id=$1', [id]);

    
    await db.query('DELETE FROM student WHERE id=$1', [id]);

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).send("Error deleting student");
  }
});
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

console.log("Database Connected");