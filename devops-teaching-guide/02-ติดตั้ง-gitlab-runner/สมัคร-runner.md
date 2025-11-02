# สมัคร GitLab Runner (โหมด Docker หรือ Shell)

## ติดตั้ง GitLab Runner
```bash
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt -y install gitlab-runner
```

## ลงทะเบียน Runner
ไปที่ GitLab → Project → Settings → CI/CD → Runners → คัดลอก Registration token

```bash
sudo gitlab-runner register
# ให้ตอบประมาณนี้:
# URL: http://gitlab.local
# Token: <วาง token>
# Description: vm2-runner
# Tags: vm2,docker
# Executor: docker (หรือ shell)
# ถ้า docker: Image เริ่มต้นเช่น docker:24.0
```

ตรวจสอบ:
```bash
gitlab-runner list
sudo gitlab-runner status
```
