---
description: ที่จะรับข้อมูลเซนเซอร์
---

# Backend API

ให้เราเข้าไปที่ folder ของเราเเล้วสร้าง sensorRoutes.js ไว้ใน folder routes

```javascript
const express = require('express'); // นำเข้า (import) ไลบรารี express เพื่อใช้สร้างเว็บเซิร์ฟเวอร์และระบบ routing
const router = express.Router();    // สร้าง Router ของ Express เอาไว้รวม/จัดการเส้นทาง (routes) ของชุดนี้
const sensorController = require('../controllers/sensorController'); // นำเข้า controller ที่รวมฟังก์ชันทำงานเกี่ยวกับ sensor (logic ต่าง ๆ)

// สร้าง API แบบ POST ที่ path /sensors/ingest
// ใช้สำหรับ "รับข้อมูล sensor เข้ามา" (เช่น Node-RED/ESP32 ส่งค่า temp/humid มาให้ backend)
// เมื่อมีการยิง POST มาที่เส้นทางนี้ จะไปเรียกฟังก์ชัน sensorController.ingestSensor(req,res)
router.post('/sensors/ingest', sensorController.ingestSensor);

// สร้าง API แบบ GET ที่ path /sensors
// ใช้สำหรับ "ดึงรายการข้อมูล sensor" (เช่น history หรือ list จากฐานข้อมูล)
// เมื่อมีการยิง GET มาที่เส้นทางนี้ จะไปเรียกฟังก์ชัน sensorController.getSensors(req,res)
router.get('/sensors', sensorController.getSensors);

// สร้าง API แบบ GET ที่ path /sensors/latest
// ใช้สำหรับ "ดึงข้อมูลล่าสุด" ของ sensor (ล่าสุด 1 แถว/1 record)
// เมื่อมีการยิง GET มาที่เส้นทางนี้ จะไปเรียกฟังก์ชัน sensorController.getLatestSensor(req,res)
router.get('/sensors/latest', sensorController.getLatestSensor);

module.exports = router; // ส่งออก (export) router ตัวนี้ เพื่อให้ไฟล์อื่น (เช่น app.js/server.js) นำไปใช้ด้วย app.use(...)

```

ไปต่อเราจะไปที่ Folder controllers เเล้วสร้างเเล้วสร้าง sensorController.js

