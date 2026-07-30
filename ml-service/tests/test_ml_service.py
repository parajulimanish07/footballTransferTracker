import sys
import os
import pytest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.preprocessing import clean_text, combine_headline_and_description
from app.schemas import PredictRequest, DuplicateDetectItem
from app.inference import predict_status
from app.duplicate_detection import detect_duplicates

def test_clean_text():
    raw = "Arsenal in ADVANCED talks for player! Check https://example.com/link"
    cleaned = clean_text(raw)
    assert "https" not in cleaned
    assert "arsenal in advanced talks for player" in cleaned

def test_combine_headline_and_description():
    res = combine_headline_and_description("Headline title", "Description text")
    assert res == "Headline title Description text"

def test_official_source_override():
    req = PredictRequest(
        headline="Official Statement from Club",
        description="Player joins team",
        sourceDomain="realmadrid.com",
        isOfficial=True
    )
    res = predict_status(req)
    assert res.prediction == "OFFICIAL"
    assert res.confidence == 1.0
    assert res.ruleOverride is not None

def test_duplicate_detection_high_similarity():
    item1 = DuplicateDetectItem(
        id="1",
        headline="Arsenal agree deal for Riccardo Calafiori",
        description="Arsenal have reached full agreement with Bologna for Italian defender Calafiori.",
        playerName="Riccardo Calafiori",
        clubs=["Arsenal", "Bologna"],
        publishedAt="2026-07-26T10:00:00Z",
        sourceDomain="theathletic.com"
    )
    item2 = DuplicateDetectItem(
        id="2",
        headline="Arsenal agree deal for Riccardo Calafiori from Bologna",
        description="Arsenal have reached agreement with Bologna for Italian defender Calafiori.",
        playerName="Riccardo Calafiori",
        clubs=["Arsenal", "Bologna"],
        publishedAt="2026-07-26T12:00:00Z",
        sourceDomain="twitter.com"
    )

    resp = detect_duplicates(target=item1, candidates=[item2])
    assert len(resp.results) == 1
    assert resp.results[0].relationship == "duplicate"
    assert resp.results[0].similarity > 0.80
