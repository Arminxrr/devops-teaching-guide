---
description: ระบบจัดการห้องสมุดดิจิทัล (Digital Library Management)
icon: box-open-full
---

# โจทย์ฝึกซ้อม Backend API

### รายละเอียดโจทย์

#### ภาพรวมระบบ

คุณได้รับมอบหมายให้สร้าง ระบบจัดการห้องสมุดดิจิทัล สำหรับโรงเรียน ระบบจะต้องจัดการหนังสือ ผู้ใช้ และการยืม-คืนหนังสือ

#### เวลาที่กำหนด

8 ชั่วโมง (ลองทำดู)

#### 🛠️ เทคโนโลยีที่ต้องใช้

* Backend: Node.js + Express.js
* Database: Postgresql
* Authentication: JWT
* DevOps: Docker + docker-compose
* &#x20;Postman&#x20;

***

### Database Schema ที่ต้องสร้าง

#### 1. ตาราง users

```javascript
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE, NOT NULL)
- email (VARCHAR(100), UNIQUE, NOT NULL)
- password (VARCHAR(255), NOT NULL)
- full_name (VARCHAR(100), NOT NULL)
- role (ENUM: 'admin', 'librarian', 'student')
- student_id (VARCHAR(20), NULLABLE) -- สำหรับนักเรียน
- phone (VARCHAR(15), NULLABLE)
- address (TEXT, NULLABLE)
- status (ENUM: 'active', 'inactive', 'suspended')
- created_at, updated_at (TIMESTAMP)
```

<br>

#### 2. ตาราง categories

```javascript
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(100), NOT NULL)
- description (TEXT, NULLABLE)
- created_at (TIMESTAMP)
```

<br>

#### 3. ตาราง books

```javascript
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- isbn (VARCHAR(20), UNIQUE, NOT NULL)
- title (VARCHAR(200), NOT NULL)
- author (VARCHAR(100), NOT NULL)
- publisher (VARCHAR(100), NULLABLE)
- published_year (INT, NULLABLE)
- category_id (INT, FOREIGN KEY)
- description (TEXT, NULLABLE)
- total_copies (INT, DEFAULT 1)
- available_copies (INT, DEFAULT 1)
- location (VARCHAR(50), NULLABLE) -- ตำแหน่งชั้นหนังสือ
- cover_image (VARCHAR(255), NULLABLE)
- status (ENUM: 'available', 'maintenance', 'lost')
- created_by (INT, FOREIGN KEY to users)
- created_at, updated_at (TIMESTAMP)
```

<br>

#### 4. ตาราง borrowings

```javascript
- id (INT, PRIMARY KEY, AUTO_INCREMENT)  
- user_id (INT, FOREIGN KEY to users)
- book_id (INT, FOREIGN KEY to books)
- borrowed_date (DATETIME, NOT NULL)
- due_date (DATETIME, NOT NULL) -- 14 วันจากวันยืม
- returned_date (DATETIME, NULLABLE)
- status (ENUM: 'borrowed', 'returned', 'overdue', 'lost')
- fine_amount (DECIMAL(10,2), DEFAULT 0.00) -- ค่าปรับ
- notes (TEXT, NULLABLE)
- processed_by (INT, FOREIGN KEY to users) -- ผู้ดำเนินการ
- created_at, updated_at (TIMESTAMP)
```

<br>

#### 5. ตาราง reservations

```javascript
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY to users)
- book_id (INT, FOREIGN KEY to books)
- reserved_date (DATETIME, NOT NULL)
- expire_date (DATETIME, NOT NULL) -- 3 วันจากวันจอง
- status (ENUM: 'active', 'fulfilled', 'expired', 'cancelled')
- created_at, updated_at (TIMESTAMP)
```

<br>

***

### API Endpoints ที่ต้องสร้าง (100 คะแนน)

#### &#x20;Authentication (15 คะแนน)

**POST /api/auth/register**

* สำหรับ: สมัครสมาชิกใหม่
* Body: { username, email, password, full\_name, role, student\_id? }
* Response: { success, message, data: { user, token } }
* Validation:
* username: 3-50 ตัวอักษร, ไม่ซ้ำ
* email: รูปแบบ email ถูกต้อง, ไม่ซ้ำ
* password: อย่างน้อย 6 ตัวอักษร
* role: เฉพาะ admin สามารถสร้าง librarian ได้

**POST /api/auth/login**

* Body: { username, password }
* Response: { success, message, data: { user, token } }
* Logic: ตรวจสอบ username/email และ password

**GET /api/auth/profile**

* Auth: Required (JWT)
* Response: ข้อมูลผู้ใช้ปัจจุบัน

**PUT /api/auth/profile**

* Auth: Required
* Body: { full\_name?, phone?, address? }
* Response: ข้อมูลที่อัปเดตแล้ว

#### &#x20;Books Management (25 คะแนน)

**GET /api/books**

