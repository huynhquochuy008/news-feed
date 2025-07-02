from flask import Flask, jsonify
from flask_cors import CORS
from utils.news_utils import get_pnj_gold_price, fetch_news_by_region, schedule_fetch


app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "https://news-feed-rust-three.vercel.app"
])
RSS_FEEDS = {
    "vnexpress": "https://vnexpress.net/rss/tin-moi-nhat.rss",
    "zingnews": "https://zingnews.vn/rss.html",
    "tuoitre": "https://tuoitre.vn/rss/tin-moi-nhat.rss"
}


@app.route("/news", methods=["GET"])
@app.route("/news/<region>", methods=["GET"])
def get_news(region="vn"):
    data = fetch_news_by_region(region)
    return jsonify(data)


@app.route("/gold", methods=["GET"])
def gold_price():
    return jsonify(get_pnj_gold_price())


# @app.route("/exchange-rates", methods=["GET"])
# def get_exchange_rates():
#     url = "https://api.exchangerate.host/latest?base=USD&symbols=VND,EUR,JPY"
#     res = requests.get(url)
#     if res.status_code != 200:
#         return jsonify({"error": "Failed to fetch exchange rates"}), 500
#     data = res.json()
#     return jsonify(data["rates"])


if __name__ == "__main__":
    fetch_news_by_region()  # Lấy dữ liệu lần đầu
    schedule_fetch()  # Bắt đầu scheduler
    app.run(debug=True, host="192.168.56.10")
