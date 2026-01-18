# เตรียมโครงสร้าง

ให้เราเปิด Ubuntu ขึ้นมาเเล้วเข้าไปที่ folder เดียวเราที่เราทำ backend เเล้วใช้คำสั่ง mkdir เพื่อสร้างอีก folder ชื่อว่า Fronend

```shellscript
cd Frontend/
npm create vue@latest ##เเล้วติดตั้ง app vue 
/iotdevops/Frontend# code . #มันก็เด้งเข้าไปใน vscode 
```

เราก็จะได้ folder มาเพื่อเอามาใช้งานเเล้วสร้างที่ขาดหายเลยตามรูปที่เเนบไปให้เลยครับ

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
