---
description: >-
  โปรเจกต์ backend ทำงานได้จริง และ เชื่อมกับบริการที่ต้องใช้ (เช่น DB, auth,
  API อื่น ๆ)
---

# ติดตั้งแพ็กเกจเเละทำการเชื่อม backend

### ติดตั้ง app vue ให้เรากดข้ามด้วยการกด Enter เเละตั้งชื่อ Folder&#x20;

```shellscript
##ติดตั้ง app vue บน folder ของเรา
npm create vue@latest
```

<figure><img src="../.gitbook/assets/image (1) (1).png" alt=""><figcaption></figcaption></figure>

> สำคัญมากอย่าลืมติดตั้งเเพ็กเกจ

```shellscript
#เข้า folder ของงานเรา
cd /root/iotdevops/Frontend/appvue

#ติดตั้ง เเพ็กเกจ
npm i axios vue-router

```

### ตั้งค่า API base ด้วย Vite env ไฟล์ `Frontend/appvue/.env`

```javascript
VITE_API_BASE=http://localhost:3000
```

### `src/services/api.js` (axios + Bearer token อัตโนมัติ)

```javascript
import axios from 'axios'

// ดึง base url จาก .env ของ Vite
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_BASE
})

// แนบ Authorization: Bearer <token> ให้อัตโนมัติทุก request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

```

### `src/services/authStore.js` (เก็บสถานะ user/token )

```javascript
import { reactive } from 'vue'
import { api } from './api'

export const auth = reactive({
  token: localStorage.getItem('token') || '',
  user: null,              // {id, username, role}
  isReady: false           // โหลด /api/me เสร็จหรือยัง
})

// โหลดข้อมูลผู้ใช้จาก token (เรียก /api/me)
export const refreshMe = async () => {
  auth.isReady = false
  try {
    if (!auth.token) {
      auth.user = null
      return
    }
    const res = await api.get('/api/me')
    auth.user = res.data.user
  } catch {
    // token หมดอายุ/ไม่ถูกต้อง → ล้างออก
    auth.token = ''
    auth.user = null
    localStorage.removeItem('token')
  } finally {
    auth.isReady = true
  }
}

export const setToken = (token) => {
  auth.token = token
  localStorage.setItem('token', token)
}

export const clearAuth = () => {
  auth.token = ''
  auth.user = null
  localStorage.removeItem('token')
}

```

### `src/router.js` (4 หน้า + guard)

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './views/HomePage.vue'
import LoginPage from './views/LoginPage.vue'
import MePage from './views/MePage.vue'
import UsersPage from './views/UsersPage.vue'
import SensorsPage from './views/SensorsPage.vue'
import { auth, refreshMe } from './services/authStore'

