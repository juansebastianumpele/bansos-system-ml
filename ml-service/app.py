from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io
import os
import json
import numpy as np
import pymysql
from datetime import datetime
from contextlib import asynccontextmanager

from training import (
    train_from_dataframe,
    load_artifacts,
    transform_records,
    auto_label,
    THRESHOLD_MISKIN,
    FEATURES_NUM,
    FEATURES_CAT
)

# --- CONFIG / ENV ---
MODEL_DIR = os.getenv("MODEL_DIR", "model")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "bansos")
TABLE_NAME_WARGA = os.getenv("DB_TABLE_WARGA", "warga")
TABLE_NAME_MONITORING = os.getenv("DB_TABLE_MONITORING", "monitoring")

model = None
vectorizer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, vectorizer
    print("🔄 Starting up ML service...")
    try:
        model, vectorizer = load_artifacts(MODEL_DIR)
        print("✅ Model loaded successfully.")
    except Exception as e:
        model, vectorizer = None, None
        print(f"⚠️ Model failed to load: {e}")
    yield
    print("🛑 Shutting down ML service...")

app = FastAPI(title="Bansos ML Service", lifespan=lifespan)

def connect_db():
    try:
        return pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            db=DB_NAME,
            port=DB_PORT,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
        )
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@app.post("/process-csv")
async def process_csv(file: UploadFile = File(...), train_first: bool = True):
    """
    Menerima file CSV dan menjalankan seluruh alur pemrosesan data:
    1. Persiapan data.
    2. Melatih model ulang.
    3. Prediksi kelas kemiskinan.
    4. Tentukan kelayakan bansos.
    5. Simpan data warga dan monitoring ke database.
    """
    if not file:
        raise HTTPException(status_code=400, detail="File is required")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV file: {e}")

    for col in FEATURES_NUM:
        if col not in df.columns:
            df[col] = 0
    for col in FEATURES_CAT:
        if col not in df.columns:
            df[col] = "Unknown"

    train_result = None
    if train_first:
        train_result = train_from_dataframe(df.copy(), model_dir=MODEL_DIR)
        global model, vectorizer
        try:
            model, vectorizer = load_artifacts(MODEL_DIR)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load new model: {e}")

    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please train first or check model directory.")

    records = df[FEATURES_NUM + FEATURES_CAT].to_dict(orient="records")
    X = transform_records(records, vectorizer)
    preds = model.predict(X)
    probas = model.predict_proba(X)
    classes = list(model.classes_)

    df["kelas"] = preds
    df["proba"] = [json.dumps({cls: float(p) for cls, p in zip(classes, pr)}) for pr in probas]
    df["kelayakan_bansos"] = df["kelas"].apply(lambda x: "layak" if x == "miskin" else "tidak layak")

    eligible_count = int((df["kelayakan_bansos"] == "layak").sum())
    total_count = len(df)

    inserted = 0
    conn = None
    try:
        conn = connect_db()
        with conn.cursor() as cur:
            cur.execute(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s",
                (DB_NAME, TABLE_NAME_WARGA),
            )
            db_col_names = [c['COLUMN_NAME'] for c in cur.fetchall()]

            valid_cols = [c for c in df.columns if c in db_col_names and c not in ['id', 'created_at', 'updated_at']]
            if not valid_cols:
                raise RuntimeError("No matching columns between CSV and DB table.")

            df_to_save = df[valid_cols].copy()

            now = datetime.now()
            df_to_save['created_at'] = now
            df_to_save['updated_at'] = now

            rows = [tuple(x) for x in df_to_save.values]

            col_list = ",".join([f"`{c}`" for c in df_to_save.columns])
            placeholders = ",".join(["%s"] * len(df_to_save.columns))
            upds = [f"`{c}`=VALUES(`{c}`)" for c in df_to_save.columns if c.lower() not in ("nik",)]
            update_sql = ",".join(upds) if upds else ""

            if "nik" in df.columns:
                sql = f"INSERT INTO `{TABLE_NAME_WARGA}` ({col_list}) VALUES ({placeholders}) ON DUPLICATE KEY UPDATE {update_sql};"
            else:
                sql = f"INSERT INTO `{TABLE_NAME_WARGA}` ({col_list}) VALUES ({placeholders});"

            if rows:
                cur.executemany(sql, rows)
                inserted = cur.rowcount

            current_date = datetime.now().date()
            percentage_miskin = round((eligible_count / total_count * 100) if total_count > 0 else 0, 2)
            sql_monitor = f"""
                INSERT INTO `{TABLE_NAME_MONITORING}` (periode, total_warga, jumlah_miskin, persentase_miskin)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                total_warga=VALUES(total_warga),
                jumlah_miskin=VALUES(jumlah_miskin),
                persentase_miskin=VALUES(persentase_miskin)
            """
            cur.execute(sql_monitor, (current_date, total_count, eligible_count, percentage_miskin))

        conn.commit()
    except pymysql.Error as e:
        if conn:
            conn.rollback()
        print(f"⚠️ MySQL Error ({e.args[0]}): {e.args[1]}")
        raise HTTPException(status_code=500, detail=f"DB save failed: ({e.args[0]}, \"{e.args[1]}\")")
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"⚠️ General Exception: {e}")
        raise HTTPException(status_code=500, detail=f"DB save failed: {str(e)}")
    finally:
        if conn:
            conn.close()

    return {
        "status": "ok",
        "inserted_affected_rows": int(inserted),
        "train": train_result,
        "message": "Proses data selesai dan data monitoring sudah diperbarui.",
        "eligibility_summary": {
            "eligible_for_bansos": eligible_count,
            "total_records": total_count,
            "details": f"{eligible_count} dari {total_count} warga memenuhi kriteria kelayakan bansos."
        }
    }

@app.get("/monitoring")
async def get_monitoring_data():
    """
    Mengambil data tren kemiskinan dari database.
    """
    conn = None
    try:
        conn = connect_db()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    DATE_FORMAT(periode, '%%Y-%%m') AS periode,
                    total_warga,
                    jumlah_miskin,
                    persentase_miskin
                FROM `{}`
                ORDER BY periode ASC
                LIMIT 6
            """.format(TABLE_NAME_MONITORING))
            data = cur.fetchall()
            return {
                "status": "ok",
                "monitor_data": data
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve monitoring data: {str(e)}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)