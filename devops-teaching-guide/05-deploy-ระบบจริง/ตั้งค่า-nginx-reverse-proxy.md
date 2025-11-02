# ตั้งค่า Nginx Reverse Proxy

ไฟล์ตัวอย่าง `/etc/nginx/sites-available/app.conf`:

```nginx
server {
  listen 80;
  server_name _;  # เปลี่ยนเป็นโดเมนของคุณถ้ามี

  location /api/ {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_pass http://127.0.0.1:3000/;
  }

  location / {
    root /var/www/html;
    try_files $uri /index.html;
  }
}
```

คำสั่งพื้นฐาน:
```bash
sudo nginx -t
sudo systemctl reload nginx
sudo journalctl -u nginx -f
```
