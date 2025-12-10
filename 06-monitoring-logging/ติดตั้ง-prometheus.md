---
icon: tv
---

# บทที่ 6 - Monitoring & Logging

สร้างไฟล์ `monitoring-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus:v2.54.1
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports:
      - "9090:9090"

  node_exporter:
    image: prom/node-exporter:v1.8.1
    ports:
      - "9100:9100"
```

ไฟล์ `monitoring/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ["prometheus:9090"]
  - job_name: node
    static_configs:
      - targets: ["node_exporter:9100"]
```

รัน:

```bash
docker compose -f monitoring-compose.yml up -d
```

เปิดดู: `http://localhost:9090`
