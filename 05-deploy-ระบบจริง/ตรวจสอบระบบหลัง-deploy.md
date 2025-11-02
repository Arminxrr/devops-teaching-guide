# ตรวจสอบระบบหลัง Deploy

เช็ครอบด้าน:
```bash
docker compose ps
docker logs backend --since=1h
curl -i http://localhost:3000/health
```
การแก้ปัญหาทั่วไป:
- Port ชน: ใช้ `lsof -i :3000` หรือเปลี่ยนพอร์ต
- DB ไม่พร้อม: ใช้ healthcheck + `depends_on` แบบ condition
- Permission โฟลเดอร์: ตรวจสิทธิ์ volume และ user ภายใน container