* Query params: page, limit, search, category\_id, status, author
* Response: รายการหนังสือพร้อม pagination
* Features:
* ค้นหาตาม title, author, isbn
* กรองตาม category และ status
* แสดงจำนวน available\_copies

**GET /api/books/:id**

* Response: รายละเอียดหนังสือพร้อมข้อมูล category
* Include: ประวัติการยืม (สำหรับ admin/librarian)

**POST /api/books**

* Auth: admin, librarian เท่านั้น
* Body: { isbn, title, author, publisher?, published\_year?, category\_id?, description?, total\_copies?, location? }
* Logic:
* ตรวจสอบ ISBN ไม่ซ้ำ
* ตั้งค่า available\_copies = total\_copies
* บันทึก created\_by

**PUT /api/books/:id**

* Auth: admin, librarian เท่านั้น
* Body: ข้อมูลที่ต้องการแก้ไข
* Logic: อัปเดต available\_copies ตาม total\_copies ถ้าเปลี่ยน

**DELETE /api/books/:id**

* Auth: admin เท่านั้น
* Logic: ตรวจสอบว่าไม่มีการยืมค้างอยู่

**POST /api/books/upload-cover**

* Auth: admin, librarian
* Body: multipart/form-data (image file)
* Response: URL ของรูปภาพที่อัปโหลด

#### &#x20;User Management (20 คะแนน)

**GET /api/users**

* Auth: admin, librarian เท่านั้น
* Query: page, limit, search, role, status
* Response: รายการผู้ใช้ (ไม่รวม password)

**GET /api/users/:id**

* Auth: admin, librarian หรือเจ้าของข้อมูล
* Response: ข้อมูลผู้ใช้ + ประวัติการยืม

**PUT /api/users/:id**

* Auth: admin หรือเจ้าของข้อมูล
* Body: ข้อมูลที่ต้องการแก้ไข
* Logic: admin เท่านั้นที่เปลี่ยน role และ status ได้

**PUT /api/users/:id/status**

* Auth: admin เท่านั้น
* Body: { status: 'active'|'inactive'|'suspended' }

#### &#x20;Borrowing System (25 คะแนน)

**POST /api/borrowings**

* Auth: Required (student ยืมให้ตัวเอง, librarian/admin ยืมให้คนอื่นได้)
* Body: { book\_id, user\_id? } (user\_id optional สำหรับ librarian/admin)
* Logic:
* ตรวจสอบหนังสือมีอยู่ (available\_copies > 0)
* ตรวจสอบผู้ใช้ไม่มีหนังสือค้างเกิน 3 เล่ม
* ตรวจสอบไม่มีหนังสือเล่มเดียวกันค้างอยู่
* กำหนด due\_date = +14 วัน
* ลด available\_copies ลง 1

**GET /api/borrowings**

* Auth: Required
* Query: page, limit, status, user\_id?, book\_id?
* Logic:
* student เห็นเฉพาะของตัวเอง
* librarian/admin เห็นทั้งหมด

**PUT /api/borrowings/:id/return**

* Auth: librarian, admin เท่านั้น
* Body: { notes?, fine\_amount? }
* Logic:
* อัปเดต returned\_date, status = 'returned'
* เพิ่ม available\_copies กลับ
* คำนวณค่าปรับถ้าเกินกำหนด (5 บาท/วัน)

**GET /api/borrowings/overdue**

* Auth: librarian, admin เท่านั้น
* Response: รายการหนังสือค้างคืนพร้อมค่าปรับ

#### &#x20;Reservation System (10 คะแนน)

**POST /api/reservations**

* Body: { book\_id }
* Logic:
* ตรวจสอบหนังสือไม่มีให้ยืม (available\_copies = 0)
* ผู้ใช้จองหนังสือเล่มเดียวกันได้เพียงครั้งเดียว
* กำหนด expire\_date = +3 วัน

**GET /api/reservations/my**

* Auth: Required
* Response: รายการจองของผู้ใช้ปัจจุบัน

**DELETE /api/reservations/:id**

* Auth: เจ้าของการจองหรือ admin/librarian
* Logic: ยกเลิกการจอง (status = 'cancelled')

#### &#x20;Reports & Statistics (5 คะแนน)

**GET /api/reports/dashboard**

* Auth: librarian, admin เท่านั้น
* Response:

`{`

&#x20; `"total_books": 1250,`

&#x20; `"total_users": 500,`

&#x20; `"currently_borrowed": 89,`

&#x20; `"overdue_books": 12,`

&#x20; `"popular_books": [...],`

&#x20; `"recent_activities": [...]`

`}`

<br>

**GET /api/reports/popular-books**

* Query: period=7|30|90 (วัน)
* Response: หนังสือยอดนิยมตามช่วงเวลา

***

### เกณฑ์การให้คะแนน

#### คะแนนพื้นฐาน (60 คะแนน)

* Database Setup (10 คะแนน):\
  <br>
