---
description: >-
  JWT ทำหน้าที่เหมือนบัตรผ่านชั่วคราว หลังจากล็อกอินสำเร็จ เซิร์ฟเวอร์จะออก
  token ให้ ผู้ใช้เอา token ไปแนบกับ request ครั้งต่อ ๆ ไป เซิร์ฟเวอร์อ่าน token
  แล้วรู้ทันทีว่าเป็นใครและมีสิทธิ์อะไร (เช่น rol
---

# ทำ Login + JWT Token

ติดตั้งแพ็กเกจที่ต้องใช้

```shellscript
npm i jsonwebtoken dotenv
```

สร้างไฟล์ `.env` (อยู่ระดับเดียวกับ `server.js` / `package.json`)&#x20;

```dotenv
PORT=3000
JWT_SECRET=pond_super_secret_key_change_me
JWT_EXPIRES_IN=1h

PORT=3000 #พอร์ตที่ Backend Server จะเปิดรับการเชื่อมต่อ
JWT_SECRET=pond_super_secret_key_change_me #กุญแจลับ (Secret Key) ที่ใช้ จะตั้งอะไรก็ได้ แต่ควรตั้งให้ยากต่อการเดา
JWT_EXPIRES_IN=1h #ระยะเวลาที่โทเค็นจะหมดอายุ เช่น 1h = 1 ชั่วโมง, 7d = 7 วัน

```

ต่อมาแก้ `server.js` ให้โหลด env ก่อน แล้วใช้ค่า `PORT` จาก env

```javascript
const express = require('express');
const app = express();
require('dotenv').config(); // โหลดตัวแปรจาก .env
require('./config/db');   // เรียก db.js เข้ามา (มันจะ log DB connected แยกให้เอง)
require('./config/init_db'); // เรียก init_db.js เข้ามา (มันจะสร้างตารางให้เอง)

app.use(express.json()); // ใช้ middleware สำหรับอ่าน JSON body

// เรียกใช้งาน routes
const authRoutes = require('./routes/authRoutes');

// ใช้ routes ที่ /api
app.use('/api', authRoutes);

// ตัวอย่าง route ทดสอบเซิร์ฟเวอร์
app.get('/', (req, res) => {
  res.send('ทดสอบการเชื่อมต่อเซิร์ฟเวอร์สำเร็จ');
});

const PORT = process.env.PORT || 3000; // ใช้พอร์ตจาก .env หรือ 3000 เป็นค่าเริ่มต้น
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


```

ตอนนี้ไปปรับ `controllers/authController.js` ให้เมื่อ login สำเร็จแล้ว “ออก token” กลับไปให้ client โดย token จะฝังข้อมูลที่จำเป็น เช่น `id`, `username`, `role` เพื่อใช้ตรวจสิทธิ์ในอนาคต \
ปรับตรงไหนหรือที่เพิ่มปอนด์จะใส่ ⭐ไว้

```javascript
// controllers/authController.js
const bcrypt = require('bcrypt');                // ใช้ตรวจรหัสผ่านแบบ hash
const jwt = require('jsonwebtoken');           // ใช้สร้าง JWT//
const pool = require('../config/db');            // เรียก pool เพื่อ query ฐานข้อมูล

// ฟังก์ชัน login: ตรวจ username/password แล้วตอบกลับ
const login = async (req, res) => {
  try {
    // รับข้อมูลจาก body (ต้องมี express.json() ใน server.js)
    const { username, password } = req.body;

    // เช็กว่าผู้ใช้ส่งข้อมูลมาครบไหม
    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        message: 'กรุณากรอก username และ password'
      });
    }

    // ดึง user จากฐานข้อมูลตาม username
    const result = await pool.query(
      'SELECT id, username, password, role FROM users WHERE username = $1',
      [username]
    );

    // ⭐ ถ้าไม่พบ user
    if (result.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }
    const user = result.rows[0];

    // ⭐ ตรวจสอบรหัสผ่านที่ส่งมา กับ รหัสผ่านที่เก็บในฐานข้อมูล (hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ⭐ สร้าง payload สำหรับใส่ใน JWT (หลังจาก login ผ่านแล้ว)
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // ⭐ สร้าง token ด้วย secret จาก env และกำหนดอายุ token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // ⭐ ส่ง token กลับให้ client
    return res.status(200).json({
      ok: true,
      message: 'Login success',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    // จับ error ที่เกิดจากระบบ/DB
    console.error('login error:', err.message);
    return res.status(500).json({
      ok: false,
      message: 'Server error'
    });
  }
};

module.exports = { login };                      // export ให้ route เรียกใช้ได้

```

พอเสร็จให้เรารันงานของเราก็ได้จะหน้าตาเเบบนี้

```
root@DESKTOP-B5KSE5S:~/iotdevops# node server.js
[dotenv@17.2.3] injecting env (3) from .env -- tip: ✅ audit secrets and track compliance: https://dotenvx.com/ops
✅ Server running at http://localhost:3000
DB connected:
✅ ran create_users.sql
✅ tables ready
```

ให้เราทดสอบโดนเลยใช้ postman ว่าตอนนี้มี token มาเเล้วหรือยัง

<figure><img src="../.gitbook/assets/Untitled design (6).png" alt=""><figcaption></figcaption></figure>

> เราก็จะได้ token มาใช้เเล้วว

### ทำ **Middleware ตรวจ JWT**

ทำ 2 role: `dev` กับ `user`

* `dev` : เพิ่ม/แก้ไข/ลบ “ข้อความ” ได้
* `user` : ดูรายการได้อย่างเดียว
* ทำ Dashboard บน Frontend (Vue / App.vue) แสดงรายการทั้งหมด + ปุ่ม CRUD เฉพาะ dev
* จัดให้ Backend + Frontend อยู่ในโปรเจกต์เดียวกันเพื่อเวลาทำ CI/CD จะได้ทำง่าย

ให้เราสร้างไฟล์ `backend/middleware/auth.js`<br>

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

// ตรวจว่า request มี token และ token ถูกต้องไหม
const requireAuth = (req, res, next) => {
  try {
    // ดึงค่า Authorization: Bearer <token>
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(' ');

    // เช็กว่ามาเป็น Bearer token ไหม
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ ok: false, message: 'Missing Bearer token' });
    }

    // ตรวจสอบ token ด้วย JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // เก็บข้อมูล user จาก token ไว้ใน req.user เพื่อให้ route ใช้ต่อได้
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Invalid/Expired token' });
  }
};

