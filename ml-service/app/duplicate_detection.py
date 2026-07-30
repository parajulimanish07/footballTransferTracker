from typing import List, Dict, Any
from datetime import datetime
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas import DuplicateDetectItem, DuplicatePairResult, DuplicateDetectResponse
from app.preprocessing import clean_text, combine_headline_and_description

def detect_duplicates(
    target: DuplicateDetectItem,
    candidates: List[DuplicateDetectItem],
    similarity_threshold: float = 0.82,
    related_threshold: float = 0.68
) -> DuplicateDetectResponse:
    """
    Computes TF-IDF Cosine Similarity and entity matching between target article and candidate articles.
    """
    if not candidates:
        return DuplicateDetectResponse(
            targetId=target.id,
            primaryStoryId=target.id,
            results=[]
        )

    # Build corpus
    target_text = clean_text(combine_headline_and_description(target.headline, target.description))
    candidate_texts = [
        clean_text(combine_headline_and_description(c.headline, c.description))
        for c in candidates
    ]
    
    corpus = [target_text] + candidate_texts

    # Fit TF-IDF
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Cosine similarities of target vs candidates
    sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

    results: List[DuplicatePairResult] = []
    primary_candidate_id = target.id
    highest_authority_score = get_authority_score(target.sourceDomain)

    for i, candidate in enumerate(candidates):
        score = float(sim_scores[i])
        reasons: List[str] = []

        # Check player match
        same_player = False
        if target.playerName and candidate.playerName:
            if target.playerName.lower() == candidate.playerName.lower():
                same_player = True
                reasons.append(f"Same player: {target.playerName}")

        # Check club match
        shared_clubs = set(c.lower() for c in target.clubs).intersection(set(c.lower() for c in candidate.clubs))
        if shared_clubs:
            reasons.append(f"Shared club: {', '.join(shared_clubs)}")

        # Check time window (within 24 hours)
        time_close = False
        if target.publishedAt and candidate.publishedAt:
            try:
                t1 = datetime.fromisoformat(target.publishedAt.replace("Z", "+00:00"))
                t2 = datetime.fromisoformat(candidate.publishedAt.replace("Z", "+00:00"))
                diff_hours = abs((t1 - t2).total_seconds()) / 3600.0
                if diff_hours <= 24:
                    time_close = True
                    reasons.append(f"Published within {int(diff_hours)} hours")
            except Exception:
                pass

        # Determine relationship
        if score >= similarity_threshold or (score >= 0.70 and same_player and shared_clubs):
            relationship = "duplicate"
            reasons.append(f"High TF-IDF similarity ({score:.2f})")
        elif score >= related_threshold or (same_player and shared_clubs):
            relationship = "related"
            reasons.append(f"Moderate TF-IDF similarity ({score:.2f})")
        else:
            relationship = "separate"
            reasons.append(f"Low similarity ({score:.2f})")

        # Track authoritative story
        if relationship == "duplicate":
            cand_authority = get_authority_score(candidate.sourceDomain)
            if cand_authority > highest_authority_score:
                highest_authority_score = cand_authority
                primary_candidate_id = candidate.id

        results.append(DuplicatePairResult(
            candidateId=candidate.id,
            relationship=relationship,
            similarity=round(score, 4),
            reasons=reasons
        ))

    return DuplicateDetectResponse(
        targetId=target.id,
        primaryStoryId=primary_candidate_id,
        results=results
    )

def get_authority_score(source_domain: str = None) -> int:
    if not source_domain:
        return 10
    sd = source_domain.lower()
    if any(k in sd for k in ["official", "realmadrid.com", "liverpoolfc.com", "arsenal.com"]):
        return 100
    if any(k in sd for k in ["theathletic.com", "thetimes.com", "bbc"]):
        return 80
    if any(k in sd for k in ["twitter.com", "x.com", "skysports.com"]):
        return 70
    return 40
