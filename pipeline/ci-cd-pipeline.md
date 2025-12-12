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

## ต่อไปให้เราไปทำที่ VM1

```shellscript
sudo apt update
sudo apt install -y openssh-server

เสร็จแล้วเช็คว่า service รันหรือยัง
sudo systemctl status ssh

ตัวอย่างการเข้า tm
ssh pond@192.168.1.10

```

## ให้เราสร้างโครงสร้างเเบบนี้เพื่อ test Pipeline ก่อน

<figure><img src="../.gitbook/assets/Untitled design (3).png" alt=""><figcaption></figcaption></figure>

ตัวอย่างไฟล์   `.gitlab-ci.yml`   ใช้งานได้จริง

```shellscript
stages:
  - build  # ขั้นตอนการ build
  - test   # ขั้นตอนการทดสอบ
  - deploy # ขั้นตอนการ deploy

build:
  stage: build
  script:
    - echo "Building Docker image..."  # แสดงข้อความว่าเริ่มการสร้าง Docker image
    - docker build -t myapp:latest .  # สร้าง Docker image โดยใช้ Dockerfile ในโฟลเดอร์ปัจจุบัน
  tags:
    - pond  # ใช้ runner ที่มี tag pond

test:
  stage: test
  script:
    - echo "Running tests..."  # แสดงข้อความว่าเริ่มการทดสอบ
    - echo "All tests passed!"  # แสดงข้อความว่า "ทุกการทดสอบผ่านแล้ว"
  tags:
    - pond  # ใช้ runner ที่มี tag pond

deploy:
  stage: deploy
  script:
    - echo "Deploy to VM2"  # แสดงข้อความว่าเริ่มการ deploy ไปยัง VM2
    - mkdir -p ~/.ssh  # สร้างโฟลเดอร์ ~/.ssh ถ้าไม่มี
    - chmod 700 ~/.ssh  # ตั้งสิทธิ์ให้โฟลเดอร์ ~/.ssh เป็น 700 (เฉพาะเจ้าของเข้าถึงได้)
    - echo "$DEPLOY_SSH_KEY" | tr -d '\r' > ~/.ssh/id_ed25519  # นำค่า SSH private key มาตั้งในไฟล์ id_ed25519 และลบ \r ออก
    - chmod 600 ~/.ssh/id_ed25519  # ตั้งสิทธิ์ให้ไฟล์ id_ed25519 เป็น 600 (เฉพาะเจ้าของอ่านเขียนได้)
    - ssh-keyscan -H 192.168.100.21 >> ~/.ssh/known_hosts  # เพิ่ม public key ของเซิร์ฟเวอร์ใน known_hosts เพื่อหลีกเลี่ยงการเตือนเมื่อเชื่อมต่อ
    - |
      ssh -i ~/.ssh/id_ed25519 sry@192.168.100.21 "  # เข้าสู่เซิร์ฟเวอร์ 192.168.100.21 ด้วย SSH key ที่เตรียมไว้
        mkdir -p ~/deploy-app &&  # สร้างโฟลเดอร์ ~/deploy-app ถ้าไม่มี
        cd ~/deploy-app &&  # เข้าไปในโฟลเดอร์ ~/deploy-app
        if [ -d .git ]; then  # ถ้ามี repository Git อยู่แล้ว
          git pull  # ดึงข้อมูลล่าสุดจาก repository
        else
          git clone git@gitlab:root/projectdevops.git .  # ถ้าไม่มีให้ clone repository ใหม่
        fi
      "
  only:
    - main  # ทำขั้นตอนนี้เฉพาะเมื่อมีการ push ไปที่ branch main
  tags:
    - pond  # ใช้ runner ที่มี tag pond

```

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
