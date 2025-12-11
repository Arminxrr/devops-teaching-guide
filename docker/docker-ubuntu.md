# ติดตั้ง Docker บน Ubuntu

```shellscript
#อัพเดตระบบก่อน
sudo apt update 

#ติดตั้ง ssh-server
sudo apt install -y openssh-server 

#เสร็จแล้วเช็คว่า service รันหรือยัง
sudo systemctl status ssh

#ตัวอย่างการ remote ใช้ใน terminal
ssh pond@192.168.1.11
pond@vm1:~$

#เมื่อเราโยนลงไฟล์ไปเเล้วให้ดึงลงมาที่ VM
scp -r user@IPต้นทาง:/path/ต้นทาง /path/ปลายทาง
sudo scp -r root@192.168.100.100:/root/offline /home/root/

#ถ้าเราเอาไฟล์ offline ที่ผมให้ไปเเล้วจะสามารถติดตั้งได้เเล้ว
pond@vm1:~$ ls
docker-offline

#จะเจอกับFolder docker-offline ให้ใช้คำสั่ง cd เข้าไป
pond@vm1:~$ cd docker-offline
pond@vm1:~$ sudo dpkg -i *.deb             #เพื่อติดตั้ง   

#เสร็จให้ ติดตั้ง docker-compose
sudo mv docker-compose /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

#ดูว่ารันอยู่ไหม
sudo systemctl status docker

#ต้องขึ้น
active (running)

#ทดสอบเวอร์ชัน
docker --version
docker compose version
```