* สร้าง tables ครบถ้วน (5)
* Foreign keys ถูกต้อง (3)
* Indexes เหมาะสม (2)
* Authentication (15 คะแนน):\
  <br>
* Register/Login ทำงานได้ (8)
* JWT middleware (4)
* Password hashing (3)
* Basic CRUD (35 คะแนน):\
  <br>
* Books CRUD (15)
* Users management (10)
* Borrowings basic (10)

#### คะแนนขั้นสูง (40 คะแนน)

* Advanced Features (20 คะแนน):\
  <br>
* Reservation system (8)
* Fine calculation (6)
* File upload (6)
* Business Logic (15 คะแนน):\
  <br>
* Stock management (5)
* Overdue detection (5)
* Authorization logic (5)
* Code Quality (5 คะแนน):\
  <br>
* Error handling (2)
* Input validation (2)
* Code organization (1)

***

### Docker Requirements

#### Dockerfile (Backend)

```javascript
Docker Requirements
Dockerfile (Backend)
FROM node:18-alpine


WORKDIR /app


COPY package*.json ./
RUN npm ci --only=production


COPY . .


EXPOSE 3000


CMD ["npm", "start"]
```

#### docker-compose.yml

```javascript
version: '3.8'


services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: library_db
      MYSQL_USER: library_user
      MYSQL_PASSWORD: library_pass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql


  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DB_HOST: mysql
      DB_USER: library_user
      DB_PASSWORD: library_pass
      DB_NAME: library_db
      JWT_SECRET: your-super-secret-key
    depends_on:
      - mysql
    volumes:
      - ./uploads:/app/uploads


volumes:
  mysql_data:
```

***

### การส่งงาน

#### 1. โครงสร้างไฟล์ที่ต้องมี

library-backend/

├── src/

│   ├── config/

│   │   └── database.js

│   ├── middleware/

│   │   ├── auth.js

│   │   └── validation.js

│   ├── models/

│   │   ├── User.js

│   │   ├── Book.js

│   │   └── Borrowing.js

│   ├── routes/

│   │   ├── auth.js

│   │   ├── books.js

│   │   ├── users.js

│   │   └── borrowings.js

│   ├── utils/

│   │   └── helpers.js

│   └── app.js

├── uploads/ (สำหรับเก็บรูปภาพ)

├── .env.example

├── package.json

├── Dockerfile

├── docker-compose.yml

└── README.md

<br>

#### 2. ไฟล์ README.md ต้องมี

* [ ] คำอธิบายโปรเจกต์
* [ ] วิธีการติดตั้งและรัน
* [ ] API Documentation พื้นฐาน
* [ ] ตัวอย่างการใช้งาน API

#### 3. การทดสอบ

* [ ] ทดสอบทุก API endpoint ด้วย Postman
* [ ] ทดสอบ error cases
* [ ] ทดสอบ authentication และ authorization

***

### Timeline แนะนำ (8 ชั่วโมง)

#### ชั่วโมงที่ 1: Setup & Database

* [ ] &#x20;สร้างโปรเจกต์และติดตั้ง dependencies
* [ ] &#x20;ตั้งค่า database connection
* [ ] &#x20;สร้าง database schema

#### ชั่วโมงที่ 2: Authentication

* [ ] &#x20;สร้าง User model และ registration
* [ ] &#x20;ใช้งาน bcrypt สำหรับ password hashing
* [ ] &#x20;สร้าง JWT authentication

#### ชั่วโมงที่ 3-4: Books Management

* [ ] &#x20;สร้าง Books model และ CRUD APIs
* [ ] &#x20;เพิ่ม Categories และ relationship
* [ ] &#x20;ใช้งาน file upload สำหรับรูปภาพ
* [ ] &#x20;ชั่วโมงที่ 5-6: Borrowing System
* [ ] &#x20;สร้าง Borrowings model
* [ ] &#x20;Logic การยืม-คืนหนังสือ
* [ ] &#x20;คำนวณค่าปรับและ overdue

#### ชั่วโมงที่ 7: Advanced Features

* [ ] &#x20;Reservation system
* [ ] &#x20;Reports และ statistics
* [ ] &#x20;Error handling ที่ดี

#### ชั่วโมงที่ 8: Testing & Docker

* [ ] &#x20;ทดสอบทุก API
* [ ] &#x20;ใช้งาน Docker
* [ ] &#x20;เขียน documentation

***

### Resources ที่อนุญาตให้ใช้

* Documentation: Node.js, Express.js, MySQL docs
* NPM Packages: express, mysql2, bcryptjs, jsonwebtoken, multer, express-validator
* Tools: Postman, MySQL Workbench, VS Code

***

### เกณฑ์ผ่าน

* 80+ คะแนน: ผ่านเกณฑ์การแข่งขัน (พร้อมแข่งจริง)
* 60-79 คะแนน: ผ่านพื้นฐาน (ต้องฝึกเพิ่ม)
* < 60 คะแนน: ต้องทบทวนและฝึกใหม่

***

<br>