// ตรวจ role (อนุญาตหลาย role ได้)
const requireRole = (...roles) => {
  return (req, res, next) => {
    // ต้องผ่าน requireAuth มาก่อนเพื่อให้มี req.user
    if (!req.user || !req.user.role) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    // ถ้า role ไม่อยู่ในรายชื่อที่อนุญาต
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: 'Forbidden: insufficient role' });
    }

    next();
  };
};

module.exports = { requireAuth, requireRole };
```

ติดตั้งแพ็กเกจที่ต้องใช้ (Backend)

```shellscript
npm i jsonwebtoken dotenv bcrypt cors
```

เพิ่ม `backend/controllers/authController.js` (ของที่มีเเล้ว)ปรับตรงไหนหรือที่เพิ่มปอนด์จะใส่ ⭐

```javascript
// controllers/authController.js
const bcrypt = require('bcrypt');                // ใช้ตรวจรหัสผ่านแบบ hash
const jwt = require('jsonwebtoken');           // ใช้สร้าง JWT//
const pool = require('../config/db');            // เรียก pool เพื่อ query ฐานข้อมูล

// ฟังก์ชัน login: ตรวจ username/password แล้วตอบกลับ
const login = async (req, res) => {
  try {
    // รับข้อมูลจาก body (ต้องมี express.json() ใน server.js)
    const { username, password } = req.body;

    // เช็กว่าผู้ใช้ส่งข้อมูลมาครบไหม
    if (!username || !password) { /
      return res.status(400).json({
        ok: false,
        message: 'กรุณากรอก username และ password'
      });
    }

    // ดึง user จากฐานข้อมูลตาม username
    const result = await pool.query(
      'SELECT id, username, password, role FROM users WHERE username = $1',
      [username]
    );

    // ถ้าไม่พบ user
    if (result.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }
    const user = result.rows[0];

    // ตรวจสอบรหัสผ่านที่ส่งมา กับ รหัสผ่านที่เก็บในฐานข้อมูล (hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // (ต้องมี) เช็กว่า env มี JWT_SECRET ไหม กันพังตอน deploy
    if (!process.env.JWT_SECRET) { // ⭐
      return res.status(500).json({ // ⭐
        ok: false, // ⭐
        message: 'JWT secret is not configured' // ⭐
      }); // ⭐
    } // ⭐

    // สร้าง payload สำหรับใส่ใน JWT (หลังจาก login ผ่านแล้ว)
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // สร้าง token ด้วย secret จาก env และกำหนดอายุ token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // ส่ง token กลับให้ client
    return res.status(200).json({
      ok: true,
      message: 'Login success',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    // จับ error ที่เกิดจากระบบ/DB
    console.error('login error:', err.message);
    return res.status(500).json({
      ok: false,
      message: 'Server error'
    });
  }
};

module.exports = { login };                      // export ให้ route เรียกใช้ได้
```

สร้าง `routes/userRoutes.js`<br>

```javascript
// Some code// controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// user กับ dev ดูรายชื่อได้
const listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users ORDER BY id ASC'
    );
    return res.json({ ok: true, users: result.rows });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// dev เพิ่ม user ใหม่
const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ ok: false, message: 'username, password, role required' });
    }
    if (!['dev', 'user'].includes(role)) {
      return res.status(400).json({ ok: false, message: 'role must be dev or user' });
    }

    // hash password ก่อนเก็บลง DB
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1,$2,$3) RETURNING id, username, role, created_at',
      [username, hashed, role]
    );

    return res.status(201).json({ ok: true, user: result.rows[0] });
  } catch (err) {
    // username ซ้ำมักจะเป็น unique violation
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// dev แก้ role (หรือแก้ username ได้ถ้าต้องการ)
const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (!id) return res.status(400).json({ ok: false, message: 'invalid id' });
    if (!role || !['dev', 'user'].includes(role)) {
      return res.status(400).json({ ok: false, message: 'role must be dev or user' });
    }

    const result = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, role, created_at',
      [role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'user not found' });
    }

    return res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// dev ลบ user
