# โครงสร้าง Backen

```shellscript
backend/
├── config/
│   ├── db.js              # ไฟล์ตั้งค่าการเชื่อมต่อฐานข้อมูล
│   └── init_db.js         # สคริปต์สำหรับเตรียม/สร้างฐานข้อมูลเริ่มต้น
│
├── controllers/
│   └── sensorController.js # จัดการ logic การทำงานของ sensor (CRUD, processing)
│
├── routes/
│   └── sensorRoutes.js     # กำหนด API routes ที่เกี่ยวกับ sensor
│
├── sql/
│   └── create_sensors.sql  # ไฟล์ SQL สำหรับสร้างตาราง sensors
│
├── Dockerfile              # คำสั่งสำหรับ build backend image ด้วย Docker
│
├── package.json            # รายชื่อ dependencies และ script ของโปรเจกต์
├── package-lock.json       # lock เวอร์ชัน dependencies
│
└── server.js               # entry point ของแอป (start Express server)

```
