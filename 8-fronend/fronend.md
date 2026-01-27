---
description: >-
  การทำ “โครงสร้าง Frontend” คือการวางโฟลเดอร์และรูปแบบโปรเจกต์ให้เป็นระบบ
  ตั้งแต่ต้น เพื่อให้พัฒนาเร็ว ดูแลง่าย และทีมทำงานร่วมกันได้
---

# โครงสร้าง Fronend

ให้เราเปิด Ubuntu ขึ้นมาเเล้วเข้าไปที่ folder เดียวเราที่เราทำ backend เเล้วใช้คำสั่ง mkdir เพื่อสร้างอีก folder ชื่อว่า Fronend

```shellscript
cd Frontend/
npm create vue@latest ##เเล้วติดตั้ง app vue 
/iotdevops/Frontend# code . #มันก็เด้งเข้าไปใน vscode 
```

เราก็จะได้ folder มาเพื่อเอามาใช้งานเเล้วสร้างที่ขาดหายเลยตามรูปที่เเนบไปให้เลยครับ

```shellscript
iotdevops/                       # โฟลเดอร์หลักของโปรเจกต์ รวมทุกส่วนของระบบ
│
├─ backend/                      # ส่วน Backend (Node.js + Express) จัดการ API และเชื่อมต่อฐานข้อมูล
│   ├─ server.js                 # ไฟล์หลักสำหรับ start เซิร์ฟเวอร์ และกำหนด route หลัก
│   ├─ db.js                     # ไฟล์เชื่อมต่อฐานข้อมูล PostgreSQL
│   ├─ routes/                   # เก็บไฟล์กำหนดเส้นทาง API (endpoint)
│   │   ├─ user.routes.js        # route ที่เกี่ยวข้องกับผู้ใช้งาน (เช่น /users)
│   │   └─ sensor.routes.js      # route ที่เกี่ยวข้องกับข้อมูลเซนเซอร์
│   ├─ controllers/              # เก็บ business logic และการจัดการข้อมูล
│   │   ├─ user.controller.js    # logic สำหรับผู้ใช้งาน (query DB, validate)
│   │   └─ sensor.controller.js  # logic สำหรับข้อมูลเซนเซอร์
│   ├─ .env                      # เก็บค่าตัวแปรลับ เช่น DB, PORT, JWT
│   ├─ package.json              # กำหนด dependencies และ script ของ backend
│   └─ Dockerfile                # ไฟล์สร้าง Docker image สำหรับ backend
│
├─ frontend/                     # ส่วน Frontend แสดงผลหน้าเว็บให้ผู้ใช้
│   └─ appvue/                   # โปรเจกต์ Vue.js ที่สร้างด้วย Vite
│       ├─ src/                  # โค้ดหลักของ Vue
│       │   ├─ assets/           # ไฟล์ static เช่น รูปภาพ CSS font
│       │   ├─ components/       # component ย่อยที่นำกลับมาใช้ซ้ำได้
│       │   │   └─ icons/        # component ไอคอนต่าง ๆ
│       │   ├─ services/         # ไฟล์สำหรับเรียกใช้งาน API และจัดการ state
│       │   │   ├─ api.js        # ตั้งค่า axios สำหรับเรียก backend API
│       │   │   └─ authStore.js  # จัดการสถานะ login และ auth
│       │   ├─ views/            # หน้าเว็บหลัก (page)
│       │   │   ├─ HomePage.vue       # หน้าแรกของระบบ
│       │   │   ├─ LoginPage.vue      # หน้าเข้าสู่ระบบ
│       │   │   ├─ DashboardPage.vue  # หน้า dashboard แสดงภาพรวม
│       │   │   ├─ UsersPage.vue      # หน้าจัดการผู้ใช้งาน
│       │   │   └─ SensorsPage.vue    # หน้าแสดงข้อมูลเซนเซอร์
│       │   ├─ App.vue            # component หลักของแอป
│       │   ├─ main.js            # จุดเริ่มต้นของ Vue app
│       │   └─ router.js          # กำหนดเส้นทางหน้าเว็บ (Vue Router)
│       │
│       ├─ public/               # ไฟล์ static ที่เข้าถึงตรงผ่าน URL
│       ├─ index.html            # HTML หลักที่โหลด Vue app
│       ├─ vite.config.js        # ไฟล์ตั้งค่า Vite
│       ├─ package.json          # dependencies และ script ของ frontend
│       ├─ Dockerfile            # ไฟล์สร้าง Docker image สำหรับ frontend
│       └─ nginx.conf            # ตั้งค่า Nginx สำหรับ serve frontend
│
├─ docker-compose.yml            # รวม backend, database, frontend ให้รันพร้อมกัน
├─ .gitlab-ci.yml                # ตั้งค่า CI/CD สำหรับ GitLab
└─ README.md                     # เอกสารอธิบายโปรเจกต์ วิธีติดตั้ง และการใช้งาน

```

<figure><img src="../.gitbook/assets/image (24).png" alt=""><figcaption></figcaption></figure>

### เเต่ละ Folder ทำงานยังไง

บอกเเค่ folder ที่ใช้งานนะครับ

**node\_modules** ก็บ library ทั้งหมดที่ติดตั้งจากที่เราติดตั้งเช่น npm install ก็จะเก็บ library ไว้\
**src** ทุกอย่างที่เป็น logic + UI จะอยู่ที่นี่\
**src/services/** โฟลเดอร์ **เชื่อมต่อ Backend / จัดการ Auth**\
**src/views/** หน้า (Page) ของระบบ 1 ไฟล์ = 1 หน้า\
**src/main.js** จุดเริ่มต้นของ Vue app ถ้าไม่มีไฟล์นี้ เว็บไม่ขึ้น\
**src/router.js** กำหนดเส้นทางหน้าเว็บ (route) ป้องกันคนที่ยังไม่ login เข้าหน้า dashboard\
&#xNAN;**.env** แนวคิดเดียวกับ `.env` ฝั่ง Backend (ปลอดภัย + ยืดหยุ่น)

> ก็จะมี folder ที่ใช้เเค่นี้เลยง่ายนิดเดียวที่เหลือยาก
