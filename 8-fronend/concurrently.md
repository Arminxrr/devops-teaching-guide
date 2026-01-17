---
description: คืออะไรมันทำให้เราสามารถรันทั้ง backend เเละ fronend ได้เหมาะสำหรับการทำ CI/CD
---

# concurrently

ให้ไปที่โฟลเดอร์หลักที่มี `backend/` และ `Frontend/`

```shellscript
cd /root/iotdevops
npm init -y
npm install concurrently --save-dev

/root/iotdevops code . #เข้ามาเเก้ไข package.json
```

เปิด `/root/iotdevops/package.json`

```javascript
{
  "name": "iotdevops",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && node server.js",
    "dev:frontend": "cd Frontend/appvue && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}

```

เเค่นี้เราก็จะสามารถรันทั้งสอง folder รันด้วยคำสั่งเดียว&#x20;

```shellscript
npm run dev
```

<div align="left"><figure><img src="../.gitbook/assets/image (22).png" alt=""><figcaption></figcaption></figure></div>

> ถ้าได้เเบบนี้ก็พร้อมที่จะ Deploy
