# โครงสร้างการทำงาน

### ESP32 + DHT11 (ต้นทาง: Sensor)

* **DHT11** วัดค่า **อุณหภูมิ (temp)** และ **ความชื้น (humid)**
* ESP32 อ่านค่าทุก ๆ เช่น 5 วินาที
* ESP32 จะ “แพ็กข้อมูล” เป็นข้อความ (ส่วนมากเป็น **JSON**) แล้วส่งออกไป

ตัวอย่าง payload ที่ส่ง

```json
{"temp":29.50,"humid":62}
```

### MQTT Broker (ตัวกลาง: คนรับ-กระจาย)

* MQTT คือระบบส่งข้อความแบบ **Publish/Subscribe**
* ESP32 ทำหน้าที่ **Publish** ไปที่ “หัวข้อ” (Topic) เช่น:
  * `sensors/pond`
* Broker (เช่น Mosquitto) รับข้อความไว้ แล้ว “กระจาย” ให้ทุกคนที่ **Subscribe topic นี้**

> สำคัญ: MQTT ทำให้ ESP32 ไม่ต้องรู้ว่าใครจะรับข้อมูลบ้าง แค่ส่งไปที่ topic ก็พอ

### Node-RED (ตัวประสานงาน: แปลง/ตัดสินใจ/ส่งต่อ)

#### ทำ Dashboard / Monitoring ทันที

* Node-RED Subscribe topic `sensors/pond`
* แปลง JSON → เอาค่าไปโชว์บน **Dashboard** (เกจ, กราฟ, ตาราง)

#### ส่งต่อให้ Backend (เพื่อเก็บลงฐานข้อมูล/ทำระบบผู้ใช้)

* Node-RED รับ JSON แล้ว
  * ตรวจความถูกต้อง/กรองข้อมูล
  * จัดรูปแบบเพิ่ม (เช่น timestamp, device\_id)
  * จากนั้น **ยิง HTTP Request ไป Backend API** เช่น:
    * `POST /api/sensors/ingest`

> Node-RED เลยเหมือน “ศูนย์รวมท่อ” ที่ทำได้ทั้งแสดงผลสด + ส่งเข้าระบบหลัก

### Backend (API Server: สมองของระบบ)

Backend คือส่วนที่ทำ “ระบบจริง” เช่น Node.js/Express

หน้าที่หลัก:

* รับข้อมูลจาก Node-RED (หรือรับจาก ESP32 โดยตรงก็ได้)
* ตรวจสิทธิ์/ตรวจรูปแบบข้อมูล (validation)
* บันทึกลงฐานข้อมูล (Postgres/MySQL)
* ทำ API ให้ Frontend เรียกดูข้อมูล เช่น
  * `GET /api/sensors/latest` (ค่าล่าสุด)
  * `GET /api/sensors/history?from=...&to=...` (ย้อนหลัง)
  * `GET /api/devices` (รายชื่ออุปกรณ์)
* จัดการ **Login/JWT/Role** (แยก user/admin)

### Frontend (หน้าจอผู้ใช้)

Frontend เรียก **Backend API** เพื่อดึงข้อมูลไปแสดง
