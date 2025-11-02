# สร้าง Dashboard Grafana

เพิ่มบริการ grafana ลงใน `monitoring-compose.yml`:

```yaml
  grafana:
    image: grafana/grafana:11.1.0
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    depends_on:
      - prometheus
```

จากนั้นเข้า `http://localhost:3001` → Login → Add data source → Prometheus (`http://prometheus:9090`)  
เลือก Import Dashboard สำเร็จรูปเช่น Node Exporter Full
