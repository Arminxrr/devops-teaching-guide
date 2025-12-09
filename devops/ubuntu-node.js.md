# ติดตั้ง Ubuntu ให้พร้อมใช้งาน Node.js ก่อนทำงาน

<pre class="language-shellscript"><code class="lang-shellscript"><strong>## ขั้นตอนที่ 1: ติดตั้ง Node.js 18
</strong>## อัปเดตระบบก่อน
sudo apt update

## ติดตั้ง Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

## ตรวจสอบว่าติดตั้งสำเร็จ
node -v
npm -v
## ผลลัพธ์ที่ควรเห็น: Node.js v18.x.x และ npm version

</code></pre>
