from google_adk_bso.keywords import generate_keywords


def test_generate_keywords_from_title():
    product = {"title": "Acme SuperWidget 3000", "description": "Top widget"}
    kws = generate_keywords(product, max_keywords=5)
    assert any("superwidget" in k.replace(" ", "") or "superwidget" in k for k in kws)


def test_brand_prefixing():
    product = {"title": "Mini Lamp", "brand": "Acme"}
    kws = generate_keywords(product, max_keywords=5)
    assert any(k.startswith("acme ") for k in kws)
