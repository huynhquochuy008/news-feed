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

# In-memory cache for news data
NEWS_CACHE = {}
CACHE_LOCK = threading.Lock()


def get_pnj_gold_price():
    url = "https://giavang.pnj.com.vn/"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    try:
        res = requests.get(url, headers=headers, timeout=10)
        res.encoding = 'utf-8'
        if res.status_code != 200:
            return {"error": f"Status {res.status_code}"}
    except Exception as e:
        return {"error": str(e)}

    soup = BeautifulSoup(res.text, 'html.parser')
    table = soup.find('table')
    prices = []

    current_area = None

    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')
        if len(cols) == 5:
            current_area = cols[0].text.strip()
            loai_vang = cols[1].text.strip()
            gia_mua = cols[2].text.strip()
            gia_ban = cols[3].text.strip()
            updated = cols[4].text.strip()
        elif len(cols) == 4:
            loai_vang = cols[0].text.strip()
            gia_mua = cols[1].text.strip()
            gia_ban = cols[2].text.strip()
            updated = cols[3].text.strip()
        else:
            continue

        if current_area and current_area.lower() in ["tphcm", "tp hcm", "tp hồ chí minh"] and loai_vang.upper() in ["SJC", "PNJ"]:
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


def fetch_and_cache_news():
    """Fetch news for all regions and update the cache."""
    global NEWS_CACHE
    for region in RSS_FEEDS.keys():
        feeds = RSS_FEEDS[region]
        all_news = []
        for source, url in feeds.items():
            try:
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
            except Exception as e:
                print(f"Error fetching {url}: {e}")
        with CACHE_LOCK:
            NEWS_CACHE[region] = all_news


def fetch_news_by_region(region="vn"):
    """Return cached news for the region, or fetch if not cached."""
    region = region.lower()
    with CACHE_LOCK:
        news = NEWS_CACHE.get(region)
    if news is not None:
        return news
    # If not cached, fetch and cache now (blocking)
    feeds = RSS_FEEDS.get(region, {})
    all_news = []
    for source, url in feeds.items():
        try:
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
        except Exception as e:
            print(f"Error fetching {url}: {e}")
    with CACHE_LOCK:
        NEWS_CACHE[region] = all_news
    return all_news


def schedule_fetch(interval=600):
    def run():
        while True:
            fetch_and_cache_news()
            print("Đã cập nhật tin tức.")
            time.sleep(interval)
    thread = threading.Thread(target=run)
    thread.daemon = True
    thread.start()