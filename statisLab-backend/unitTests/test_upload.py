import io
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


SAMPLE_CSV_PATH = Path(__file__).resolve().parents[1] / "sample_data" / "sample.csv"


class UploadValidationTests(unittest.TestCase):
    def create_client(self):
        return TestClient(app)

    def test_upload_csv_returns_session_and_summary(self):
        client = self.create_client()
        with SAMPLE_CSV_PATH.open("rb") as file_obj:
            response = client.post(
                "/upload",
                files={"file": ("sample.csv", file_obj, "text/csv")},
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("sessionId", payload)
        self.assertIn("totalCols", payload)
        self.assertIn("totalRows", payload)

    def test_upload_rejects_non_csv_extension(self):
        client = self.create_client()
        response = client.post(
            "/upload",
            files={"file": ("sample.txt", io.BytesIO(b"a,b\n1,2\n"), "text/csv")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "file must have a .csv extension")

    def test_upload_rejects_invalid_content_type(self):
        client = self.create_client()
        response = client.post(
            "/upload",
            files={"file": ("sample.csv", io.BytesIO(b"a,b\n1,2\n"), "application/json")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "invalid file type")

    def test_download_audit_returns_excel_file(self):
        client = self.create_client()
        with SAMPLE_CSV_PATH.open("rb") as file_obj:
            upload_response = client.post(
                "/upload",
                files={"file": ("sample.csv", file_obj, "text/csv")},
            )
        self.assertEqual(upload_response.status_code, 200)
        session_id = upload_response.json()["sessionId"]

        client.post(
            "/preprocess/action",
            json={
                "sessionId": session_id,
                "action": "dropAllNulls",
                "params": None,
            },
        )

        download_response = client.post(
            "/download_audit",
            json={"sessionId": session_id},
        )

        self.assertEqual(download_response.status_code, 200)
        self.assertEqual(
            download_response.headers["content-type"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        self.assertIn("attachment; filename=", download_response.headers["content-disposition"])


if __name__ == "__main__":
    unittest.main()