```javascript
const db = require('../config/db'); // ดึงโมดูลเชื่อมต่อฐานข้อมูล (เช่น pg Pool) มาใช้สำหรับ query ฐานข้อมูล

const INGEST_SECRET = process.env.INGEST_SECRET || 'pond-ingest-secret'; 
// กำหนด "กุญแจลับ" สำหรับอนุญาตให้ส่งข้อมูลเข้า endpoint ingest ได้
// ถ้าใน .env มี INGEST_SECRET ก็ใช้ค่านั้น
// ถ้าไม่มี จะใช้ค่าเริ่มต้น 'pond-ingest-secret' (แนะนำให้ตั้งใน .env จริง ๆ เพื่อความปลอดภัย)


// POST /api/sensors/ingest
async function ingestSensor(req, res) { // ฟังก์ชัน controller สำหรับรับข้อมูล sensor จากผู้ส่ง (เช่น Node-RED/ESP32)
  try { // เริ่ม try-catch เพื่อดัก error ที่อาจเกิดขึ้นตอนทำงาน (เช่น DB error)
    const headerSecret = req.header('X-Sensor-Secret'); 
    // อ่านค่า header ชื่อ X-Sensor-Secret จาก request (ผู้ส่งต้องแนบมา)

    if (headerSecret !== INGEST_SECRET) { 
      // ถ้าค่าที่ส่งมาไม่ตรงกับ secret ที่เรากำหนดไว้ = ไม่อนุญาต
      return res.status(401).json({ error: 'unauthorized' }); 
      // ตอบกลับด้วย HTTP 401 (Unauthorized) และส่ง JSON แจ้ง error
    }

    const { temp, humid, created_at } = req.body || {}; 
    // ดึง temp, humid, created_at จาก body ที่ผู้ส่งส่งมา
    // ถ้า req.body เป็น undefined ก็ใช้ {} กันพัง

    if (typeof temp !== 'number' || typeof humid !== 'number') { 
      // ตรวจว่าค่า temp และ humid เป็นตัวเลขจริงไหม
      // ถ้าไม่ใช่ตัวเลข (เช่นส่งเป็น string หรือส่งมาไม่ครบ) จะ error
      return res.status(400).json({ error: 'temp and humid must be numbers' }); 
      // ตอบกลับ HTTP 400 (Bad Request) พร้อมข้อความแจ้ง
    }

    const query = ` 
      INSERT INTO sensors (temp, humid, created_at)
      VALUES ($1, $2, COALESCE($3::timestamptz, NOW()))
      RETURNING *
    `; 
    // สร้าง SQL สำหรับ INSERT ลงตาราง sensors
    // - $1, $2, $3 คือ parameter ป้องกัน SQL injection
    // - COALESCE(..., NOW()) หมายถึง: ถ้ามี created_at ก็ใช้ค่านั้น
    //   ถ้าไม่มี (null) ให้ใช้เวลาปัจจุบัน NOW()
    // - $3::timestamptz คือแปลงค่า created_at ให้เป็นชนิดเวลาที่มี timezone
    // - RETURNING * ให้ DB ส่งแถวที่ insert แล้วกลับมา

    const values = [temp, humid, created_at || null]; 
    // เตรียมค่าที่จะ bind เข้าไปแทน $1 $2 $3
    // ถ้า created_at ไม่มี ให้ส่ง null เพื่อให้ COALESCE ไปใช้ NOW()

    const { rows } = await db.query(query, values); 
    // สั่ง query กับฐานข้อมูลแบบ async แล้วรอผล
    // rows คือข้อมูลที่ DB ส่งกลับมา (จาก RETURNING *)

    res.status(201).json(rows[0]); 
    // ตอบกลับ HTTP 201 (Created) พร้อมข้อมูลแถวที่เพิ่งถูกบันทึก (แถวแรก)
  } catch (err) { 
    // ถ้ามี error เกิดขึ้นใน try (เช่น DB ล่ม, SQL ผิด, ฯลฯ) จะมาที่นี่
    console.error(err); 
    // พิมพ์ error ลง console เพื่อ debug
    res.status(500).json({ error: 'server error' }); 
    // ตอบกลับ HTTP 500 (Internal Server Error)
  }
}


// GET /api/sensors
async function getSensors(req, res) { // ฟังก์ชันดึงรายการข้อมูล sensor (ล่าสุดก่อน) จาก DB
  try { // ดัก error เหมือนเดิม
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 500); 
    // อ่าน query string ชื่อ limit เช่น /api/sensors?limit=100
    // ถ้าไม่ส่งมาให้ใช้ค่า default 50
    // parseInt(...,10) แปลงเป็นเลขฐาน 10
    // Math.min(...,500) จำกัดไม่ให้เกิน 500 เพื่อกันโหลดหนัก/โดนยิง

    const { rows } = await db.query(
      'SELECT * FROM sensors ORDER BY id DESC LIMIT $1',
      [limit]
    ); 
    // ดึงข้อมูลจากตาราง sensors เรียง id จากมากไปน้อย (ใหม่สุดก่อน)
    // จำกัดจำนวนตาม limit
    // ใช้ $1 + [limit] เพื่อป้องกัน SQL injection

    res.json(rows); 
    // ส่งข้อมูลทั้งหมดกลับไปเป็น JSON array
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: 'server error' }); 
  }
}


// GET /api/sensors/latest
async function getLatestSensor(req, res) { // ฟังก์ชันดึง “ข้อมูลล่าสุด 1 แถว”
  try {
    const { rows } = await db.query(
      'SELECT * FROM sensors ORDER BY id DESC LIMIT 1'
    ); 
    // เลือกข้อมูลจาก sensors เรียงใหม่สุดก่อน แล้วเอาแค่ 1 แถว

    if (!rows.length) return res.status(404).json({ error: 'no data' }); 
    // ถ้าในตารางยังไม่มีข้อมูลเลย rows จะว่าง -> ตอบ 404

    res.json(rows[0]); 
    // ถ้ามีข้อมูล ส่งแถวล่าสุดกลับไป
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}


module.exports = { 
  ingestSensor,
  getSensors,
  getLatestSensor
}; 
// export ฟังก์ชันทั้ง 3 ออกไป เพื่อให้ไฟล์ route เรียกใช้งานได้ (เช่น router.get(..., sensorController.getSensors))
```

เเล้วต่อมาเราจะสร้างตารางของ Sensor ไปที่ folder sql เเล้วสร้าง create\_sensors.sql&#x20;

```javascript
CREATE TABLE IF NOT EXISTS sensors (
  id SERIAL PRIMARY KEY,
  temp NUMERIC(5,2) NOT NULL,
  humid INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

เเล้วไปเพิ่มไฟล์ init\_db.js ที่อยู่ folder config ที่เราเตรียมไว้ตอนสร้างตาราง user&#x20;

```javascript
// เรียกใช้งาน module สำหรับอ่านไฟล์
const fs = require('fs');

// ใช้จัดการ path ของไฟล์ให้ถูกต้องทุก OS
const path = require('path');

// เรียก pool สำหรับเชื่อมต่อ PostgreSQL
const pool = require('./db');

// ฟังก์ชันสำหรับรันไฟล์ SQL
const run = async (file) => {
  // อ่านไฟล์ SQL จากโฟลเดอร์ sql
  const sql = fs.readFileSync(
    path.join(__dirname, `../sql/${file}`),
    'utf8'
  );

  // ส่งคำสั่ง SQL ไปให้ PostgreSQL ทำงาน
  await pool.query(sql);

  // แสดง log เมื่อรันไฟล์สำเร็จ
  console.log(`✅ ran ${file}`);
};

// ฟังก์ชันหลักสำหรับ init database
(async () => {
  try {
    // รันไฟล์สร้างตาราง users
    await run('create_users.sql');
    // รันไฟล์สร้างตาราง sensors
    await run('create_sensors.sql'); ⭐

    // แสดงข้อความเมื่อทุกตารางพร้อมใช้งาน
    console.log('✅ tables ready');
  } catch (err) {
    // แสดง error ถ้ามีปัญหา
    console.error('❌ init_db error:', err.message);
  }
})();

```

> อิโมจิ ⭐ คือบรรณทัดที่ผมเพิ่มไป
