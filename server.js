import express, { json } from 'express'
import sqlite3Module from 'sqlite3'
import cors from 'cors'

const sqlite3 = sqlite3Module.verbose()
const app = express()

app.use(json())
app.use(cors())

class Logger {
  static log(action, details) {
    const time = new Date().toLocaleTimeString('uk-UA')
    console.log(`[${time}] [${action}] ${details}`)
  }
}

class SQLiteDB {
  constructor() {
    this.db = new sqlite3.Database('./database.sqlite')
    this.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT,
      warnings INTEGER DEFAULT 0
    )`)
  }

  insert(user) {
    return new Promise((resolve, reject) => {
      this.db.run(`INSERT INTO users (name, role, warnings) VALUES (?, ?, 0)`, 
        [user.name, user.role], err => err ? reject(err) : resolve())
    })
  }

  getAll() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM users`, [], (err, rows) => err ? reject(err) : resolve(rows))
    })
  }

  find(name) {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM users WHERE name = ?`, [name], (err, rows) => err ? reject(err) : resolve(rows))
    })
  }

  addWarning(name) {
    return new Promise((resolve, reject) => {
      this.db.run(`UPDATE users SET warnings = warnings + 1 WHERE name = ?`, [name], err => err ? reject(err) : resolve())
    })
  }

  delete(name) {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM users WHERE name = ?`, [name], err => err ? reject(err) : resolve())
    })
  }
}

const db = new SQLiteDB()

app.get('/api/users', async (req, res) => {
  const users = await db.getAll()
  res.json(users)
})

app.get('/api/users/:name', async (req, res) => {
  const users = await db.find(req.params.name)
  res.json(users)
})

app.post('/api/users', async (req, res) => {
  const { name, role } = req.body
  await db.insert({ name, role })
  Logger.log('CREATE', `Додано користувача ${name}`)
  res.json({ message: 'Користувача додано' })
})

app.post('/api/users/warn', async (req, res) => {
  await db.addWarning(req.body.name)
  Logger.log('WARN', `Попередження для ${req.body.name}`)
  res.json({ message: 'Попередження виписано' })
})

app.delete('/api/users/:name', async (req, res) => {
  await db.delete(req.params.name)
  Logger.log('DELETE', `Видалено ${req.params.name}`)
  res.json({ message: 'Видалено' })
})

app.listen(5000, () => {
  console.log('Бекенд запущено на http://localhost:5000')
  Logger.log('SYSTEM', 'Система логування активна')
})