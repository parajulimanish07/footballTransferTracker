from typing import Dict, Any, Tuple
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report,
)

def evaluate_classifier(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: list
) -> Dict[str, Any]:
    """
    Computes Accuracy, Precision, Recall, Macro F1, Weighted F1, Confusion Matrix, and Per-class metrics.
    """
    accuracy = float(accuracy_score(y_true, y_pred))
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    prec_weighted, rec_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )

    prec_class, rec_class, f1_class, support_class = precision_recall_fscore_support(
        y_true, y_pred, labels=labels, zero_division=0
    )

    per_class_metrics = {}
    for idx, label in enumerate(labels):
        per_class_metrics[str(label)] = {
            "precision": float(prec_class[idx]),
            "recall": float(rec_class[idx]),
            "f1": float(f1_class[idx]),
            "support": int(support_class[idx]),
        }

    cm = confusion_matrix(y_true, y_pred, labels=labels).tolist()

    return {
        "accuracy": round(accuracy, 4),
        "precision_macro": round(float(prec_macro), 4),
        "recall_macro": round(float(rec_macro), 4),
        "macro_f1": round(float(f1_macro), 4),
        "weighted_f1": round(float(f1_weighted), 4),
        "confusion_matrix": cm,
        "per_class": per_class_metrics,
    }
