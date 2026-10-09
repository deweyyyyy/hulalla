# 🌺 Hulalla Party Website — พรรคฮูลัลลา เบอร์ 3

เว็บไซต์ของพรรคฮูลัลลา (พรรคเบอร์ 3 โรงเรียนสาธิตมหาวิทยาลัยขอนแก่น ฝ่ายมัธยมศึกษา (ศึกษาศาสตร์) ปีการศึกษา 2568) ที่เคยเปิดให้ใช้งานได้อยู่ที่ [hulalla.party](https://hulalla.party)

repo นี้เปิดไว้ให้รุ่นน้องเอาไปทำเว็บของพรรคตัวเองได้เลย ข้างล่างนี้อธิบายว่าแต่ละหน้าทำอะไร ใช้ไฟล์ไหน และต้องแก้ตรงไหนบ้างถึงจะกลายเป็นเว็บของพรรคน้อง

เว็บนี้เป็น HTML / CSS / JavaScript ธรรมดา **ไม่มี build step** (ไม่มี npm, React ฯลฯ) ใช้ Firebase เป็นฐานข้อมูลและโฮสติ้ง

---

## สารบัญ

1. [เริ่มต้นใช้งาน](#-เริ่มต้นใช้งาน)
2. [โครงสร้างโฟลเดอร์](#-โครงสร้างโฟลเดอร์)
3. [หน้าเว็บทั้งหมด](#-หน้าเว็บทั้งหมด)
4. [เปลี่ยนให้เป็นพรรคของน้อง (checklist)](#-เปลี่ยนให้เป็นพรรคของน้อง-checklist)
5. [ข้อมูลใน Firebase Realtime Database](#-ข้อมูลใน-firebase-realtime-database)
6. [ไฟล์ที่ไม่ได้อยู่ใน repo](#-ไฟล์ที่ไม่ได้อยู่ใน-repo)
7. [⚠️ เรื่องความปลอดภัย (อ่านก่อนเปิดเว็บจริง)](#️-เรื่องความปลอดภัย-อ่านก่อนเปิดเว็บจริง)
8. [ไฟล์เก่า / ไฟล์ทดลอง](#-ไฟล์เก่า--ไฟล์ทดลอง)

---

## 🚀 เริ่มต้นใช้งาน

### 1. สร้างโปรเจกต์ Firebase

1. เข้า [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. เปิดใช้:
   - **Realtime Database** (ใช้เกือบทุกหน้า)
   - **Hosting** (ใช้เปิดเว็บ)
   - **Authentication** → เปิด *Anonymous* (หน้า POS) และ *Google* + *Email/Password* (หน้า Satit X) ถ้าจะใช้หน้าพวกนั้น
3. ไปที่ Project settings → **Your apps** → เพิ่ม Web app → จะได้ `firebaseConfig` มา

### 2. ใส่ API key

key ทั้งหมดของเว็บอยู่ในไฟล์เดียว คือ `--NEW--/keys.js` (ไฟล์นี้ **ไม่ได้อยู่ใน repo** เพื่อไม่ให้ key หลุด)

```bash
cp --NEW--/keys.example.js --NEW--/keys.js
```

แล้วเปิด `keys.js` ใส่ค่าจริง:

| key | เอามาจากไหน | ใช้ที่หน้า |
|---|---|---|
| `firebase` | Firebase console → Web app config | เกือบทุกหน้า |
| `firebaseHorror` | ใส่ค่าเดียวกับ `firebase` ได้เลย | `play/horror/script.js` (ไฟล์เก่า) |
| `firebaseDeweysworld` | ไม่ต้องใส่ก็ได้ | `indexxx.html` (หน้า coming soon เก่า) |
| `groq` | สมัครฟรีที่ [console.groq.com](https://console.groq.com) | AI chat (`/chat`) |
| `deesmsx` | [deesmsx.com](https://www.deesmsx.com) (บริการส่ง SMS) | OTP ของร้านค้า (`/store`, `/store/pos`) |

ทุกหน้าที่ใช้ key จะโหลด `<script src="/keys.js"></script>` ก่อนสคริปต์ของหน้านั้น แล้วอ่านค่าผ่าน `window.HLL_KEYS`

### 3. ใส่รายชื่อสมาชิกพรรค

รายชื่อจริงไม่อยู่ใน repo (เป็นข้อมูลส่วนตัวของนักเรียน) ให้ copy ไฟล์ตัวอย่างแล้วแก้เป็นสมาชิกของน้อง:

```bash
cp --NEW--/team/roster.example.js    --NEW--/team/roster.js
cp --NEW--/members/roster.example.js --NEW--/members/roster.js
cp --NEW--/chat/members.example.json --NEW--/chat/members.json
```

รูปสมาชิกแต่ละคนใส่ที่ `team/assets/indi/<รหัสนักเรียน>.png` และ `members/images/<รหัสนักเรียน>.png` (ถ้าไม่มีรูปจะขึ้นไอคอนแทน)

### 4. รันในเครื่อง และ deploy

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # เลือกโปรเจกต์ Firebase ของน้อง (หรือแก้ .firebaserc)
firebase serve                # เปิด http://localhost:5000 ดูในเครื่อง
firebase deploy --only hosting
```

> ⚠️ ต้องเปิดผ่าน `firebase serve` ไม่ใช่ดับเบิลคลิกไฟล์ HTML เพราะหลายหน้าโหลดไฟล์แบบ `/keys.js` (path จาก root ของเว็บ)

`firebase.json` ตั้งให้โฟลเดอร์ `--NEW--` เป็น root ของเว็บ

---

## 📁 โครงสร้างโฟลเดอร์

```
.
├── firebase.json          # ตั้งค่า Hosting (public = --NEW--)
├── .firebaserc            # ชื่อโปรเจกต์ Firebase
└── --NEW--/               # ⭐ ตัวเว็บทั้งหมดอยู่ในนี้
    ├── index.html         # หน้าแรก
    ├── 404.html           # หน้าขอบคุณหลังเลือกตั้ง (ใช้เป็น 404 ด้วย)
    ├── keys.example.js    # template ของ keys.js
    ├── chat/              # AI chat "ลูลู่"
    ├── clip/              # รวมคลิป Hulalla Games
    ├── members/           # รายชื่อสมาชิก (แบบการ์ด)
    ├── team/              # ทีมงานแยกตามฝ่าย (แบบเต็มจอ)
    ├── policies/          # นโยบายพรรค + ระบบให้อาจารย์ตรวจ
    ├── play/              # เกม / แบบทดสอบ
    ├── store/             # ร้านค้า Night Market + POS
    ├── satitx/            # Satit X (marketplace ของนักเรียน)
    ├── report/            # แจ้งปัญหา / ข้อเสนอแนะ
    ├── privacy/, terms/   # นโยบายความเป็นส่วนตัว / ข้อกำหนดการใช้งาน
    ├── img/, src/         # รูปภาพ
    └── *icon*.png, favicon*, manifest.json, browserconfig.xml   # ไอคอนเว็บ
```

---

## 🗺️ หน้าเว็บทั้งหมด

### หน้าหลัก และข้อมูลพรรค

| URL | ไฟล์ | ทำอะไร |
|---|---|---|
| `/` | `index.html` | หน้าแรก: แนะนำพรรค, ลิงก์ไปทุกหน้า, คลิป Hulalla Games, ปุ่มโหวต, ลิงก์ IG / TikTok / YouTube (`@hulalla.hawaii`) |
| `/policies` | `policies/index.html`, `policies_new.js`, `policies.json` | แสดงนโยบายทั้งหมด (25 ข้อ) โหลดจาก `policies.json` แต่ละข้อมี `id, title, description, objectives, actions` |
| `/team` | `team/index.html`, `script.js`, `roster.js` | ทีมงานแยกตามฝ่าย แบบเลื่อนเต็มจอ + ดูรายบุคคล ข้อมูลฝ่าย (สี ไอคอน รูปกลุ่ม) และสมาชิกอยู่ใน `roster.js` |
| `/members` | `members/index.html`, `script.js`, `roster.js` | รายชื่อสมาชิกแบบการ์ด ค้นหา/กรองตามฝ่ายได้ (ลองโหลดจาก API ก่อน ถ้าไม่ได้ใช้ `fallbackMembers` ใน `roster.js`) |
| `/clip` | `clip/index.html`, `data.json` | รวมคลิปวิดีโอ แก้รายการคลิปที่ `data.json` |
| (ทุก URL ที่ไม่มีอยู่) | `404.html` | หน้า "ขอบคุณทุกคะแนนเสียง" หลังเลือกตั้ง รูปอยู่ใน `src/` |
| `/privacy`, `/terms` | `privacy/index.html`, `terms/index.html` | ⚠️ ตอนนี้อ้างอิงถึง Dewey's World (deweysworld.app) ที่ดูแลโดยพี่เอง **ต้องเขียนใหม่เป็นของพรรคน้องเอง** |

### AI Chat

| URL | ไฟล์ | ทำอะไร |
|---|---|---|
| `/chat` | `chat/index.html` + `chat308.js` | แชตบอท "ลูลู่ (LuLu)" ตอบคำถามเรื่องนโยบายและสมาชิก ใช้ Groq API (โมเดล `openai/gpt-oss-*`) อ่านข้อมูลจาก `../policies/policies.json` และ `./members.json` บันทึกบทสนทนาลง Firebase `chat_sessions/` |
| `/chat/a_db` | `chat/a_db/index.html` | 🔒 หน้า admin ดูบทสนทนาทั้งหมดใน `chat_sessions` |

**แก้บุคลิกของบอท:** ไปที่ `chat/chat308.js` หาตัวแปร `systemPrompt` (ประมาณบรรทัด 814) แล้วเปลี่ยนชื่อบอท ชื่อพรรค และข้อมูลต่าง ๆ

### เกม / แบบทดสอบ (`/play`)

หน้า `/play` (`play/index.html`) เป็นเมนูรวมเกมทั้งหมด

| URL | ทำอะไร | ใช้ Firebase |
|---|---|---|
| `/play/mbti` | แบบทดสอบ MBTI ภาษาไทย 16 บุคลิก | Analytics |
| `/play/bfftest` | ทดสอบความเข้ากันได้ของเพื่อนซี้ | Analytics |
| `/play/haleana` | "Who are you in Haleana City?" 10 คำถาม | Analytics |
| `/play/horror` | เรื่องผีในโรงเรียนแบบเลือกทางเดินเอง (ใช้ `script33.js`) มีเสียงใน `sounds/` | Analytics |
| `/play/satit-run` | เกมวิ่งหนีครูเวร เก็บหนังสือ หลบสิ่งกีดขวาง มีเสียงใน `sounds/` | Analytics |
| `/play/christmas` | ตกแต่งต้นคริสต์มาสแล้วแชร์ให้เพื่อนมาแต่งต่อ | `trees/`, `decorations/` |
| `/play/kids` | "เด็กคนนั้นโตมากลายเป็นเธอ" | Analytics |

### Satit X (`/satitx`)

| URL | ไฟล์ | ทำอะไร |
|---|---|---|
| `/satitx` | `satitx/index.html`, `satitx.js` | แอป marketplace ของนักเรียน: สมัคร/ล็อกอิน (Google หรือ Email), ลงขายของ, สั่งซื้อ, แจ้งเตือน ใช้ `marketplace/items`, `orders/`, `notifications/{uid}` |
| `/satitx/store` | `satitx/store/index.html` | 🔒 หน้าจัดการร้าน: สินค้า (`products/`), ออเดอร์, ส่งแจ้งเตือนให้ลูกค้า |

### นโยบาย: ระบบให้อาจารย์ตรวจ (`/policies/check`)

ใช้ตอนส่งนโยบายให้อาจารย์ที่ปรึกษาตรวจก่อนประกาศ

| URL | ไฟล์ | ทำอะไร |
|---|---|---|
| `/policies/check` | `policies/check/index.html`, `policies.js` | อาจารย์เลือกชื่อตัวเอง แล้วคอมเมนต์ทีละนโยบาย บันทึกที่ `policies/{id}/comments/{อาจารย์}` และเสนอนโยบายใหม่ที่ `proposed_policies` |
| `/policies/check/last` | `policies/check/last/index.html`, `policiesne.js` | ตรวจรอบสุดท้าย: เทียบนโยบายเดิม (`policies copy.json`) กับฉบับแก้ (`plcnewww.json`) บันทึกที่ `policy-changes/{อาจารย์}` |
| `/policies/check/dashboard` | `policies/check/dashboard/index.html`, `dashboard.js` | 🔒 สรุปคอมเมนต์ของอาจารย์ทุกคน |

### แจ้งปัญหา

| URL | ไฟล์ | ทำอะไร |
|---|---|---|
| `/report` | `report/index.html` | ฟอร์มแจ้งปัญหา/ข้อเสนอแนะ เลือกสมาชิกที่เกี่ยวข้องได้ บันทึกลง `reports/` |

🔒 = หน้าสำหรับทีมงาน ดูหัวข้อ [ความปลอดภัย](#️-เรื่องความปลอดภัย-อ่านก่อนเปิดเว็บจริง)

---

## ✅ เปลี่ยนให้เป็นพรรคของน้อง (checklist)

- [ ] **Firebase:** สร้างโปรเจกต์ของตัวเอง แก้ `.firebaserc` และใส่ค่าใน `keys.js`
- [ ] **โลโก้ / ไอคอน:** `logo.jpg`, `nav_black.png`, `nav_white.png`, `src/logo_*.png`, ไฟล์ `*icon*.png` + `favicon*` (สร้างชุดใหม่ได้ที่เว็บ favicon generator), `manifest.json`
- [ ] **หน้าแรก:** `index.html` แก้ชื่อพรรค หมายเลข สโลแกน ลิงก์โซเชียล `<title>` และ `<meta>` ต่าง ๆ
- [ ] **นโยบาย:** `policies/policies.json`
- [ ] **สมาชิก:** `team/roster.js`, `members/roster.js`, `chat/members.json` + รูปสมาชิก + รูปกลุ่มใน `team/assets/group/`
- [ ] **AI chat:** แก้ `systemPrompt` ใน `chat/chat308.js`
- [ ] **คลิป:** `clip/data.json`
- [ ] **privacy / terms:** เขียนใหม่ทั้งหมด (ตอนนี้อ้างอิงบริการอื่นอยู่)
- [ ] **หน้าขอบคุณ:** `404.html` + รูปใน `src/`
- [ ] **ค้นคำว่า `hulalla` / `ฮูลัลลา`** ทั้งโปรเจกต์ แล้วเปลี่ยนเป็นชื่อพรรคน้อง
- [ ] **ลบหน้าที่ไม่ใช้** (เช่น ร้านค้า, Satit X) ออกจากเมนูใน `index.html`

---

## 🗄️ ข้อมูลใน Firebase Realtime Database

| path | ใช้โดย | เก็บอะไร |
|---|---|---|
| `chat_sessions/` | `/chat`, `/chat/a_db` | บทสนทนากับ AI |
| `orders/` | `/store`, `/store/order`, `/store/pos`, `/satitx` | ออเดอร์ |
| `menus/{storeId}/{itemId}` | `/store/order`, `/store/pos` | เมนูอาหารของแต่ละร้าน |
| `marketplace/items` | `/satitx` | สินค้าที่นักเรียนลงขาย |
| `products/` | `/satitx/store` | สินค้าของร้าน Satit X |
| `notifications/{uid}` | `/satitx`, `/satitx/store` | แจ้งเตือนผู้ใช้ |
| `trees/`, `decorations/` | `/play/christmas` | ต้นคริสต์มาสและของตกแต่ง |
| `policies/{id}/comments/` | `/policies/check`, dashboard | คอมเมนต์ของอาจารย์ |
| `proposed_policies/` | `/policies/check` | นโยบายที่อาจารย์เสนอเพิ่ม |
| `policy-changes/` | `/policies/check/last` | ผลตรวจรอบสุดท้าย |
| `reports/` | `/report` | เรื่องที่แจ้งเข้ามา |

---

## 🙈 ไฟล์ที่ไม่ได้อยู่ใน repo

ไฟล์เหล่านี้อยู่ใน `.gitignore` น้องต้องสร้างเอง (มีไฟล์ตัวอย่างให้):

| ไฟล์ | สร้างจาก | ทำไมไม่อยู่ใน repo |
|---|---|---|
| `--NEW--/keys.js` | `keys.example.js` | มี API key |
| `team/roster.js`, `members/roster.js` | `roster.example.js` | ชื่อ-นามสกุล รหัสนักเรียน IG ของสมาชิก |
| `chat/members.json` | `members.example.json` | ข้อมูลส่วนตัวของสมาชิก |
| `members/images/`, `team/assets/indi/` | (ใส่รูปเอง) | รูปสมาชิกรายคน |

---

## ⚠️ เรื่องความปลอดภัย (อ่านก่อนเปิดเว็บจริง)

**จุดที่น้องควรแก้ก่อนเอาไปใช้** :

1. **key ทุกตัวใน `keys.js` คนอื่นเห็นได้** เพราะเบราว์เซอร์ต้องโหลดไฟล์นี้ (ใครก็เปิด `/keys.js` ดูได้)
   - Firebase key: เห็นได้ไม่เป็นไร **ถ้าตั้ง Database Rules ดี ๆ** (อย่าปล่อย `".read": true, ".write": true`)
   - **Groq key และ deeSMSX key: ห้ามอยู่ฝั่งเบราว์เซอร์** คนอื่นเอาไปใช้ฟรีได้ ควรย้ายไปเรียกผ่าน **Firebase Cloud Functions** หรือตัวอื่นๆแทน
2. **หน้า 🔒 ไม่มีระบบล็อกอินจริง** (`/chat/a_db`, `/satitx/store`, `/policies/check/dashboard`) ใครรู้ URL ก็เข้าได้ ควรใช้ Firebase Authentication + Database Rules จำกัดสิทธิ์
3. **อย่า commit ข้อมูลส่วนตัว** (ชื่อจริง รหัสนักเรียน รูป IG เบอร์โทร) ขึ้น GitHub สาธารณะ

---

Made with love for Hulalla
Dewey's World 2025-2026