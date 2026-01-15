# google-adk-bso

Lightweight extraction of selected components from Google ADK sample `brand-search-optimization`.

Purpose
- Provide a small, safe-to-run library that exposes:
  - BigQuery read helper (wrapper) for product records
  - Keyword-generation logic extracted from prompts/heuristics

Notes
- This package intentionally excludes web-crawling code (Selenium). Use only for offline evaluation and integration of keyword generation / BigQuery access.
