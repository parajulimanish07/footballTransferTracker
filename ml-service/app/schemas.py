from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    headline: str = Field(..., description="Article headline")
    description: Optional[str] = Field(None, description="Article summary or body snippet")
    sourceDomain: Optional[str] = Field(None, description="Domain of news source")
    isOfficial: Optional[bool] = Field(False, description="Flag indicating official club announcement")

class PredictResponse(BaseModel):
    prediction: str = Field(..., description="Predicted transfer status label")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    modelVersion: str = Field(..., description="Trained model identifier")
    probabilities: Optional[Dict[str, float]] = Field(None, description="Class probabilities if available")
    decisionScores: Optional[Dict[str, float]] = Field(None, description="Decision scores if SVM is selected")
    reasoningSignals: List[str] = Field(default_factory=list, description="Matching n-grams and TF-IDF features")
    ruleOverride: Optional[str] = Field(None, description="Rule override applied (e.g. Official source)")
    needsReview: bool = Field(False, description="Flagged for human review if confidence < threshold")

class DuplicateDetectItem(BaseModel):
    id: str
    headline: str
    description: Optional[str] = None
    playerName: Optional[str] = None
    clubs: List[str] = Field(default_factory=list)
    publishedAt: Optional[str] = None
    sourceDomain: Optional[str] = None

class DuplicateDetectRequest(BaseModel):
    target: DuplicateDetectItem
    candidates: List[DuplicateDetectItem]
    similarityThreshold: float = Field(0.82, description="Similarity threshold for duplicate classification")
    relatedThreshold: float = Field(0.68, description="Similarity threshold for related classification")

class DuplicatePairResult(BaseModel):
    candidateId: str
    relationship: str = Field(..., description="duplicate | related | separate")
    similarity: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    reasons: List[str] = Field(default_factory=list, description="Explanation signals")

class DuplicateDetectResponse(BaseModel):
    targetId: str
    primaryStoryId: str
    results: List[DuplicatePairResult]

class TextAnalysisRequest(BaseModel):
    headline: str
    description: Optional[str] = None

class TextAnalysisResponse(BaseModel):
    tokens: List[str]
    entities: Dict[str, List[str]]
    cleanedText: str

class ModelMetricsResponse(BaseModel):
    modelVersion: str
    trainingDate: str
    bestModelType: str
    accuracy: float
    precision: float
    recall: float
    macroF1: float
    weightedF1: float
    classPerformance: Dict[str, Dict[str, float]]
    confusionMatrix: List[List[int]]
    datasetSize: int
