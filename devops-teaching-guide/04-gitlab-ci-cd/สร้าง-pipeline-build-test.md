# Pipeline: Build & Test

สร้างไฟล์ `.gitlab-ci.yml` ขั้นต้น:

```yaml
stages:
  - build
  - test

variables:
  DOCKER_TLS_CERTDIR: ""

build_backend:
  stage: build
  tags: ["vm2","docker"]
  image: docker:24.0
  services: ["docker:24.0-dind"]
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHORT_SHA ./backend
    - docker save $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHORT_SHA > backend.tar
  artifacts:
    paths:
      - backend.tar
    expire_in: 1 week

unit_test_dummy:
  stage: test
  image: node:20-alpine
  script:
    - node -e "console.log('✅ ตัวอย่างทดสอบผ่าน')"
```

> ครูสามารถเพิ่ม Jest หรือ Supertest เพื่อทดสอบ API จริงได้ภายหลัง
