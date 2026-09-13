# 3D Interactive Portfolio & Avatar System

Interactive 3D portfolio dan avatar system berbasis web menggunakan **Three.js** dan **Vanilla JavaScript (ES Modules)**.

Project ini menggabungkan visualisasi 3D real-time dengan UI interaktif untuk menampilkan informasi portfolio, topic, dan dialog melalui avatar 3D yang dapat dikustomisasi.

---

## Overview

Avatar ditampilkan sebagai entitas 3D central yang disebut **"Si Bola"**.

Avatar dapat:

* Merespons pergerakan cursor.
* Mengubah bentuk atau ekspresi.
* Menggunakan pakaian dan aksesoris 3D.
* Menggunakan model `.glb` / `.gltf`.
* Menampilkan dialog berdasarkan persona dan topic yang dipilih.

Data portfolio, persona, dialog, dan skin dipisahkan dari logic utama melalui file JSON.

Struktur ini membuat perubahan data dapat dilakukan tanpa harus mengubah logic utama Three.js.

---

## Documentation

README ini membahas:

1. Struktur dan fungsi data JSON.
2. Cara menambah dan mengubah topic.
3. Cara membuat dan mengatur persona.
4. Cara mengatur dialog berdasarkan persona dan topic.
5. Cara menambahkan dan mengatur skin atau aksesoris 3D.
6. Cara mengganti skin secara programmatic.

---

# 1. Topics

File:

```text
data/topics.json
```

`topics.json` berfungsi sebagai registry untuk seluruh topic atau menu interaktif yang ditampilkan di sekitar avatar.

## Struktur Data

```json
{
  "web_dev": {
    "label": "Web Development",
    "icon": "💻",
    "title": "Full-Stack Development",
    "details": "<p>Pengalaman dalam membangun aplikasi web modern menggunakan React, Node.js, dan Three.js.</p>",
    "pos": {
      "left": "20%",
      "top": "30%"
    }
  }
}
```

### Properti

| Property  | Fungsi                        |
| --------- | ----------------------------- |
| `label`   | Nama yang ditampilkan pada UI |
| `icon`    | Icon topic                    |
| `title`   | Judul informasi topic         |
| `details` | Detail atau konten topic      |
| `pos`     | Posisi topic pada layar       |

## Menambahkan Topic

Tambahkan key baru dengan ID yang unik.

```json
"cyber_security": {
  "label": "Cyber Security",
  "icon": "🛡️",
  "title": "Penetration Testing & Security Research",
  "details": "<p>Fokus pada identifikasi kerentanan web dan analisis protokol jaringan.</p>"
}
```

## Menghapus Topic

Hapus object topic dari `topics.json`.

UI akan menyesuaikan berdasarkan topic yang tersedia.

> JSON standar tidak mendukung komentar. Jika parser yang digunakan tidak mendukung komentar, jangan menggunakan komentar di dalam file JSON.

## Mengatur Posisi

Property `pos` bersifat opsional.

Jika digunakan:

```json
"pos": {
  "left": "20%",
  "top": "30%"
}
```

topic akan menggunakan posisi tersebut.

Jika `pos` tidak digunakan, sistem akan menghitung posisi secara otomatis menggunakan layout melingkar berbasis perhitungan trigonometri.

---

# 2. Persona

File:

```text
data/persona.json
```

`persona.json` menyimpan konfigurasi identitas dan tampilan avatar.

Persona mengatur:

* Warna body.
* Warna fog.
* Tipe material.
* Skin yang digunakan.

## Struktur Data

```json
[
  {
    "id": "persona_default",
    "name": "Original Ball",
    "description": "Bentuk bola bawaan dengan warna hangat.",
    "config": {
      "id": "persona_default",
      "color": "#FF8E8E",
      "fogColor": "#FFF9F0",
      "materialType": "standard",
      "skinId": "skin_default"
    }
  },
  {
    "id": "persona_cyber",
    "name": "Cyber Sentinel",
    "description": "Mode taktis berpenampilan pixel.",
    "config": {
      "id": "persona_cyber",
      "color": "#111827",
      "fogColor": "#0A0E17",
      "materialType": "wireframe_glow",
      "skinId": "skin_cool_pixel"
    }
  }
]
```

## Menambahkan Persona

Tambahkan object baru ke dalam array `persona.json`.

Pastikan `id` persona berbeda dari persona lainnya.

Contoh:

```json
{
  "id": "persona_bare",
  "name": "Bare",
  "description": "Avatar tanpa aksesoris.",
  "config": {
    "id": "persona_bare",
    "color": "#CCCCCC",
    "fogColor": "#FFFFFF",
    "materialType": "standard",
    "skinId": null
  }
}
```

## Menghubungkan Persona dengan Skin

Property:

```json
"skinId": "skin_cool_pixel"
```

digunakan untuk menentukan skin yang dipakai persona.

Nilainya harus mengarah ke `id` yang terdaftar di:

```text
data/skin.json
```

## Persona Tanpa Skin

Jika persona tidak menggunakan aksesoris, `skinId` dapat menggunakan:

```json
"skinId": null
```

atau:

```json
"skinId": "skin_none"
```

---

# 3. Intro

File:

```text
data/intro.json
```

`intro.json` mengatur dialog avatar berdasarkan kombinasi:

```text
Persona + Topic
```

Artinya dialog dapat berbeda tergantung persona yang sedang aktif dan topic yang dipilih.

## Struktur Data

```json
{
  "persona_default": {
    "web_dev": "Halo! Mari lihat beberapa project web yang telah saya buat.",
    "cyber_security": "Ini adalah beberapa riset keamanan yang pernah saya lakukan."
  },
  "persona_cyber": {
    "web_dev": "SYSTEM LOG: Mengakses direktori pengembangan perangkat lunak...",
    "cyber_security": "SYSTEM LOG: Memindai vektor kerentanan sistem..."
  }
}
```

