---
icon: gitlab
---

# บทที่ 2 - ติดตั้ง GitLab + Runner

> ตัวอย่างตั้งค่า URL ภายในเครือข่าย `http://gitlab.local` (แก้เป็น IP/โดเมนของคุณ)

หลังติดตั้ง เข้าเว็บ `http://gitlab.local` → Login ด้วยผู้ใช้ `root` และรหัสที่ได้จากไฟล์ด้านบน แล้วเปลี่ยนรหัสผ่านใหม่

```bash
# เพิ่ม repository และติดตั้ง
curl -fsSL https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | sudo bash
sudo EXTERNAL_URL="http://gitlab.local" apt -y install gitlab-ce

# ดูรหัสผ่านเริ่มต้นของ root (ครั้งแรก)
sudo cat /etc/gitlab/initial_root_password
```

หลังติดตั้ง เข้าเว็บ `http://gitlab.local` → Login ด้วยผู้ใช้ `root` และรหัสที่ได้จากไฟล์ด้านบน แล้วเปลี่ยนรหัสผ่านใหม่

หลังติดตั้ง เข้าเว็บ `http://gitlab.local` → Login ด้วยผู้ใช้ `root` และรหัสที่ได้จากไฟล์ด้านบน แล้วเปลี่ยนรหัสผ่านใหม่
