# พื้นฐาน Docker แบบเร็ว

คำสั่งสำคัญ:
```bash
docker ps -a            # ดูรายการคอนเทนเนอร์
docker images           # ดูอิมเมจ
docker logs <name>      # ดู log
docker exec -it <name> bash   # เข้ากล่อง
docker rm -f <name>     # ลบคอนเทนเนอร์
docker rmi <image>      # ลบอิมเมจ
```

โครงสร้าง Image → Container → Volume → Network  
เราจะใช้ **Compose** เพื่อรันหลาย service พร้อมกัน
