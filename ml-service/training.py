import os
import pandas as pd
import joblib
import numpy as np
import json
from sklearn.feature_extraction import DictVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

FEATURES_NUM = ["usia", "penghasilan", "jumlah_tanggungan"]
FEATURES_CAT = ["pendidikan", "status_rumah", "kendaraan", "status_pernikahan", "pekerjaan", "jenis_kelamin"]
FEATURES = FEATURES_NUM + FEATURES_CAT
TARGET = "kelas"

THRESHOLD_MISKIN = float(os.getenv("TH_MISKIN", 1500000))
THRESHOLD_MENENGAH = float(os.getenv("TH_MENENGAH", 4000000))

def auto_label(df: pd.DataFrame) -> pd.DataFrame:
    """
    Menambahkan kolom 'kelas' (miskin/menengah/atas) berdasarkan aturan penghasilan per kapita.
    Juga menambahkan kolom 'kelayakan_bansos' yang ditentukan dari kelas.
    """
    df = df.copy()

    tanggungan = (df["jumlah_tanggungan"].fillna(0)).clip(lower=0)
    perkapita = df["penghasilan"].fillna(0) / (1 + tanggungan)
    def label_kelas(pk):
        if pk < THRESHOLD_MISKIN:
            return "miskin"
        elif pk < THRESHOLD_MENENGAH:
            return "menengah"
        else:
            return "atas"
    df[TARGET] = perkapita.apply(label_kelas)

    df["kelayakan_bansos"] = df[TARGET].apply(lambda x: "layak" if x == "miskin" else "tidak_layak")
    
    return df

def build_xy(df: pd.DataFrame):
    """
    Mempersiapkan fitur (X) dan target (y) untuk training. Mengubah data kategorikal
    menjadi format numerik menggunakan DictVectorizer.
    """
    df = df.copy()
    for col in FEATURES_NUM:
        if col not in df.columns:
            df[col] = 0
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    for col in FEATURES_CAT:
        if col not in df.columns:
            df[col] = "Unknown"
        df[col] = df[col].fillna("Unknown").astype(str)
    y = df[TARGET].astype(str)
    records = df[FEATURES].to_dict(orient="records")
    dv = DictVectorizer(sparse=False)
    X = dv.fit_transform(records)
    return X, y, dv

def train_from_dataframe(df: pd.DataFrame, model_dir="model"):
    """
    Melatih model RandomForestClassifier dari DataFrame yang diberikan.
    Menyimpan model dan vectorizer, serta mengembalikan metrik evaluasi.
    """
    df = auto_label(df)
    X, y, dv = build_xy(df)
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    clf = RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced")
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_val)
    report = classification_report(y_val, y_pred, output_dict=True)
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(clf, os.path.join(model_dir, "model.pkl"))
    joblib.dump(dv, os.path.join(model_dir, "dv.pkl"))
    return {
        "status": "ok",
        "metrics": {
            "precision_macro": report["macro avg"]["precision"],
            "recall_macro": report["macro avg"]["recall"],
            "f1_macro": report["macro avg"]["f1-score"],
        },
        "classes": list(sorted(set(y)))
    }

def load_artifacts(model_dir="model"):
    """
    Memuat model dan vectorizer yang telah disimpan.
    """
    clf = joblib.load(os.path.join(model_dir, "model.pkl"))
    dv = joblib.load(os.path.join(model_dir, "dv.pkl"))
    return clf, dv

def transform_records(records, dv):
    """
    Mempersiapkan data baru untuk prediksi menggunakan vectorizer yang sudah ada.
    """
    def normalize(d):
        out = {}
        for k in FEATURES_NUM:
            val = d.get(k, 0)
            out[k] = float(val) if val not in ('', None) else 0.0
        for k in FEATURES_CAT:
            v = d.get(k, "Unknown")
            out[k] = str(v) if v is not None else "Unknown"
        return out
    norm = [normalize(r) for r in records]
    X = dv.transform(norm)
    return X