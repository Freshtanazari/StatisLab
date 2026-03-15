import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


SAMPLE_CSV_PATH = Path(__file__).resolve().parents[1] / "sample_data" / "sample.csv"


class BackendApiTests(unittest.TestCase):
    def create_client(self):
        return TestClient(app)

    def upload_sample(self, client: TestClient):
        with SAMPLE_CSV_PATH.open("rb") as file_obj:
            response = client.post(
                "/upload",
                files={"file": ("sample.csv", file_obj, "text/csv")},
            )
        self.assertEqual(response.status_code, 200)
        return response.json()

    def test_upload_returns_preview_payload(self):
        client = self.create_client()
        payload = self.upload_sample(client)

        self.assertIn("dataset", payload)
        self.assertIn("totalCols", payload)
        self.assertIn("totalRows", payload)
        self.assertIn("missingPercentage", payload)
        self.assertIn("dataTypes", payload)
        self.assertIn("sessionId", payload)
        self.assertIsInstance(payload["dataset"], list)
        self.assertGreater(len(payload["dataset"]), 0)

    def test_preprocess_table_returns_column_metadata(self):
        client = self.create_client()
        payload = self.upload_sample(client)

        response = client.post(
            "/preprocess",
            json={
                "sessionId": payload["sessionId"],
                "action": "tableData",
                "params": None,
            },
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("ID", body)
        self.assertIn("type", body["ID"])
        self.assertIn("missing", body["ID"])
        self.assertIn("actions", body["ID"])

    def test_preprocess_action_is_logged_and_visible_in_audit_log(self):
        client = self.create_client()
        payload = self.upload_sample(client)

        action_response = client.post(
            "/preprocess/action",
            json={
                "sessionId": payload["sessionId"],
                "action": "dropAllNulls",
                "params": None,
            },
        )
        self.assertEqual(action_response.status_code, 200)

        audit_response = client.post(
            "/preprocess/action",
            json={
                "sessionId": payload["sessionId"],
                "action": "display_audit_log",
                "params": None,
            },
        )

        self.assertEqual(audit_response.status_code, 200)
        audit_entries = audit_response.json()["message"]
        self.assertIsInstance(audit_entries, list)
        self.assertGreater(len(audit_entries), 0)
        self.assertEqual(
            audit_entries[-1]["details"],
            "All null values have been dropped from dataset.",
        )

    def test_session_protection_blocks_other_clients(self):
        client_a = self.create_client()
        payload = self.upload_sample(client_a)

        client_b = self.create_client()
        forbidden_response = client_b.post(
            "/preprocess/action",
            json={
                "sessionId": payload["sessionId"],
                "action": "display_audit_log",
                "params": None,
            },
        )

        self.assertEqual(forbidden_response.status_code, 403)
        self.assertEqual(
            forbidden_response.json()["detail"],
            "You are not allowed to access this session.",
        )


if __name__ == "__main__":
    unittest.main()