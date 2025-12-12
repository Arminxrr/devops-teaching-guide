# ติดตั้ง Gitlab runner บน Ubuntu

```shellscript
#ดูว่ามีไฟล์เเล้วหรือยัง
pond@vm1:~$ ls
docker-offline  gitlab-ce.tar  gitlab-runner.tar  ssh-offline

#ถ้ามีอยู่เเล้วให้ใช้คำสั่งนี้เลย
pond@vm1:~$ sudo docker load -i gitlab-runner.tar

#เราก็จะได้ images มา
pond@vm1:~$ sudo docker images
                                                                                                                                i Info →   U  In Use
IMAGE                         ID             DISK USAGE   CONTENT SIZE   EXTRA
gitlab/gitlab-ce:latest       f57bc87b0ee0       6.07GB         1.83GB    U
gitlab/gitlab-runner:latest   03db513786ad        439MB          102MB

#ถ้า docker: permission denied ... docker.sock ให้เพิ่ม user ที่รันคำสั่ง (เช่น pond) เข้า group docker แล้ว reboot:
sudo usermod -aG docker pond
sudo reboot

#สร้างcontainer
docker run -d \
  --name gitlab-runner \
  --restart always \
  -v /srv/gitlab-runner/config:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  gitlab/gitlab-runner:latest \
  run --user=root --working-directory=/root

#เช็คว่า container ขึ้นแล้ว
docker ps | grep gitlab-runner

#จะเห็นว่ามันรันอยู่ ถ้าเห็น gitlab-runner = พร้อม register ✅

pond@vm1:~$ sudo docker ps | grep gitlab-runner
ddfbc5e6ac4c   gitlab/gitlab-runner:latest   "/usr/bin/dumb-init …"   12 seconds ago   Up 11 seconds                                                                                                                                  gitlab-runner

#คำสั่ง register gitlab runner
docker exec -it gitlab-runner gitlab-runner register

```

{% hint style="success" %}
ถ้าขึ้น Statu เเบบนี้เเปลว่า รันเเล้ว
{% endhint %}

<figure><img src="../.gitbook/assets/Ether (8).png" alt=""><figcaption></figcaption></figure>
