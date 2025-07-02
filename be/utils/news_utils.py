import json, feedparser, threading, time, requests, os
from bs4 import BeautifulSoup

RSS_FEEDS = {
    "vn": {
        "vnexpress": "https://vnexpress.net/rss/tin-moi-nhat.rss",
        "zingnews": "https://zingnews.vn/rss.html",
        "tuoitre": "https://tuoitre.vn/rss/tin-moi-nhat.rss"
    },
    "us": {
        "cnn": "https://rss.cnn.com/rss/edition.rss",
        "nyt": "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
    },
    "eu": {
        "bbc": "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
        "dw": "https://rss.dw.com/rdf/rss-en-eu"
    }
}


def get_pnj_gold_price():
    url = "https://giavang.pnj.com.vn/"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    res = requests.get(url, headers=headers)
    res.encoding = 'utf-8'

    if res.status_code != 200:
        return {"error": f"Status {res.status_code}"}

    soup = BeautifulSoup(res.text, 'html.parser')
    table = soup.find('table')
    prices = []

    # Biến để lưu giá trị khu vực nếu bị rowspan
    current_area = None

    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')

        if len(cols) == 5:
            # Dòng đầy đủ: có khu vực mới
            current_area = cols[0].text.strip()
            loai_vang = cols[1].text.strip()
            gia_mua = cols[2].text.strip()
            gia_ban = cols[3].text.strip()
            updated = cols[4].text.strip()
        elif len(cols) == 4:
            # Dòng kế tiếp bị rowspan khu vực
            loai_vang = cols[0].text.strip()
            gia_mua = cols[1].text.strip()
            gia_ban = cols[2].text.strip()
            updated = cols[3].text.strip()
        else:
            continue

        if current_area.lower() in ["tphcm", "tp hcm", "tp hồ chí minh"] and loai_vang.upper() in ["SJC", "PNJ"]:
            prices.append({
                "khu_vuc": current_area,
                "loai_vang": loai_vang,
                "gia_mua": gia_mua,
                "gia_ban": gia_ban,
                "cap_nhat": updated
            })

    return prices


def extract_text_only(summary):
    soup = BeautifulSoup(summary, 'html.parser')
    return soup.get_text().strip()


def extract_image(summary):
    soup = BeautifulSoup(summary, 'html.parser')
    img = soup.find('img')
    return img['src'] if img and img.has_attr('src') else None


def fetch_news_by_region(region="vn"):
    region = region.lower()
    feeds = RSS_FEEDS.get(region, {})
    all_news = []

    for source, url in feeds.items():
        feed = feedparser.parse(url)
        for entry in feed.entries:
            all_news.append({
                "source": source,
                "title": entry.title,
                "link": entry.link,
                "published": entry.get("published", ""),
                "summary": extract_text_only(entry.get("summary", "")),
                "image": extract_image(entry.get("summary", ""))
            })

    return all_news


# Tự động cập nhật tin tức mỗi 10 phút
def schedule_fetch(interval=600):
    def run():
        while True:
            fetch_news_by_region()
            print("Đã cập nhật tin tức.")
            time.sleep(interval)
    thread = threading.Thread(target=run)
    thread.daemon = True
    thread.start()
