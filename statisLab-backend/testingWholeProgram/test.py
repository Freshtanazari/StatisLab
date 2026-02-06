import requests

url = "http://127.0.0.1:8000/upload"

files = {
    "file": ("statisLab-backend\sample.csv", open("sample.csv", "rb"), "text/csv")
}

response = requests.post(url, files=files)
print(response.json())