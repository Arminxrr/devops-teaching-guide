---
description: >-
  การสร้างเส้น API เพื่อเส้น login ทำหน้า api product อยากออกเเบบใส่ key
  ต่างๆในตาราง table
---

# สร้างเส้น Login API เเละใช้ postman

ติดตั้งแพ็กเกจที่ต้องใช้

```shellscript
npm i express pg bcrypt
```

สร้าง Route: `routes/authRoutes.js`

```javascript
// routes/authRoutes.js
const express = require('express');              // เรียกใช้ express เพื่อสร้าง router
const router = express.Router();                 // สร้าง router แยกสำหรับ auth
const { login } = require('../controllers/authController'); // ดึงฟังก์ชัน login จาก controller

// สร้างเส้น API สำหรับ login
// POST /api/login
router.post('/login', login);

module.exports = router;                         // ส่งออก router ไปให้ server.js ใช้งาน

```

สร้าง Controller: `controllers/authController.js`

```javascript
// controllers/authController.js
const bcrypt = require('bcrypt');                // ใช้ตรวจรหัสผ่านแบบ hash
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

    // ถ้าไม่พบ user
    if (result.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ได้ข้อมูล user แถวแรก
    const user = result.rows[0];

    // เปรียบเทียบรหัสผ่านที่ผู้ใช้กรอก กับ hash ในฐานข้อมูล
    const isMatch = await bcrypt.compare(password, user.password);

    // ถ้า password ไม่ตรง
    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ล็อกอินสำเร็จ (Step 1 ยังไม่ส่ง JWT)
    return res.status(200).json({
      ok: true,
      message: 'Login success',
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

  }
};

module.exports = { login };                      // export ให้ route เรียกใช้ได้
```

แก้ `server.js` ให้เรียกใช้ route และรับ JSON

```javascript
const express = require('express');
const app = express();
require('./config/db');                          // เชื่อม DB (log DB connected)

// เปิดให้รับ JSON body จาก client
app.use(express.json());

// เรียกใช้ auth routes (จะได้ URL /api/login)
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

// route ทดสอบ server
app.get('/', (req, res) => {
  res.send('ทดสอบการเชื่อมต่อเซิร์ฟเวอร์สำเร็จ');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

```

### ทดสอบ Login API ด้วยโปรเเกรม postman&#x20;

ปรับเป็น post ใส่ [http://localhost:3000/](http://localhost:3000/) ที่เราเช็คใส่ Path ในไฟล์ server.js เเละไฟล์ authRoutes.js

```javascript
//ไฟล์ server.js จะมีบรรณทัดนี้อยู่
app.use('/api', authRoutes);
```

```javascript
//ไฟล์ authRoutes.js จะมีบรรณทัดนี้อยู่
// สร้างเส้น API สำหรับ login
// POST /api/login
router.post('/login', login);
```

```shellscript
//เวลาทดสอบเเต่ละเส้นที่เราทำไว้
http://localhost:3000/api/login
```

ปรับ Body เป็น raw เเล้วปรับเป็น Json&#x20;

```json
{
  "username": "admin", //เป้น user
  "password": "admin123" //เป็น password ที่เราตั้งไว้
}
```

เเล้วกด Send ก็จะเข้าเช็คว่าเราเข้าสู่ระบบเเล้วจะขึ้น 200 ok&#x20;

<figure><img src="../.gitbook/assets/Untitled design (5).png" alt=""><figcaption></figcaption></figure>

200 OK = สำเร็จ

400 = ส่งข้อมูลผิด

401 = login ไม่ผ่าน

500 = server มีปัญหาส่วนมากจะเป็นที่ Boby&#x20;
