# ติดตั้ง Gitlab Server บน Ubuntu

> Ubuntu 24

```shellscript
# ที่ผมให้โยนเข้าไปจะมี ไฟล์พวกนี้อยู่
pond@vm1:~$ ls
docker-offline  gitlab-ce.tar  gitlab-runner.tar  ssh-offline

#ให้ใช้คำสั่งนี้ติดตั้ง images gitlab-ce.tar รอจนกว่าจะเสร็จ
sudo docker load -i gitlab-ce.tar

#ถ้าเสร็จเเล้วใช้คำสั่งนี้เพื่อเช็ค images
sudo docker images             #จะเห็น images ที่เราลงไว้
IMAGE                     ID             DISK USAGE   CONTENT SIZE   EXTRA
gitlab/gitlab-ce:latest   f57bc87b0ee0       6.07GB         1.83GB

#ทำการสร้าง Folder ลงgitlab 
sudo mkdir -p /srv/gitlab/config
sudo mkdir -p /srv/gitlab/logs
sudo mkdir -p /srv/gitlab/data
sudo chmod -R 777 /srv/gitlab

#คำสั่งติดตั้ง gitlab-server --hostname 192.168.xx.xx \ urlเปลี่ยนได้ตามที่เราต้องการ สำคัญ
sudo docker run -d \
  --hostname 192.168.100.10 \
  -p 80:80 \
  -p 443:443 \
  -p 2222:22 \
  --name gitlab-ce \
  --restart always \
  -v /srv/gitlab/config:/etc/gitlab \
  -v /srv/gitlab/logs:/var/log/gitlab \
  -v /srv/gitlab/data:/var/opt/gitlab \
  gitlab/gitlab-ce:latest
#รอเสร็จประมาณ 5 นาทีเพราะไฟล์มีขนาดใหญ่

#http://192.168.100.11 /เช็คด้วยการเข้าหน้า url IP ที่เราตั้งไว้
sudo docker exec -it gitlab-ce gitlab-rake "gitlab:password:reset[root]"

```

### URL [`http://192.168.100.11/`](http://192.168.100.11/dashboard/projects) ที่เราตั้ง url ไว้ login ด้วย root กับ password ที่ reset ไว้

<figure><img src="../.gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/image (1) (1).png" alt=""><figcaption></figcaption></figure>

> GITLAB CE SERVER&#x20;
