from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.schemas import (
    PredictRequest, PredictResponse,
    DuplicateDetectRequest, DuplicateDetectResponse,
    TextAnalysisRequest, TextAnalysisResponse,
    ModelMetricsResponse
)
from app.inference import predict_status, get_metrics_summary
from app.duplicate_detection import detect_duplicates
from app.preprocessing import clean_text, extract_entities

app = FastAPI(
    title="Football Transfer Intelligence ML Service",
    description="Microservice providing transfer status classification, TF-IDF duplicate detection, and text analysis.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check() -> Dict[str, Any]:
    metrics = get_metrics_summary()
    return {
        "status": "healthy",
        "service": "transfer-intelligence-ml-service",
        "modelVersion": metrics.get("modelVersion", "v1.0"),
        "bestModelType": metrics.get("bestModelType", "Logistic Regression")
    }

@app.post("/predict-transfer-status", response_model=PredictResponse)
def api_predict_transfer_status(req: PredictRequest):
    try:
        return predict_status(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-duplicates", response_model=DuplicateDetectResponse)
def api_detect_duplicates(req: DuplicateDetectRequest):
    try:
        return detect_duplicates(
            target=req.target,
            candidates=req.candidates,
            similarity_threshold=req.similarityThreshold,
            related_threshold=req.relatedThreshold
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyse-text", response_model=TextAnalysisResponse)
def api_analyse_text(req: TextAnalysisRequest):
    try:
        text = f"{req.headline} {req.description or ''}"
        cleaned = clean_text(text)
        tokens = cleaned.split()
        entities = extract_entities(text)
        return TextAnalysisResponse(
            tokens=tokens,
            entities=entities,
            cleanedText=cleaned
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-metrics")
def api_get_model_metrics() -> Dict[str, Any]:
    return get_metrics_summary()
