---
description: >-
  คือขั้นตอนที่ระบบทำอัตโนมัติเมื่อมีการ push code เช่น  ดึงโค้ดจาก Git  Build
  (เช่น docker build)  Test (ตรวจสอบว่า build ผ่าน)   pipeline ของเราคือ  build 
  test
---

# ทำ CI/CD Pipeline

## เริ่มเเรกเราจำสร้าง repo ไว้ก่อนกดไปที่ Admin

<figure><img src="../.gitbook/assets/1.png" alt=""><figcaption></figcaption></figure>

## กด Create Project

<figure><img src="../.gitbook/assets/2.png" alt=""><figcaption></figcaption></figure>

## ใส่ชื่อ Project ของเราเเละกด Create Project

<figure><img src="../.gitbook/assets/3.png" alt=""><figcaption></figcaption></figure>

## เราก็จะได้ repo เพื่อทำ CI/CD Pipeline

<figure><img src="../.gitbook/assets/4 (3).png" alt=""><figcaption></figcaption></figure>

## ให้เราสร้างโครงสร้างเเบบนี้เพื่อ test Pipeline ก่อน

<figure><img src="../.gitbook/assets/Untitled design (3).png" alt=""><figcaption></figcaption></figure>

ตัวอย่างไฟล์   `.gitlab-ci.yml`   ใช้งานได้จริง

```shellscript
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - echo "Building Docker image..."
    - docker build -t myapp:latest .
  tags:
    - pond

test:
  stage: test
  script:
    - echo "Running tests..."
    - echo "All tests passed!"
  tags:
    - pond

deploy:
  stage: deploy
  script:
    - echo "Deploy to VM2"
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - echo "$DEPLOY_SSH_KEY" | tr -d '\r' > ~/.ssh/id_ed25519
    - chmod 600 ~/.ssh/id_ed25519
    - ssh-keyscan -H 192.168.100.21 >> ~/.ssh/known_hosts
    - |
      ssh -i ~/.ssh/id_ed25519 sry@192.168.100.21 "
        mkdir -p ~/deploy-app &&
        cd ~/deploy-app &&
        if [ -d .git ]; then
          git pull
        else
          git clone git@gitlab:root/projectdevops.git .
        fi
      "
  only:
    - main
  tags:
    - pond

```

ตัวอย่างไฟล์   `Dockerfile`

```shellscript
FROM alpine:3.20
CMD ["sh", "-c", "echo Hello from myapp && sleep 3600"]

```
