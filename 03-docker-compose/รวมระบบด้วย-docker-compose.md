# รวมระบบด้วย Docker Compose (Frontend + Backend + DB)

สร้างไฟล์ `docker-compose.yml` ที่ root ของ repo:

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: kuy
      POSTGRES_PASSWORD: "123"
      POSTGRES_DB: pind
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DB_HOST: db
      DB_USER: kuy
      DB_PASS: "123"
      DB_NAME: pind
      PORT: 3000
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "3000:3000"

  frontend:
    image: nginx:alpine
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
      - ./nginx/dev.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    ports:
      - "8080:80"

volumes:
  pgdata: {}
```

**ตัวอย่าง `nginx/dev.conf`**
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  location /api/ {
    proxy_pass http://backend:3000/;
  }
  location / {
    try_files $uri /index.html;
  }
}
```
จากนั้นรัน:
```bash
docker compose up -d --build
curl http://localhost:8080/api/health
```
