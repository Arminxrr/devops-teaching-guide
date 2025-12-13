---
description: >-
  การติดตั้ง Proxmox VE บน Server เพื่อเตรียมระบบ Virtualization สำหรับใช้งาน
  Virtual Machine และ Container ในงาน DevOps และ Production
icon: server
---

# บทที่ 2 -ติดตั้ง Server + Proxmox

> **Proxmox VE** เป็นแพลตฟอร์ม Virtualization แบบโอเพนซอร์สที่ใช้สำหรับบริหารจัดการ Virtual Machine (VM) และ Container บน Server โดยรองรับการใช้งานทั้งในสภาพแวดล้อม DevOps, Lab และ Production บทนี้จะอธิบายขั้นตอนการติดตั้ง Proxmox VE บนเครื่อง Server ตั้งแต่การเตรียมอุปกรณ์ การติดตั้งระบบ ไปจนถึงการตั้งค่า Network เพื่อให้พร้อมใช้งานเป็น Hypervisor สำหรับบทถัดไป

#### **วัตถุประสงค์ของบทนี้**

* สามารถเตรียมอุปกรณ์และไฟล์สำหรับการติดตั้ง Proxmox VE
* ติดตั้ง Proxmox VE บน Server ได้อย่างถูกต้อง
* ตั้งค่า Network และระบบพื้นฐานหลังการติดตั้ง
* สร้าง Virtual Machine เพื่อใช้งานในงาน Server และ DevOps
