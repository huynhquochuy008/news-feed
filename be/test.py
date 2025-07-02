import json, feedparser, threading, time, requests, os

from bs4 import BeautifulSoup

# from bs4 import BeautifulSoup as BSHTML

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
        print(feed)
        for entry in feed.entries:
            all_news.append({
                "source": source,
                "title": entry.title,
                "link": entry.link,
                "published": entry.get("published", ""),
                "summary": extract_text_only(entry.get("summary", "")),
                "image": extract_image(entry.get("summary", "")),
            })

    return all_news


a = fetch_news_by_region("us")
print(json.dumps(a))