Strukturnya:

```text
persona_id
└── topic_id
    └── dialog
```

## Menambahkan Dialog

Key persona harus sesuai dengan `id` pada:

```text
data/persona.json
```

Sedangkan key topic harus sesuai dengan key pada:

```text
data/topics.json
```

Contoh:

```json
{
  "persona_default": {
    "web_dev": "Halo! Mari lihat beberapa project web yang telah saya buat."
  }
}
```

## Fallback

Jika dialog untuk kombinasi persona dan topic tidak tersedia, sistem menggunakan pesan fallback:

```text
Silakan klik tombol di bawah untuk informasi lebih lanjut.
```

---

# 4. Skin

File:

```text
data/skin.json
```

`skin.json` menyimpan deklarasi kosmetik dan aksesoris 3D yang digunakan avatar.

Skin dapat menggunakan model:

```text
.glb
.gltf
```

Setiap attachment dapat menentukan:

* Path model.
* Position.
* Rotation.
* Scale.

## Struktur Data

```json
[
  {
    "id": "skin_none",
    "name": "No Accessories",
    "description": "Tanpa aksesoris.",
    "attachments": []
  },
  {
    "id": "skin_cool_pixel",
    "name": "Pixel Cap & Glasses",
    "description": "Topi baseball dan kacamata retro.",
    "attachments": [
      {
        "name": "cap",
        "modelPath": "assets/skins/Accessories/Baseball cap by Poly by Google - aaC5GgcWEhM.glb",
        "position": [0, 2.2, 0],
        "rotation": [0, 0, 0],
        "scale": [1.5, 1.5, 1.5]
      },
      {
        "name": "glasses",
        "modelPath": "assets/skins/Accessories/Pixel Glasses by iPoly3D - VQuqLwtyTa.glb",
        "position": [0, 0.4, 2.2],
        "rotation": [0, 0, 0],
        "scale": [1.2, 1.2, 1.2]
      }
    ]
  }
]
```

---

## Menambahkan Skin

### 1. Tambahkan Model

Letakkan file `.glb` atau `.gltf` di dalam folder:

```text
assets/skins/
```

atau subfolder di dalamnya.

Contoh:

```text
assets/
└── skins/
    └── Accessories/
        ├── cap.glb
        └── glasses.glb
```

### 2. Daftarkan Skin

Tambahkan skin baru ke `skin.json`.

```json
{
  "id": "skin_example",
  "name": "Example Skin",
  "description": "Contoh skin.",
  "attachments": [
    {
      "name": "cap",
      "modelPath": "assets/skins/Accessories/cap.glb",
      "position": [0, 2.2, 0],
      "rotation": [0, 0, 0],
      "scale": [1.5, 1.5, 1.5]
    }
  ]
}
```

### Transformasi Attachment

Property transform digunakan untuk menentukan posisi model relatif terhadap avatar.

```json
"position": [x, y, z],
"rotation": [x, y, z],
"scale": [x, y, z]
```

Jika posisi model belum sesuai dengan avatar, nilai tersebut dapat disesuaikan di `skin.json`.

---

# 5. Mengganti Skin Secara Dinamis

Skin dapat diganti secara programmatic melalui:

```javascript
app.changeSkin(skinId);
```

Contoh menggunakan skin:

```javascript
window.app.changeSkin('skin_cool_pixel');
```

Untuk melepas seluruh aksesoris:

```javascript
window.app.changeSkin(null);
```

atau menggunakan skin kosong:

```javascript
window.app.changeSkin('skin_none');
```

---

# 6. Arsitektur

Project memisahkan tiga bagian utama:

```text
Visual Rendering Engine
        │
        ▼
    scene.js
        │
        ▼
Application Control Flow
        │
        ▼
    main.js
        │
        ▼
     Data Layer
        │
        ├── topics.json
        ├── persona.json
        ├── intro.json
        └── skin.json
```

### `scene.js`

Menangani bagian visual dan rendering Three.js.

### `main.js`

Menangani application control flow dan interaksi sistem.

### Data JSON

Menyimpan konfigurasi dan data yang digunakan oleh aplikasi.

---

# 7. Data Relationship

Keempat file JSON saling terhubung melalui ID.

```text
topics.json
     │
     │ topic_id
     ▼
intro.json
     ▲
     │ persona_id
     │
persona.json
     │
     │ skinId
     ▼
skin.json
```

Contoh hubungan:

```text
persona_cyber
      │
      └── skinId
             │
             ▼
      skin_cool_pixel

persona_cyber
      │
      └── topic
             │
             ▼
      cyber_security
             │
             ▼
       intro message
```

Dengan struktur ini, persona dapat menentukan skin yang digunakan, sedangkan intro menentukan dialog berdasarkan persona dan topic.

---

# Conclusion

Project ini menggunakan pemisahan antara **rendering**, **application control flow**, dan **data configuration**.

Struktur tersebut memungkinkan:

* Data portfolio dan dialog diubah melalui JSON.
* Topic ditambahkan atau dihapus tanpa mengubah logic utama.
* Persona dapat memiliki konfigurasi visual yang berbeda.
* Skin dan aksesoris 3D dapat didaftarkan melalui `skin.json`.
* Posisi, rotasi, dan skala model dapat dikonfigurasi tanpa mengubah kode utama.
* Skin dapat diganti secara dinamis melalui `app.changeSkin()`.

Struktur utama:

```text
scene.js
   │
   ├── Visual Rendering
   │
   ▼
main.js
   │
   ├── Application Control
   │
   ▼
JSON Data
   ├── topics.json
   ├── persona.json
   ├── intro.json
   └── skin.json
```
