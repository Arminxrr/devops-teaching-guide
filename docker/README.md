---
icon: docker
---

# บทที่ 3 - Docker & Compose

> Docker คือเทคโนโลยี Containerization ที่ช่วยให้การพัฒนาและใช้งานแอปพลิเคชันมีความยืดหยุ่น รวดเร็ว และสม่ำเสมอ ส่วน Docker Compose ใช้สำหรับจัดการหลาย Container พร้อมกัน เหมาะมากสำหรับงาน DevOps, Backend, Microservices และระบบ Production ขนาดเล็ก-กลาง

คำสั่งสำคัญ:

<pre class="language-bash"><code class="lang-bash">docker ps -a            <a data-footnote-ref href="#user-content-fn-1"># ดูรายการคอนเทนเนอ</a>ร์
docker images           # ดูอิมเมจ
docker logs &#x3C;name>      # ดู log
docker exec -it &#x3C;name> bash   # เข้ากล่อง
docker rm -f &#x3C;name>     # ลบคอนเทนเนอร์
docker rmi &#x3C;image>      # ลบอิมเมจ
</code></pre>



[^1]: 
