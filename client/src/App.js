import { useState, useEffect } from 'react'
import './App.css'

const API_URL = '/api/users'

function UsersTable({ users, onWarn, onDelete, showDelete }) {
  return (
    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
      <thead>
        <tr style={{background: '#dee2e6'}}>
          <th style={{padding: '8px', textAlign: 'left'}}>Ім'я</th>
          <th style={{padding: '8px'}}>Role</th>
          <th style={{padding: '8px'}}>⚠️</th>
          <th style={{padding: '8px'}}>Дії</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id} style={{borderBottom: '1px solid #ddd'}}>
            <td style={{padding: '8px'}}>{u.name}</td>
            <td style={{padding: '8px', textAlign: 'center'}}>{u.role}</td>
            <td style={{padding: '8px', textAlign: 'center', color: '#dc3545', fontWeight: 'bold'}}>{u.warnings}</td>
            <td style={{padding: '8px', textAlign: 'center'}}>
              <div style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                <button className="back-btn" onClick={() => onWarn(u.name)} style={{padding: '4px 8px', fontSize: '0.8rem', margin: 0, background: '#ffc107', color: '#000'}}>Warn</button>
                {showDelete && (
                  <button className="back-btn" onClick={() => onDelete(u.name)} style={{padding: '4px 8px', fontSize: '0.8rem', margin: 0, background: '#dc3545', color: '#fff'}}>Del</button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function UserPage() {
  const [myName, setMyName] = useState('')
  const [info, setInfo] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const checkStatus = async () => {
    if (!myName) return setErrorMsg("Введіть ім'я")
    const res = await fetch(`${API_URL}/${myName}`)
    const data = await res.json()
    if (data.length > 0) {
      setInfo(data[0])
      setErrorMsg('')
    } else {
      setInfo(null)
      setErrorMsg("Не знайдено")
    }
  }

  return (
    <div className="content-section">
      <h2>Мій кабінет</h2>
      <input type="text" placeholder="Ваше ім'я..." value={myName} onChange={e => setMyName(e.target.value)} />
      <button className="back-btn" onClick={checkStatus} style={{background: '#007bff', color: 'white'}}>Перевірити</button>
      {errorMsg && <p style={{color: '#dc3545', marginTop: '10px'}}>{errorMsg}</p>}
      {info && (
        <div className="result" style={{marginTop: '15px'}}>
          <strong>Ім'я:</strong> {info.name} <br/>
          <strong>Попередження:</strong> {info.warnings}
        </div>
      )}
    </div>
  )
}

function AdminPage({ setLog }) {
  const [users, setUsers] = useState([])

  const loadUsers = async () => {
    const res = await fetch(API_URL)
    const data = await res.json()
    setUsers(data)
  }

  useEffect(() => { loadUsers() }, [])

  const giveWarning = async (name) => {
    await fetch(`${API_URL}/warn`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name })
    })
    setLog(`Виписано попередження: ${name}`)
    loadUsers()
  }

  return (
    <div className="content-section">
      <h2>Панель Модерації</h2>
      <UsersTable users={users} onWarn={giveWarning} showDelete={false} />
    </div>
  )
}

function SuperAdminPage({ setLog }) {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [role, setRole] = useState('USER')

  const loadUsers = async () => {
    const res = await fetch(API_URL)
    const data = await res.json()
    setUsers(data)
  }

  useEffect(() => { loadUsers() }, [])

  const addUser = async () => {
    if (!name) return setLog("Введіть ім'я")
    await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, role })
    })
    setLog(`Додано: ${name}`)
    setName('')
    loadUsers()
  }

  const deleteUser = async (userName) => {
    await fetch(`${API_URL}/${userName}`, { method: 'DELETE' })
    setLog(`Видалено: ${userName}`)
    loadUsers()
  }

  const giveWarning = async (userName) => {
    await fetch(`${API_URL}/warn`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: userName })
    })
    setLog(`Warn: ${userName}`)
    loadUsers()
  }

  return (
    <div className="content-section">
      <h2>Керування системою</h2>
      <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
        <input type="text" placeholder="Ім'я нового юзера" value={name} onChange={e => setName(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <button className="back-btn" onClick={addUser} style={{background: '#28a745', color: 'white', width: '100%', marginTop: '10px'}}>Створити</button>
      </div>
      <UsersTable users={users} onWarn={giveWarning} onDelete={deleteUser} showDelete={true} />
    </div>
  )
}

function App() {
  const [currentRole, setCurrentRole] = useState('USER')
  const [log, setLog] = useState('...')

  return (
    <div className="page">
      <h1>Практична робота 8</h1>
      <p className="subtitle">ІПЗ-3.03 | Матвєєнко Олександра</p>

      <div className="options">
        <button className={currentRole === 'USER' ? 'active' : ''} onClick={() => setCurrentRole('USER')}>User</button>
        <button className={currentRole === 'ADMIN' ? 'active' : ''} onClick={() => setCurrentRole('ADMIN')}>Admin</button>
        <button className={currentRole === 'SUPER_ADMIN' ? 'active' : ''} onClick={() => setCurrentRole('SUPER_ADMIN')}>Super Admin</button>
      </div>

      <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #eee'}} />

      <div className="view-container">
        {currentRole === 'USER' && <UserPage />}
        {currentRole === 'ADMIN' && <AdminPage setLog={setLog} />}
        {currentRole === 'SUPER_ADMIN' && <SuperAdminPage setLog={setLog} />}
      </div>

      {currentRole !== 'USER' && (
        <div style={{marginTop: '20px'}}>
          <h3 style={{textAlign: 'left', fontSize: '1rem'}}>Лог:</h3>
          <div className="result">{log}</div>
        </div>
      )}
    </div>
  )
}

export default App