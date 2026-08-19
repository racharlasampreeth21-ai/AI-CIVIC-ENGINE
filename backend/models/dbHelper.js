const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

// Helper to read database
function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      const initialDb = { sessions: [], rtiDrafts: [], formSubmissions: [] };
      fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), 'utf8');
      return initialDb;
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local database:', error);
    return { sessions: [], rtiDrafts: [], formSubmissions: [] };
  }
}

// Helper to write database
function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to local database:', error);
    return false;
  }
}

// Session CRUD helper functions
const dbHelper = {
  getSessions: () => {
    return readDb().sessions;
  },

  getSession: (id) => {
    return readDb().sessions.find(s => s.id === id);
  },

  saveSession: (session) => {
    const db = readDb();
    const index = db.sessions.findIndex(s => s.id === session.id);
    if (index !== -1) {
      db.sessions[index] = { ...db.sessions[index], ...session, updatedAt: new Date().toISOString() };
    } else {
      session.createdAt = new Date().toISOString();
      session.updatedAt = new Date().toISOString();
      db.sessions.push(session);
    }
    writeDb(db);
    return session;
  },

  getRtiDrafts: () => {
    return readDb().rtiDrafts;
  },

  saveRtiDraft: (draft) => {
    const db = readDb();
    const index = db.rtiDrafts.findIndex(d => d.id === draft.id);
    if (index !== -1) {
      db.rtiDrafts[index] = { ...db.rtiDrafts[index], ...draft, updatedAt: new Date().toISOString() };
    } else {
      draft.createdAt = new Date().toISOString();
      draft.updatedAt = new Date().toISOString();
      db.rtiDrafts.push(draft);
    }
    writeDb(db);
    return draft;
  },

  deleteSession: (id) => {
    const db = readDb();
    db.sessions = db.sessions.filter(s => s.id !== id);
    writeDb(db);
    return true;
  }
};

module.exports = dbHelper;
