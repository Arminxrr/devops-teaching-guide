# ขั้นตอน public key ไปใส่ใน GitLab

### ไปที่หน้า Project

<div align="left"><figure><img src="../.gitbook/assets/6 (1) (1).png" alt=""><figcaption></figcaption></figure></div>

### ให้ไปที่ Repository เเละหา Deploy Keys

<figure><img src="../.gitbook/assets/7 (1) (1).png" alt=""><figcaption></figcaption></figure>

### ให้ไปที่ Add key

<figure><img src="../.gitbook/assets/8 (1) (1).png" alt=""><figcaption></figcaption></figure>

### Title อะไรก็ได้ใส่ key ที่ได้มาจากคำสั่ง `cat ~/.ssh/gitlab_deploy.pub` เเละติ๊ก Grant write permissions to this key กด Add key

<figure><img src="../.gitbook/assets/10 (1).png" alt=""><figcaption></figcaption></figure>

### เอา public key ไปใส่ใน GitLab `cat ~/.ssh/gitlab_deploy.pub`

<figure><img src="../.gitbook/assets/9 (1).png" alt=""><figcaption></figcaption></figure>

### เสร็จก็จะได้เเบบนี้

<figure><img src="../.gitbook/assets/11 (1).png" alt=""><figcaption></figcaption></figure>
