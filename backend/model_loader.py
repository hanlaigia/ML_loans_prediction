import joblib
import pandas as pd
import numpy as np
import os

MODEL_PATH = r"D:\HK1\ML\DoAn\ml-prediction\backend\models\xgboost_model.pkl"

print("Model loading from:", MODEL_PATH)
model = joblib.load(MODEL_PATH)
print("Model loaded successfully")
print(">>> Model type:", type(model))
if hasattr(model, "classes_"):
    print(">>> Model classes:", model.classes_)
else:
    print(">>> No classes_ found")

def predict(features: dict):
    try:
        if "co_applicant_credit_type" in features:
            features["co-applicant_credit_type"] = features.pop("co_applicant_credit_type")

        X = pd.DataFrame([features])
        print("=== Input DataFrame ===")
        print(X.columns.tolist())

        y_pred = model.predict(X)[0]

        y_prob = None
        if hasattr(model, "predict_proba"):
            y_prob = model.predict_proba(X)[0][1]

        risk_level = "unknown"
        if y_prob is not None:
            if y_prob > 0.7:
                risk_level = "high"
            elif y_prob > 0.4:
                risk_level = "medium"
            else:
                risk_level = "low"

        result = {
            "prediction": int(y_pred),
            "probability": round(float(y_prob), 4) if y_prob is not None else None,
            "risk_level": risk_level,
        }

        print("Prediction Result:", result)
        return result

    except Exception as e:
        print("Prediction error:", e)
        return {"error": str(e)}

