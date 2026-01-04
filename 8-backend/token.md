---
description: >-
  /api/me ใช้สำหรับตรวจสอบตัวตนของผู้ใช้งานจาก JWT token โดยไม่ต้องส่ง username
  หรือ id เพิ่มเติม ช่วยให้ระบบรู้ว่า “ผู้ใช้คนปัจจุบันคือใคร และมี role อะไร”
  เพื่อควบคุมสิทธิ์และแสดงผลบน Dashboard ได้อย่
---

# ทำเส้นดูข้อมูลตัวเองจาก token

พิ่มฟังก์ชันใน `Controller` แก้ไฟล์ `controllers/authController.js` ตรงที่เพิ่มปอนด์จะ ⭐ ไว้ครับ

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
    if (!username || !password) { //
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

    //  ถ้าไม่พบ user
    if (result.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }
    const user = result.rows[0];

    //  ตรวจสอบรหัสผ่านที่ส่งมา กับ รหัสผ่านที่เก็บในฐานข้อมูล (hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    //  (ต้องมี) เช็กว่า env มี JWT_SECRET ไหม กันพังตอน deploy
    if (!process.env.JWT_SECRET) { // 
      return res.status(500).json({ // 
        ok: false, // 
        message: 'JWT secret is not configured' // 
      }); // 
    } // 

    //  สร้าง payload สำหรับใส่ใน JWT (หลังจาก login ผ่านแล้ว)
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    //  สร้าง token ด้วย secret จาก env และกำหนดอายุ token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    //  ส่ง token กลับให้ client
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
// controllers/authController.js⭐

// API สำหรับดูข้อมูลผู้ใช้จาก token
const me = async (req, res) => {
  try {
    // ข้อมูลนี้มาจาก middleware requireAuth (decoded JWT)
    const { id, username, role } = req.user;

    return res.status(200).json({
      ok: true,
      user: {
        id,
        username,
        role
      }
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: 'Server error'
    });
  }
};

module.exports = { login, me };     //⭐                 // export ให้ route เรียกใช้ได้

```

เพิ่ม Route `api/me` แก้ไฟล์ `routes/authRoutes.js`

```javascript
// routes/authRoutes.js
const express = require('express');              // เรียกใช้ express เพื่อสร้าง router
const router = express.Router();                 // สร้าง router แยกสำหรับ auth
const { login, me } = require('../controllers/authController'); // ดึงฟังก์ชัน login จาก controller
const { requireAuth } = require('../middleware/auth'); // ดึง middleware สำหรับตรวจสอบ token⭐

// สร้างเส้น API สำหรับ login
// POST /api/login
router.post('/login', login);

// ดูข้อมูลตัวเองจาก token
router.get('/me', requireAuth, me); // ⭐

module.exports = router;
```

เเละลองทดสอบใน postman ให้เรา login เเล้วก๊อป Token เอาไว้&#x20;

<div align="left"><figure><img src="../.gitbook/assets/32.png" alt=""><figcaption></figcaption></figure></div>

เเล้วให้เรา New Request ใน postman มาใหม่เเล้วเพิ่มเส้น api/me เเล้วปรับเป็น bearar token เเล้ววาง token \
เเล้วกด Send เราก็จะสามารถดูข้อมูลของตัวเองได้

<figure><img src="../.gitbook/assets/Untitled design (7).png" alt=""><figcaption></figcaption></figure>

> เราก็จะได้หน้าตาเเล้วนี้เเล้วพร้อมไปลุยใน fronend ต่อ!!
