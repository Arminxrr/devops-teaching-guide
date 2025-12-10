---
icon: docker
---

# บทที่ 3 - Docker & Compose

คำสั่งสำคัญ:

<pre class="language-bash"><code class="lang-bash">docker ps -a            <a data-footnote-ref href="#user-content-fn-1"># ดูรายการคอนเทนเนอ</a>ร์
docker images           # ดูอิมเมจ
docker logs &#x3C;name>      # ดู log
docker exec -it &#x3C;name> bash   # เข้ากล่อง
docker rm -f &#x3C;name>     # ลบคอนเทนเนอร์
docker rmi &#x3C;image>      # ลบอิมเมจ
</code></pre>

โครงสร้าง Image → Container → Volume → Network\
เราจะใช้ **Compose** เพื่อรันหลาย service พร้อมกัน

[^1]: 
