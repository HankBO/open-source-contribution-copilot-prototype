import { Repo, Issue, SearchTopic, IssueAnalysis } from '../types';

let db: any = null;

// Initialize the database
export const initDB = async () => {
  if (db) return;

  try {
    // @ts-ignore
    const SQL = await window.initSqlJs({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    db = new SQL.Database();
    createTables();
  } catch (err) {
    console.error("Failed to initialize SQLite:", err);
  }
};

const createTables = () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT UNIQUE,
      created_at TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS repos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER,
      name TEXT,
      description TEXT,
      stars TEXT,
      url TEXT,
      FOREIGN KEY(topic_id) REFERENCES topics(id)
    );`,
    `CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repo_id INTEGER,
      title TEXT,
      url TEXT,
      number TEXT,
      labels TEXT,
      analysis TEXT,
      FOREIGN KEY(repo_id) REFERENCES repos(id)
    );`
  ];

  queries.forEach(q => db.run(q));
};

// --- Topics ---
export const saveTopic = (term: string): number => {
  if (!db) return -1;
  try {
    const existing = db.exec("SELECT id FROM topics WHERE term = ?", [term]);
    if (existing.length > 0) {
      return existing[0].values[0][0] as number;
    }
    db.run("INSERT INTO topics (term, created_at) VALUES (?, ?)", [term, new Date().toISOString()]);
    const res = db.exec("SELECT last_insert_rowid()");
    return res[0].values[0][0] as number;
  } catch (e) {
    console.error(e);
    return -1;
  }
};

export const getTopics = (): SearchTopic[] => {
  if (!db) return [];
  const res = db.exec("SELECT * FROM topics ORDER BY id DESC");
  if (res.length === 0) return [];
  
  return res[0].values.map((v: any[]) => ({
    id: v[0],
    term: v[1],
    created_at: v[2]
  }));
};

// --- Repos ---
export const saveRepo = (repo: Repo, topicId: number): number => {
  if (!db) return -1;
  try {
     // Check if exists to avoid duplicates for this topic
     const existing = db.exec("SELECT id FROM repos WHERE url = ? AND topic_id = ?", [repo.url, topicId]);
     if (existing.length > 0) return existing[0].values[0][0] as number;

    db.run("INSERT INTO repos (topic_id, name, description, stars, url) VALUES (?, ?, ?, ?, ?)", 
      [topicId, repo.name, repo.description, repo.stars, repo.url]);
    const res = db.exec("SELECT last_insert_rowid()");
    return res[0].values[0][0] as number;
  } catch(e) {
    console.error(e);
    return -1;
  }
};

export const getReposByTopic = (topicId: number): Repo[] => {
  if (!db) return [];
  const res = db.exec("SELECT * FROM repos WHERE topic_id = ?", [topicId]);
  if (res.length === 0) return [];
  return res[0].values.map((v: any[]) => ({
    id: v[0],
    topic_id: v[1],
    name: v[2],
    description: v[3],
    stars: v[4],
    url: v[5]
  }));
};

// --- Issues ---
export const saveIssue = (issue: Issue, repoId: number): number => {
  if (!db) return -1;
  try {
    const existing = db.exec("SELECT id FROM issues WHERE url = ?", [issue.url]);
    if (existing.length > 0) return existing[0].values[0][0] as number;

    db.run("INSERT INTO issues (repo_id, title, url, number, labels, analysis) VALUES (?, ?, ?, ?, ?, ?)", 
      [repoId, issue.title, issue.url, issue.number, JSON.stringify(issue.labels), issue.analysis ? JSON.stringify(issue.analysis) : null]);
    const res = db.exec("SELECT last_insert_rowid()");
    return res[0].values[0][0] as number;
  } catch (e) {
    console.error(e);
    return -1;
  }
};

export const getIssuesByRepo = (repoId: number): Issue[] => {
  if (!db) return [];
  const res = db.exec("SELECT * FROM issues WHERE repo_id = ?", [repoId]);
  if (res.length === 0) return [];
  return res[0].values.map((v: any[]) => ({
    id: v[0],
    repo_id: v[1],
    title: v[2],
    url: v[3],
    number: v[4],
    labels: JSON.parse(v[5] || "[]"),
    analysis: v[6] ? JSON.parse(v[6]) : null
  }));
};

export const updateIssueAnalysis = (issueId: number, analysis: IssueAnalysis) => {
  if (!db) return;
  db.run("UPDATE issues SET analysis = ? WHERE id = ?", [JSON.stringify(analysis), issueId]);
};
