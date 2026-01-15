"""Minimal BigQuery wrapper used for safe extraction.

This wrapper delays importing `google.cloud.bigquery` until needed so the
package can be installed without BigQuery for quick local tests.
"""
from typing import List, Dict, Optional


class BigQueryClient:
    def __init__(self, project: Optional[str] = None):
        self.project = project
        self._client = None

    def _ensure_client(self):
        if self._client is None:
            try:
                from google.cloud import bigquery

                self._client = bigquery.Client(project=self.project)
            except Exception as e:
                raise RuntimeError(
                    "google-cloud-bigquery is required to use BigQueryClient: %s" % e
                )

    def get_products(
        self, dataset: str, table: str, brand: Optional[str] = None, limit: int = 100
    ) -> List[Dict]:
        """Return product records as list of dicts.

        Args:
            dataset: BigQuery dataset id
            table: BigQuery table id
            brand: optional brand filter
            limit: max rows
        """
        self._ensure_client()
        query = f"SELECT * FROM `{self._client.project}.{dataset}.{table}`"
        if brand:
            query += f" WHERE LOWER(brand) = LOWER(@brand)"
        query += f" LIMIT {limit}"

        job_config = None
        if brand:
            from google.cloud import bigquery

            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("brand", "STRING", brand)
                ]
            )

        query_job = (
            self._client.query(query, job_config=job_config)
            if job_config
            else self._client.query(query)
        )
        rows = query_job.result()
        results = [dict(row.items()) for row in rows]
        return results
