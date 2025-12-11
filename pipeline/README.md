---
icon: square-gitlab
---

# บทที่ 4 - GitLab CI/CD

ไฟล์หลักของ GitLab CI คือ `.gitlab-ci.yml` ที่ root ของ repo\
ประกอบด้วย **stages** และ **jobs** โดย jobs จะรันบน Runner

แนวคิดสำคัญ

* ใช้ **tags** บน jobs ให้ตรงกับ runner
* ใช้ **artifacts** แชร์ผล build ระหว่าง jobs
