# Compose สำหรับ Production

ตัวอย่าง `docker-compose.prod.yml` (backend + db ไม่มี frontend แบบ nginx ภายใน):

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: kuy
      POSTGRES_PASSWORD: "123"
      POSTGRES_DB: pind
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      DB_HOST: db
      DB_USER: kuy
      DB_PASS: "123"
      DB_NAME: pind
      PORT: 3000
    depends_on:
      - db
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  pgdata: {}
```

รัน:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
