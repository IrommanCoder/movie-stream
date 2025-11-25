import requests as r

headers=  {


    "Cookie": "RSESS_session=5c9a09b4309ae9e6d900aef30d25774c7110174a; PHPSESSID=86ugeo2g406gacqu3sfc6oka3f",


    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
}


res = r.get("https://www.seedr.cc/seedr-api/fs/folder/0/items",  headers=headers)

print(res.text)