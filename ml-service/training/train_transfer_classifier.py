import os
import sys
from datetime import datetime
import pandas as pd
import numpy as np
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import StratifiedKFold

# Ensure app package is in path
sys.path.append(os-path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.preprocessing import clean_text, combine_headline_and_description
from training.evaluate_models import evaluate_classifier

def train_and_evaluate():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    data_path = os.path.join(project_dir, "data", "transfer_news_dataset.csv")
    models_dir = os.path.join(project_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print(f"[ML Training] Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Preprocess text
    df["full_text"] = df.apply(
        lambda row: clean_text(combine_headline_and_description(row["headline"], str(row.get("description", "")))),
        axis=1
    )
    
    X_raw = df["full_text"].values
    y_raw = df["label"].values

    # Encode labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)
    class_labels = list(label_encoder.classes_)

    print(f"[ML Training] Dataset size: {len(df)} samples across {len(class_labels)} classes.")

    # TF-IDF Vectoriser
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,
        max_features=10000
    )
    X_tfidf = vectorizer.fit_transform(X_raw)

    # Model A: Logistic Regression
    model_a = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
    model_a.fit(X_tfidf, y)
    y_pred_a = model_a.predict(X_tfidf)
    metrics_a = evaluate_classifier(y, y_pred_a, labels=list(range(len(class_labels))))

    # Model B: Linear SVM (with Probability Calibration)
    base_svm = LinearSVC(class_weight="balanced", random_state=42, dual="auto")
    model_b = CalibratedClassifierCV(estimator=base_svm, cv=3 if len(df) >= 15 else 2)
    model_b.fit(X_tfidf, y)
    y_pred_b = model_b.predict(X_tfidf)
    metrics_b = evaluate_classifier(y, y_pred_b, labels=list(range(len(class_labels))))

    print(f"Model A (Logistic Regression) Macro F1: {metrics_a['macro_f1']:.4f}")
    print(f"Model B (Linear SVM) Macro F1:          {metrics_b['macro_f1']:.4f}")

    # Select best model based on Macro F1
    if metrics_a["macro_f1"] >= metrics_b["macro_f1"]:
        best_model_name = "Logistic Regression"
        best_model = model_a
        best_metrics = metrics_a
    else:
        best_model_name = "Linear SVM (Calibrated)"
        best_model = model_b
        best_metrics = metrics_b

    print(f"[ML Training] Winner: {best_model_name} (Macro F1 = {best_metrics['macro_f1']:.4f})")

    # Metadata & Metrics persistence
    model_version = "transfer-classifier-v1.0"
    training_date = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    model_metadata = {
        "modelVersion": model_version,
        "trainingDate": training_date,
        "bestModelType": best_model_name,
        "accuracy": best_metrics["accuracy"],
        "precision": best_metrics["precision_macro"],
        "recall": best_metrics["recall_macro"],
        "macroF1": best_metrics["macro_f1"],
        "weightedF1": best_metrics["weighted_f1"],
        "classPerformance": {
            class_labels[i]: best_metrics["per_class"][i]
            for i in range(len(class_labels))
        },
        "confusionMatrix": best_metrics["confusion_matrix"],
        "datasetSize": len(df),
        "classLabels": class_labels,
    }

    # Save artifacts with joblib
    joblib.dump(best_model, os.path.join(models_dir, "best_model.joblib"))
    joblib.dump(vectorizer, os.path.join(models_dir, "vectorizer.joblib"))
    joblib.dump(label_encoder, os.path.join(models_dir, "label_encoder.joblib"))
    joblib.dump(model_metadata, os.path.join(models_dir, "metrics.joblib"))

    print(f"[ML Training] Successfully saved trained artifacts to {models_dir}")

if __name__ == "__main__":
    train_and_evaluate()
