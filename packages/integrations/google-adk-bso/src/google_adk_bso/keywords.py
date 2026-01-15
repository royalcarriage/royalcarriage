"""Simple keyword generation heuristics extracted from ADK sample.

This implements conservative, testable logic suitable for integration.
"""
from typing import Dict, List
import re


def _tokenize(text: str) -> List[str]:
    text = text or ""
    # basic tokenizer: split on non-word chars, keep tokens of length >=2
    tokens = re.split(r"\W+", text.lower())
    return [t for t in tokens if len(t) >= 2]


def generate_keywords(product: Dict, max_keywords: int = 10) -> List[str]:
    """Generate candidate keywords from a product record.

    product: dict with keys like `title`, `description`, `brand`, `attributes` (optional)
    """
    candidates = []
    title = product.get("title") or ""
    desc = product.get("description") or ""
    brand = product.get("brand") or ""

    # prioritize title tokens
    title_tokens = _tokenize(title)
    desc_tokens = _tokenize(desc)
    brand_tokens = _tokenize(brand)

    # compound keywords from title (n-grams up to 3)
    for n in (3, 2):
        for i in range(max(0, len(title_tokens) - n + 1)):
            gram = " ".join(title_tokens[i : i + n])
            if gram and gram not in candidates:
                candidates.append(gram)
                if len(candidates) >= max_keywords:
                    return candidates

    # add brand-prefixed tokens
    for t in title_tokens + desc_tokens:
        if brand_tokens:
            candidate = f"{brand_tokens[0]} {t}"
            if candidate not in candidates:
                candidates.append(candidate)
                if len(candidates) >= max_keywords:
                    return candidates

    # fall back to single tokens
    for t in title_tokens + desc_tokens + brand_tokens:
        if t not in candidates:
            candidates.append(t)
            if len(candidates) >= max_keywords:
                return candidates

    return candidates
