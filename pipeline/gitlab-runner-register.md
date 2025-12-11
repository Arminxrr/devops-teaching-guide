# การสร้าง Gitlab-Runner Register

เข้าไปที่ [`http://192.168.100.11/`](http://192.168.100.11/dashboard/home)  ที่ตั้งไว้ กดไปที่ Admin&#x20;

<div align="left"><figure><img src="../.gitbook/assets/42.png" alt=""><figcaption></figcaption></figure></div>

กดที่ CI/CD เเละ Runner สร้าง Create instance runner

<figure><img src="../.gitbook/assets/43.png" alt=""><figcaption></figcaption></figure>

เพิ่ม Tags เเล้วติ๊ก Run untagged jobs

<div align="left"><figure><img src="../.gitbook/assets/44.png" alt=""><figcaption></figcaption></figure></div>

เลื่อนไปล่างสุดกด Create  runner

<figure><img src="../.gitbook/assets/45.png" alt=""><figcaption></figcaption></figure>

> Tags สำคัญมาก

<figure><img src="../.gitbook/assets/46.png" alt=""><figcaption></figcaption></figure>

```shellscript
#คำสั่งสร้าง register
docker exec -it gitlab-runner gitlab-runner register

#url เป็นลิ้ง หน้า gitlab
Enter the GitLab instance URL (for example, https://gitlab.com/):
http://192.168.100.11/
Enter the registration token:
GmcN4Q4bpxSbmXKxfbpz                    #เอามาจาก runner มีตัวอย่างข้างล่างนี้
Enter a description for the runner:
[ddfbc5e6ac4c]: sry                     #เป็นชื่ออยู่บน Status
Enter tags for the runner (comma-separated):
pond                                    #สำคัญตั้งให้ตรงกับที่สร้างไว้
Enter optional maintenance note for the runner:
shell                                   #start ด้วย shell

#ขึ้นเเบบนี้ให้พิมพ์ shell
WARNING: Support for registration tokens and runner parameters in the 'register' command has been deprecated in GitLab Runner 15.6 and will be replaced with support for authentication tokens. For more information, see https://docs.gitlab.com/ci/runners/new_creation_workflow/
Registering runner... succeeded                     correlation_id=01KC6ZJ77D6AP6TJ3PJKHTD4GM runner=GmcN4Q4bp
Enter an executor: custom, shell, ssh, parallels, virtualbox, docker+machine, docker-autoscaler, docker, docker-windows, kubernetes, instance:
shell
```

## Token ที่ต้องใช้เวลา register

<figure><img src="../.gitbook/assets/46.png" alt=""><figcaption></figcaption></figure>

{% hint style="success" %}
Online เเล้วเเสดงว่าใช้งานได้เเล้ว
{% endhint %}
