import requests as r

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Cookie": """RSESS_session=8f0a347eb664534e7a13404026968ca297dc97e6; RSESS_remember=cc66b734c1bb15bc4e5c0eb7cf10eb5613901932"""
}

res = r.get("https://www.seedr.cc/presentation/fs/item/5828825044/video/url",  headers=headers)

print(res.text)