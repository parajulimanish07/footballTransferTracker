# Python FastAPI Transfer Intelligence Machine Learning Service

This service provides text classification, TF-IDF duplicate detection, and text preprocessing for the **PitchPulse** Transfer Intelligence Platform.

## Features & Endpoints

- **`GET /health`**: Health status and current model metadata.
- **`POST /predict-transfer-status`**: Predicts transfer status across 9 categories (`OFFICIAL`, `AGREEMENT_REACHED`, `ADVANCED_TALKS`, `NEGOTIATIONS`, `BID_SUBMITTED`, `APPROACH_MADE`, `INTEREST`, `DEPARTURE_EXPECTED`, `NOT_TRANSFER_NEWS`).
- **`POST /detect-duplicates`**: Calculates TF-IDF Cosine Similarity and entity alignment between news stories to identify duplicates (`>= 0.82`), related stories (`0.68 - 0.82`), or separate reports (`< 0.68`).
- **`POST /analyse-text`**: Preprocesses text, extracts n-grams, and identifies keywords.
- **`GET /model-metrics`**: Returns model evaluation metrics (Accuracy, Precision, Recall, Macro F1, Weighted F1, and Confusion Matrix).

## Model Training & Evaluation Pipeline

The training pipeline compares two algorithms:
1. **Model A:** TF-IDF (`ngram_range=(1,2)`, `min_df=1`, `max_features=10000`) + `LogisticRegression(class_weight='balanced')`.
2. **Model B:** TF-IDF + `CalibratedClassifierCV(LinearSVC(class_weight='balanced'))`.

Model selection is strictly based on **Macro F1-score** to prevent majority-class bias.

### How to Train the Classifier

```bash
cd ml-service
python training/train_transfer_classifier.py
```

Trained artifacts (`best_model.joblib`, `vectorizer.joblib`, `label_encoder.joblib`, `metrics.joblib`) are automatically saved to `ml-service/models/`.

### How to Run Pytest Suite

```bash
cd ml-service
pytest tests/
```

### Dataset Expansion Guide

The demonstration dataset located at `ml-service/data/transfer_news_dataset.csv` contains baseline examples across all 9 classes. To scale accuracy for production:
1. Use the `/admin/labelling` interface in the Next.js app to label reviewed NewsAPI articles.
2. Export the newly labelled articles CSV.
3. Append them to `ml-service/data/transfer_news_dataset.csv`.
4. Re-run `python training/train_transfer_classifier.py`.
