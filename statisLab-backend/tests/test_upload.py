from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_upload_csv():
    with open("sample.csv", "rb") as f:
        response = client.post("/upload", files={"file": ("sample.csv", f, "text/csv")})
    assert response.status_code == 200
    assert "columns" in response.json()
