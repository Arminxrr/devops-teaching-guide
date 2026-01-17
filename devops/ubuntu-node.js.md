# ติดตั้ง Ubuntu ให้พร้อมใช้งาน Node.js

<pre class="language-shellscript"><code class="lang-shellscript"><strong># ขั้นตอนที่ 1: ติดตั้ง Node.js 18
</strong># อัปเดตระบบก่อน
sudo apt update

# ติดตั้ง Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# ตรวจสอบว่าติดตั้งสำเร็จ
node -v
npm -v
# ผลลัพธ์ที่ควรเห็น: Node.js v18.x.x และ npm version

#ให้เราสร้าง folder 
mkdir ชื่อfolder
cd ชื่อfolder

pond#                            #เเบบนี้คือเข้าfolder มาเเล้ว  
#ให้ติดตั้ง package ทั้งหมดหรือตามที่เราใช้งาน
pond$ npm init -y
pond$ npm i express cors dotenv jsonwebtoken express-validator multer pg
# ถ้าเรามี vscode 
pond$ code .                    #สามารถดูไฟล์ node_modules ได้บนvscode 
</code></pre>

เราก็จะได้  `node_modules`  มาอยู่ในโฟลเดอร์เพื่อเอามาใช้ทำโปรเจคต่างๆ

<div align="left"><figure><img src="../.gitbook/assets/image (2) (1) (1).png" alt=""><figcaption></figcaption></figure></div>
