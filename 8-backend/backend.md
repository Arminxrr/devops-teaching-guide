---
description: โครงสร้าง Backen หลักที่เราจะใช้งานในคู่มือนี้
---

# โครงสร้าง Backend

```shellscript
IOTDEVOPS/                          # โฟลเดอร์โปรเจกต์หลัก
├── config/                         # เก็บไฟล์ตั้งค่าระบบ (เช่น DB, env config)
├── controllers/                    # โค้ด logic หลัก/ตัวจัดการการทำงาน (controller)
├── routes/                         # กำหนดเส้นทาง API (endpoints) และ mapping ไป controller
├── sql/                            # เก็บไฟล์ SQL สำหรับสร้างตาราง/เตรียมฐานข้อมูล
├── node_modules/                   # dependencies ที่ติดตั้งจาก npm (สร้างอัตโนมัติ)
├── docker-compose.yml              # รันหลาย service พร้อมกัน (เช่น backend + database)
├── Dockerfile                      # สร้าง Docker image สำหรับ backend
├── package.json                    # รายชื่อ dependencies + scripts ของโปรเจกต์
├── package-lock.json               # ล็อกเวอร์ชัน dependencies ให้ตรงกันทุกเครื่อง
└── server.js                       # จุดเริ่มต้นของแอป (รัน Express/Backend)
```

เเต่ละ Folder ทำไรบ้าง

* **config/**\
  เก็บไฟล์ตั้งค่าระบบ เช่น การเชื่อมต่อฐานข้อมูล
* **controllers/**\
  จัดการ logic และการประมวลผลของระบบ
* **routes/**\
  กำหนดเส้นทาง API สำหรับเรียกใช้งาน Backend
* **sql/**\
  เก็บไฟล์สำหรับเตรียมโครงสร้างฐานข้อมูล
* **node\_modules/**\
  ไลบรารีที่ใช้ในโปรเจกต์ (ติดตั้งจาก npm)
* **Dockerfile**\
  ใช้สำหรับสร้าง Docker Image ของ Backend
* **docker-compose.yml**\
  ใช้จัดการหลาย Container พร้อมกัน
* **package.json / package-lock.json**\
  จัดการ dependencies และคำสั่งของโปรเจกต์
* **server.js**\
  ไฟล์หลักสำหรับเริ่มต้น Backend Server
