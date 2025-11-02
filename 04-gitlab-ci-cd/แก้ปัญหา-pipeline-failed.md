# Debug Pipeline Failed

เทคนิค:
- เปิดดู **Job Logs** เพื่อดูบรรทัดที่ผิดพลาด
- ตรวจดู **variables** (CI/CD → Variables) ว่าตั้งครบหรือไม่
- เช็กว่า Runner ติด tag ตรงกับ jobs หรือเปล่า
- สำหรับ docker-in-docker: ตรวจเวอร์ชัน image docker/dind ให้เข้ากัน
- ใช้คำสั่ง `echo`, `env`, `pwd`, `ls -al` ช่วยตรวจระหว่างรัน