const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ ok: false, message: 'invalid id' });

    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, message: 'user not found' });
    }

    return res.json({ ok: true, message: 'deleted', id: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

module.exports = { listUsers, createUser, updateUser, deleteUser };

```

แล้วไปใส่ใน `server.js` (เพิ่ม CORS ด้วย ถ้า dev แยกพอร์ต) เเละเพิ่มเส้น api

```javascript
const express = require('express');
const app = express();
require('dotenv').config(); // โหลดตัวแปรจาก .env
require('./config/db');   // เรียก db.js เข้ามา (มันจะ log DB connected แยกให้เอง)
require('./config/init_db'); // เรียก init_db.js เข้ามา (มันจะสร้างตารางให้เอง)

app.use(express.json()); // ใช้ middleware สำหรับอ่าน JSON body

// เรียกใช้งาน routes
const authRoutes = require('./routes/authRoutes');
const cors = require('cors'); // ⭐
app.use(cors());         // ใช้ CORS เพื่อให้เรียก API ข้ามโดเมนได้

// ใช้ routes ที่ /api
app.use('/api', authRoutes);
app.use('/api', require('./routes/userRoutes')); // ⭐
app.use('/api', require('./routes/authRoutes')); // ⭐

// ตัวอย่าง route ทดสอบเซิร์ฟเวอร์
app.get('/', (req, res) => {
  res.send('ทดสอบการเชื่อมต่อเซิร์ฟเวอร์สำเร็จ');
});

const PORT = process.env.PORT || 3000; // ใช้พอร์ตจาก .env หรือ 3000 เป็นค่าเริ่มต้น
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
```

เเค่นี้เราก็จะได้ แสดงรายการทั้งหมดมีสอง role เเละมีสิทธิ์การใช้งานหน้าที่ต่างมีเส้น ลบ เพิ่ม เเก้ไข ตาม crud\
CRUD ย่อมาจาก Create (สร้าง), Read (อ่าน), Update (อัปเดต), และ Delete (ลบ)

### วิธีทดสอบว่าใช้งานได้ทุกเส้นไหม&#x20;
