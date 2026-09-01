import urllib.request
import xml.etree.ElementTree as ET
import json
import os
from datetime import datetime

# Бесплатные открытые RSS-источники экономических и международных новостей
RSS_FEEDS = [
    {
        "source": "The Guardian",
        "url": "https://www.theguardian.com/business/economics/rss",
        "category": "Global Macroeconomics"
    },
    {
        "source": "BBC News",
        "url": "http://feeds.bbci.co.uk/news/business/rss.xml",
        "category": "Trade & Policy"
    },
    {
        "source": "Euronews",
        "url": "https://www.euronews.com/rss?format=xml&level=theme&name=business",
        "category": "European Markets"
    },
    {
        "source": "Al Jazeera",
        "url": "https://www.aljazeera.com/xml/rss/all.xml",
        "category": "International Business"
    }
]

def clean_text(text):
    if not text:
        return ""
    # Базовая очистка от HTML-тегов
    import re
    clean = re.sub(r'<[^>]+>', '', text)
    return clean.strip()

def fetch_latest_news():
    articles = []
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

    for feed in RSS_FEEDS:
        try:
            req = urllib.request.Request(feed["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                xml_data = response.read()
                root = ET.fromstring(xml_data)

                # Обработка структуры RSS
                channel = root.find('channel')
                if channel is not None:
                    items = channel.findall('item')[:2] # Берем по 2 самые свежие из каждого источника
                    for item in items:
                        title = item.findtext('title')
                        link = item.findtext('link')
                        description = item.findtext('description')
                        pub_date = item.findtext('pubDate')

                        if title and link:
                            articles.append({
                                "source": feed["source"],
                                "category": feed["category"],
                                "title": clean_text(title),
                                "description": clean_text(description)[:220] + "..." if description else "Read full commentary in original report.",
                                "url": link,
                                "pubDate": pub_date[:16] if pub_date else "Recently"
                            })
        except Exception as e:
            print(f"Error fetching from {feed['source']}: {e}")

    # Оставляем 6 самых актуальных новостей
    selected_articles = articles[:6]

    output_data = {
        "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "articles": selected_articles
    }

    with open("news_data.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"Successfully updated news_data.json with {len(selected_articles)} articles.")

if __name__ == "__main__":
    fetch_latest_news()
