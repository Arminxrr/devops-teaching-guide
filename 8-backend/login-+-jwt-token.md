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
