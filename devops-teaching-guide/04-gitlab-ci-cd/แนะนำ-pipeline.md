# แนะนำ GitLab CI/CD Pipeline

ไฟล์หลักของ GitLab CI คือ `.gitlab-ci.yml` ที่ root ของ repo  
ประกอบด้วย **stages** และ **jobs** โดย jobs จะรันบน Runner

แนวคิดสำคัญ:
- ใช้ **tags** บน jobs ให้ตรงกับ runner
- ใช้ **artifacts** แชร์ผล build ระหว่าง jobs
- กำหนด **only/except** หรือ **rules** เพื่อควบคุมเมื่อไหร่ให้รัน
