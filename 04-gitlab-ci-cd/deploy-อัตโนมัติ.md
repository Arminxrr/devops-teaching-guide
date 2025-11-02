# Deploy อัตโนมัติด้วย GitLab CI

เพิ่ม stage deploy ใน `.gitlab-ci.yml` (ต่อจากบทก่อน):

```yaml
deploy_prod:
  stage: deploy
  tags: ["vm2","shell"]   # หรือใช้ docker ก็ได้
  script:
    - docker load < backend.tar
    - docker compose -f docker-compose.yml up -d --build
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

> แนวทางจริงนิยม SSH ไปยังเครื่อง production แล้วรัน compose ที่เครื่องนั้น (ถ้า Runner ไม่อยู่เครื่องเดียวกับ prod)
