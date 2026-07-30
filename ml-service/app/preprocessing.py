import re
from typing import Tuple, List, Dict

def clean_text(text: str) -> str:
    """
    Normalises article text for vectorisation while preserving player and club proper nouns.
    - Converts to lowercase
    - Removes URLs
    - Normalises quotes and dashes
    - Removes excess whitespace
    """
    if not text:
        return ""
    
    # Lowercase
    cleaned = text.lower()
    
    # Remove URLs
    cleaned = re.sub(r'https?://\S+|www\.\S+', '', cleaned)
    
    # Normalise quotes, dashes and special punctuation
    cleaned = re.sub(r'[\u201c\u201d"]', '', cleaned)
    cleaned = re.sub(r'[\u2018\u2019\']', '', cleaned)
    cleaned = re.sub(r'[^\w\s\-\.]', ' ', cleaned)
    
    # Remove excess whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def extract_entities(text: str) -> Dict[str, List[str]]:
    """
    Extracts simple entity signals (e.g. transfer keywords, potential proper nouns).
    """
    if not text:
        return {"keywords": [], "entities": []}

    keywords = [
        kw for kw in [
            "here we go", "official", "signed", "agreement", "talks", "bid", 
            "offer", "proposal", "negotiations", "medical", "contract", "personal terms"
        ] if kw in text.lower()
    ]
    
    return {
        "keywords": keywords,
        "entities": []
    }

def combine_headline_and_description(headline: str, description: str = None) -> str:
    """
    Combines headline and description into a single text representation.
    """
    h = headline.strip() if headline else ""
    d = description.strip() if description else ""
    if d and d.lower() not in h.lower():
        return f"{h} {d}"
    return h
