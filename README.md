# Backend API Documentation

Dokumentasi ini mencakup dua bagian backend:  
1. **Backend API Express.js** (Node.js + Sequelize + MySQL)  
2. **Backend API Python FastAPI** (dengan Machine Learning)  
    
    Menerima file CSV dan menjalankan seluruh alur pemrosesan data:
    - Persiapan data.
    - Melatih model ulang (opsional).
    - Prediksi kelas kemiskinan.
    - Tentukan kelayakan bansos.
    - Simpan data warga dan monitoring ke database.
  

---
# 1. Backend API ExpressJs

Proyek ini dibangun menggunakan **Node.js**, **Express.js**, **Sequelize**, dan **MySQL** sebagai database.  
Panduan ini ditujukan untuk mempermudah proses instalasi dan menjalankan proyek di environment development.

---

## 🚀 Tech Stack
- [Node.js](https://nodejs.org/) - Runtime JavaScript
- [Express.js](https://expressjs.com/) - Framework Web
- [Sequelize](https://sequelize.org/) - ORM untuk Node.js
- [MySQL](https://www.mysql.com/) - Database Relasional

---

## 📂 Struktur Folder
Struktur dasar proyek ini adalah sebagai berikut:
```
be-neurovolt/
├─ bin/              # Script untuk menjalankan server
├─ config/           # Konfigurasi database & environment
├─ controllers/      # Logic untuk menangani request
├─ middleware/       # Middleware (auth)
├─ migrations/       # File migrasi Sequelize
├─ models/           # Definisi model Sequelize
├─ routes/           # Routing aplikasi
├─ services/         # Business logic / helper
├─ uploads/          # Penyimpanan file upload
├─ app.js            # Entry utama Express
├─ package.json
├─ .env              # Konfigurasi environment
└─ README.md
```

---

## 📦 Instalasi

1. **Masuk Direktori be-neurovolt**
   ```bash
   cd be-neurovolt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi database**
   - Jalankan **MySQL** menggunakan XAMPP / Laragon.
   - Buat file `.env` di root project, lalu isi sesuai konfigurasi lokal:
     ```env
     DB_USERNAME=root
     DB_PASSWORD=
     DB_HOSTNAME=127.0.0.1
     DB_NAME=bansos
     DB_DIALECT=mysql
     PORT=3000
   
     ACCESS_TOKEN_SECRET= TOKEN_ACCESS
     REFRESH_TOKEN_SECRET=  REFRESH_TOKEN
     JWT_SECRET= SECRET_JWT

     CLIENT_URL=http://localhost:5173
     ML_BASE_URL=http://127.0.0.1:5000
     ```

4. **Buat database**
   ```bash
   npx sequelize db:create
   ```

5. **Jalankan migrasi tabel**
   ```bash
   npx sequelize db:migrate
   ```

---

## ▶️ Menjalankan Project

Jalankan backend server:
```bash
npm run start
```

Secara default server berjalan di:
```
http://localhost:3000
```

---

## 🛠️ Scripts yang Tersedia

- `npm install` → Install semua package
- `npx sequelize db:create` → Membuat database
- `npx sequelize db:migrate` → Menjalankan migrasi tabel
- `npm run start` → Menjalankan server backend

---

## 📌 Catatan
- Pastikan **MySQL** sudah berjalan sebelum menjalankan perintah `sequelize`.
- Untuk development lebih nyaman, gunakan **XAMPP** atau **Laragon** untuk menjalankan MySQL.
- Simpan konfigurasi sensitif seperti kredensial database di file `.env`.

---

---

---


---

---


# 2. Backend API (Python - FastAPI)

Proyek ini menggunakan **Python FastAPI** untuk API backend, dengan dukungan **Machine Learning** menggunakan **scikit-learn** dan library data seperti **pandas** serta **numpy**.  

---

## 🚀 Tech Stack
- [Python](https://www.python.org/) - Bahasa pemrograman
- [FastAPI](https://fastapi.tiangolo.com/) - Framework Web Python
- [Uvicorn](https://www.uvicorn.org/) - ASGI server untuk FastAPI
- [Pandas](https://pandas.pydata.org/) - Analisis data
- [NumPy](https://numpy.org/) - Komputasi numerik
- [Scikit-learn](https://scikit-learn.org/stable/) - Machine Learning
- [Joblib](https://joblib.readthedocs.io/) - Model serialization

---


## 📂 Struktur Folder
Struktur dasar proyek ini adalah sebagai berikut:
```
ml-service/
├─ model             # Model ML tersimpan
├─ venv/             # Virtual environment
├─ app.py            # File utama FastAPI
├─ requirements.txt/ # Daftar dependencies
├─ training.py/      # Script training model
```



## 📦 Instalasi

1. **Masuk Direktori**
   ```bash
   cd ml-service
   ```

2. **Buat virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Aktifkan virtual environment**
   - **Windows**
     ```bash
     venv\Scripts\activate
     ```
   - **Mac/Linux**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   Jika bermasalah not found module 'pymysql'
   jalankan perintah:
    ```bash
   pip install pymysql
   ```

---

## ▶️ Menjalankan Project

Jalankan aplikasi:
```bash
python app.py
```

Atau menggunakan Uvicorn (lebih direkomendasikan untuk FastAPI):
```bash
uvicorn app:app --reload
```

Secara default server berjalan di:
```
http://127.0.0.1:8000
```

---

## 📂 Requirements

Berikut daftar package utama yang digunakan:
```
fastapi==0.110.0
uvicorn==0.29.0
pydantic==2.6.4
pandas==2.2.2
numpy==1.26.4
scikit-learn==1.4.2
joblib==1.4.2
python-multipart==0.0.7
```

---

## 📌 Catatan
- Gunakan `venv` agar dependencies tetap terisolasi.
- Jalankan `pip freeze > requirements.txt` jika ada package baru yang ditambahkan.
- Untuk pengembangan, gunakan `uvicorn app:app --reload` agar auto-reload saat ada perubahan kode.