const routes = [
  { path: '/', component: HomePage },            // เรียก GET /api/health
  { path: '/login', component: LoginPage },
  { path: '/me', component: MePage },            // ต้อง login
  { path: '/users', component: UsersPage },      // ต้อง login
  { path: '/sensors', component: SensorsPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// กันหน้า /me และ /users ถ้าไม่มี token
router.beforeEach(async (to) => {
  const protectedPaths = ['/me', '/users']
  if (protectedPaths.includes(to.path)) {
    // ถ้ามี token แต่ยังไม่รู้ user ให้ลอง refresh /me
    if (auth.token && !auth.user) {
      await refreshMe()
    }
    if (!auth.token) return '/login'
  }
})

export default router
```

### เพิ่มไฟล์ `src/main.js`

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

createApp(App).use(router).mount('#app')
```

### `src/App.vue` (เมนู + แสดง role + logout)

```javascript
<script setup>
import { computed, onMounted } from 'vue'
import { auth, refreshMe, clearAuth } from './services/authStore'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLoggedIn = computed(() => !!auth.token)
const role = computed(() => auth.user?.role || '-')

const logout = () => {
  clearAuth()
  router.push('/login')
}

onMounted(async () => {
  // ถ้ามี token ค้างอยู่ ลองโหลดข้อมูล user
  if (auth.token) await refreshMe()
})
</script>

<template>
  <div style="max-width: 980px; margin: 20px auto; font-family: sans-serif;">
    <header style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <router-link to="/">Home</router-link>
        <router-link to="/sensors">Sensors</router-link>
        <router-link to="/users" v-if="isLoggedIn">Users</router-link>
        <router-link to="/me" v-if="isLoggedIn">Me</router-link>
        <router-link to="/login" v-if="!isLoggedIn">Login</router-link>
      </div>

      <div style="display:flex;gap:10px;align-items:center;">
        <span v-if="isLoggedIn">
          <b>{{ auth.user?.username }}</b> (role: <b>{{ role }}</b>)
        </span>
        <button v-if="isLoggedIn" @click="logout">Logout</button>
      </div>
    </header>

    <hr />

    <router-view />
  </div>
</template>

```

### หน้า login เก็บ token เเละเช็ค role `src/views/LoginPage.vue`

```javascript
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { setToken, refreshMe } from '../services/authStore'

const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const submit = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await api.post('/api/login', {
      username: username.value,
      password: password.value
    })
    const token = res.data?.token
    if (!token) throw new Error('Missing token in response')
    setToken(token)
    await refreshMe()
    router.push('/me')
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="grid two">
      <div class="panel hero">
        <span class="pill">Secure Access</span>
        <div class="hero-title space-top">Sign in to manage your IoT fleet</div>
        <p class="hero-sub space-top">
          ระบบยืนยันตัวตนเพื่อควบคุมอุปกรณ์ ตรวจสอบข้อมูล และจัดการผู้ใช้อย่างปลอดภัย
        </p>
        <div class="form-row space-top">
          <span class="chip">Token auth</span>
          <span class="chip">Role-based</span>
          <span class="chip">Audit ready</span>
        </div>
      </div>

      <div class="panel panel-narrow">
        <div class="page-header">
          <h2>Login</h2>
          <p class="muted">เข้าใช้งานเพื่อจัดการข้อมูลอุปกรณ์และบัญชีผู้ใช้</p>
        </div>

        <form class="form-column" @submit.prevent="submit">
          <input v-model="username" placeholder="username" autocomplete="username" />
          <input
            v-model="password"
            type="password"
            placeholder="password"
            autocomplete="current-password"
          />
          <button type="submit" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p v-if="error" class="error space-top">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

```

### หน้า Home (เช็ก server ขึ้น): `src/views/HomePage.vue` เรียก GET `/`

```javascript
<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

const serverMsg = ref('กำลังเช็กเซิร์ฟเวอร์...')
const error = ref('')

onMounted(async () => {
  try {
    // backend ของคุณส่งเป็น text
    const res = await api.get('/')
    serverMsg.value = res.data
  } catch (e) {
    error.value = e.message
    serverMsg.value = ''
  }
})
</script>

<template>
  <div>
    <h2>Home</h2>
    <p v-if="error" style="color:red;">{{ error }}</p>
    <p v-else>{{ serverMsg }}</p>
    <p style="opacity:.75;">
      หน้านี้เรียก GET / เพื่อทดสอบว่า Express server ทำงานอยู่
    </p>
  </div>
</template>

```

### หน้า Me: `src/views/MePage.vue` (ดูข้อมูลตัวเองจาก token)

```javascript
<script setup>
import { auth, refreshMe } from '../services/authStore'

const reload = async () => {
  await refreshMe()
}
</script>

<template>
  <div>
    <h2>My Profile</h2>

    <button @click="reload">Reload /api/me</button>

    <pre style="background:#111;color:#eee;padding:12px;border-radius:8px;margin-top:12px;">
{{ auth.user }}
    </pre>

    <p style="opacity:.75;">
      หน้านี้ใช้ GET /api/me เพื่อยืนยัน token และแสดงข้อมูลผู้ใช้
    </p>
  </div>
</template>

```

### หน้า `SensorsPage.vue`

ไว้ดูค่าเเล้ว Real time เเละ

```javascript
<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

const sensors = ref([])
const error = ref('')
const isLoading = ref(false)
const limit = ref(10)

const loadSensors = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await api.get('/api/sensors', {
      params: { limit: Number(limit.value) || 50 }
    })
    sensors.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    error.value = e?.response?.data?.error || e.message || 'โหลดข้อมูลไม่สำเร็จ'
    sensors.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadSensors)
</script>

<template>
  <div>
    <h2>Sensors</h2>

    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0;">
      <label>
        Limit:
        <input v-model.number="limit" type="number" min="1" max="500" style="width:90px;" />
      </label>
      <button @click="loadSensors" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Reload' }}
      </button>
    </div>

    <p v-if="error" style="color:red;">{{ error }}</p>

    <table v-if="sensors.length" border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Temp</th>
          <th>Humid</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sensors" :key="row.id">
          <td>{{ row.id }}</td>
          <td>{{ row.temp }}</td>
          <td>{{ row.humid }}</td>
          <td>{{ row.created_at }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else-if="!error" style="opacity:.75;">ยังไม่มีข้อมูลเซนเซอร์</p>
  </div>
</template>

```

### หน้า Users Dashboard: `src/views/UsersPage.vue`

dev/user ดู list ได้

dev เพิ่ม/แก้ role/ลบ ได้

user เห็นแค่ตาราง

```javascript
<script setup>
import { computed, ref, onMounted } from 'vue'
import { api } from '../services/api'
import { auth } from '../services/authStore'

const users = ref([])
const error = ref('')

const isDev = computed(() => auth.user?.role === 'dev')

// ฟอร์มสร้าง user (dev)
const newUsername = ref('')
const newPassword = ref('')
const newRole = ref('user')

const loadUsers = async () => {
  error.value = ''
  try {
    const res = await api.get('/api/users')
    users.value = res.data.users
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  }
}

const createUser = async () => {
  error.value = ''
  try {
    await api.post('/api/users', {
      username: newUsername.value,
      password: newPassword.value,
      role: newRole.value
    })
    newUsername.value = ''
    newPassword.value = ''
    newRole.value = 'user'
    await loadUsers()
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  }
}

const changeRole = async (id, role) => {
  error.value = ''
  try {
    await api.put(`/api/users/${id}`, { role })
    await loadUsers()
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  }
}

const deleteUser = async (id) => {
  error.value = ''
  try {
    await api.delete(`/api/users/${id}`)
    await loadUsers()
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  }
}

onMounted(loadUsers)
</script>

<template>
  <div>
    <h2>Users</h2>
    <p v-if="error" style="color:red;">{{ error }}</p>

    <div v-if="isDev" style="border:1px solid #444;padding:12px;border-radius:8px;margin:12px 0;">
      <h3>Create User (dev only)</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <input v-model="newUsername" placeholder="new username" />
        <input v-model="newPassword" type="password" placeholder="new password" />
        <select v-model="newRole">
          <option value="user">user</option>
          <option value="dev">dev</option>
        </select>
        <button @click="createUser">Create</button>
      </div>
      <p style="opacity:.75;margin:8px 0 0;">
        POST /api/users จะ hash password ก่อนบันทึก และ role ต้องเป็น dev/user
      </p>
    </div>

    <button @click="loadUsers">Reload</button>

    <table border="1" cellpadding="8" cellspacing="0" width="100%" style="margin-top:10px;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Role</th>
          <th>Created</th>
          <th v-if="isDev">Actions (dev)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.username }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.created_at }}</td>

          <td v-if="isDev">
            <button @click="changeRole(u.id, u.role === 'dev' ? 'user' : 'dev')">
              Toggle Role
            </button>
            <button @click="deleteUser(u.id)" style="margin-left:6px;">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!isDev" style="opacity:.75;margin-top:10px;">
      role=user จะดูรายชื่อได้อย่างเดียว (GET /api/users) แต่เพิ่ม/แก้/ลบไม่ได้
    </p>
  </div>
</template>

```

### เพิ่มไฟล์ nginx.conf&#x20;

```javascript
server {
  listen 80;
  server_name _;

  # ✅ บอก nginx ว่าไฟล์เว็บอยู่ที่ไหน
  root /usr/share/nginx/html;
  index index.html;

  # ✅ เสิร์ฟ Vue SPA (refresh /dashboard ก็ไม่ 404)
  location / {
    try_files $uri $uri/ /index.html;
  }

  # ✅ ยิง /api ไป backend service
  location /api/ {
    proxy_pass http://backend:3000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

เเล้วลองทดสอบรัน Frontend ด้วยคำสั่ง

```shellscript
npm run dev 
```

เราก็จะสามารถเปิดเว็บเราได้เเล้ว

<figure><img src="../.gitbook/assets/image (3).png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/image (4).png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/image (5).png" alt=""><figcaption></figcaption></figure>

{% hint style="success" %}
เราก็จะสามารถดู Temp/Humid ได้เเล้วในเว็บ🎉
{% endhint %}

สามารถนำมาต่อยอดได้

<figure><img src="../.gitbook/assets/image (25).png" alt=""><figcaption></figcaption></figure>
