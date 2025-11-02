# เพิ่มฐานข้อมูล Postgres ด้วย Docker

เราจะใช้ user/password/db = `kuy` / `123` / `pind`

ตัวอย่าง `docker-compose.yml` (ดูบทถัดไปสำหรับไฟล์เต็ม):
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: kuy
      POSTGRES_PASSWORD: "123"
      POSTGRES_DB: pind
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata: {}
```
ทดสอบเชื่อมต่อ:
```bash
docker compose up -d db
docker exec -it $(docker compose ps -q db) psql -U kuy -d pind -c "SELECT NOW();"
```
