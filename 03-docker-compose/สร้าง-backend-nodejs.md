# สร้าง Backend ตัวอย่าง (Node.js + Express)

โครงสร้างโฟลเดอร์ใน repo:
```
backend/
 ├─ package.json
 ├─ server.js
 └─ Dockerfile
```

**package.json**
```json
{
  "name": "devops-backend",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "pg": "^8.11.5"
  }
}
```

**server.js**
```js
import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "kuy",
  password: process.env.DB_PASS || "123",
  database: process.env.DB_NAME || "pind",
  port: 5432
});

app.get("/health", (req, res) => res.send("ok"));

app.get("/api/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(port, () => console.log(`API running on :${port}`));
```

**Dockerfile**
```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm i --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```
