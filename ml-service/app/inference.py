import os
import sys
import numpy as np
import joblib
from typing import Dict, Any, List

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.preprocessing import clean_text, combine_headline_and_description, extract_entities
from app.schemas import PredictRequest, PredictResponse

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "best_model.joblib")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "vectorizer.joblib")
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.joblib")

_model = None
_vectorizer = None
_label_encoder = None
_metrics = None

def load_artifacts():
    global _model, _vectorizer, _label_encoder, _metrics
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
            _vectorizer = joblib.load(VECTORIZER_PATH)
            _label_encoder = joblib.load(LABEL_ENCODER_PATH)
            _metrics = joblib.load(METRICS_PATH)
        except Exception as e:
            print(f"[Inference] Error loading artifacts: {e}")
            _model = None

def predict_status(req: PredictRequest, confidence_threshold: float = 0.65) -> PredictResponse:
    load_artifacts()

    # Rule Override: Official source
    if req.isOfficial or (req.sourceDomain and any(k in req.sourceDomain.lower() for k in ["official", "realmadrid.com", "liverpoolfc.com", "arsenal.com"])):
        return PredictResponse(
            prediction="OFFICIAL",
            confidence=1.0,
            modelVersion="rule-override-v1",
            probabilities={"OFFICIAL": 1.0},
            reasoningSignals=["Official club statement / primary source website"],
            ruleOverride="Official Club Announcement Override",
            needsReview=False
        )

    text = combine_headline_and_description(req.headline, req.description)
    cleaned = clean_text(text)

    # Deterministic Keyword Fallback if ML artifacts not loaded
    if _model is None or _vectorizer is None or _label_encoder is None:
        return _fallback_rule_prediction(cleaned)

    try:
        tfidf_vec = _vectorizer.transform([cleaned])
        probs = _model.predict_proba(tfidf_vec)[0]
        max_idx = int(np.argmax(probs))
        confidence = float(probs[max_idx])
        prediction = str(_label_encoder.classes_[max_idx])

        # Extract top matching n-grams for Explainable AI
        feature_names = _vectorizer.get_feature_names_out()
        nonzero_indices = tfidf_vec.nonzero()[1]
        reasoning_signals = []
        for idx in nonzero_indices:
            word = feature_names[idx]
            val = float(tfidf_vec[0, idx])
            reasoning_signals.append(f'"{word}" (tfidf: {val:.2f})')
        
        reasoning_signals = sorted(reasoning_signals, key=lambda x: float(x.split("tfidf: ")[1].replace(")", "")), reverse=True)[:5]

        # Probabilities dictionary
        prob_dict = {
            str(_label_encoder.classes_[i]): round(float(probs[i]), 4)
            for i in range(len(probs))
        }

        needs_review = confidence < confidence_threshold

        return PredictResponse(
            prediction=prediction,
            confidence=round(confidence, 4),
            modelVersion=_metrics.get("modelVersion", "transfer-classifier-v1.0") if _metrics else "v1.0",
            probabilities=prob_dict,
            reasoningSignals=reasoning_signals,
            ruleOverride=None,
            needsReview=needs_review
        )
    except Exception as e:
        print(f"[Inference] Prediction exception: {e}")
        return _fallback_rule_prediction(cleaned)

def _fallback_rule_prediction(text: str) -> PredictResponse:
    t = text.lower()
    if "official" in t or "signed" in t or "completed" in t:
        pred, conf = "OFFICIAL", 0.90
    elif "here we go" in t or "agreed" in t or "agreement" in t:
        pred, conf = "AGREEMENT_REACHED", 0.88
    elif "advanced" in t or "closing in" in t:
        pred, conf = "ADVANCED_TALKS", 0.80
    elif "talks" in t or "negotiations" in t or "discussing" in t:
        pred, conf = "NEGOTIATIONS", 0.75
    elif "bid" in t or "offer" in t or "proposal" in t:
        pred, conf = "BID_SUBMITTED", 0.82
    elif "approach" in t or "contact" in t:
        pred, conf = "APPROACH_MADE", 0.70
    elif "interest" in t or "monitoring" in t or "eyeing" in t:
        pred, conf = "INTEREST", 0.68
    elif "expected to leave" in t or "depart" in t:
        pred, conf = "DEPARTURE_EXPECTED", 0.72
    else:
        pred, conf = "INTEREST", 0.50

    return PredictResponse(
        prediction=pred,
        confidence=conf,
        modelVersion="rule-fallback-v1",
        probabilities={pred: conf},
        reasoningSignals=[f"Matched rule keyword pattern in text"],
        ruleOverride="Fallback Rule Engine",
        needsReview=conf < 0.65
    )

def get_metrics_summary() -> Dict[str, Any]:
    load_artifacts()
    if _metrics:
        return _metrics
    return {
        "modelVersion": "not-trained",
        "bestModelType": "None",
        "accuracy": 0.0,
        "precision": 0.0,
        "recall": 0.0,
        "macroF1": 0.0,
        "weightedF1": 0.0,
        "classPerformance": {},
        "confusionMatrix": [],
        "datasetSize": 0
    }
