# รวม Log ด้วย Loki + Promtail

เพิ่มลง `monitoring-compose.yml`:

```yaml
  loki:
    image: grafana/loki:3.1.1
    ports: ["3100:3100"]
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:3.1.1
    volumes:
      - /var/log:/var/log
    command: -config.file=/etc/promtail/config.yml
```

เชื่อม Grafana → Data sources → Loki (`http://loki:3100`) → Explore logs
