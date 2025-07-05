import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NewsCard = ({ news }) => (
  <motion.article
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group flex flex-col h-full"
  >
    {news.image && (
      <div className="aspect-video overflow-hidden">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
          {news.source}
        </span>
        <span className="text-xs text-gray-400">{news.published}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
        <a href={news.link} target="_blank" rel="noopener noreferrer">
          {news.title}
        </a>
      </h2>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{news.summary?.slice(0, 150)}...</p>
      <div className="mt-auto flex justify-end">
        <a
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
        >
          Read more
        </a>
      </div>
    </div>
  </motion.article>
);

const GoldRow = ({ item }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-500 text-gray-800 p-4 rounded-xl shadow mb-2">
    <div className="flex justify-between items-center text-sm">
      <div className="font-semibold">{item.loai_vang}</div>
      <div className="flex gap-4">
        <span>Mua: <strong>{item.gia_mua}</strong></span>
        <span>Bán: <strong>{item.gia_ban}</strong></span>
        <span className="text-gray-500">{item.cap_nhat}</span>
      </div>
    </div>
  </div>
);

const apiUrl = import.meta.env.BACKEND_API_URL;

const App = () => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [goldData, setGoldData] = useState([]);
  const [country, setCountry] = useState("VN");

  useEffect(() => {
    let endpoint = `${apiUrl}/news`;
    if (country === "US") endpoint = `${apiUrl}/news/us`;
    else if (country === "EU") endpoint = `${apiUrl}/news/eu`;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setNews(data));
  }, [country]);

  useEffect(() => {
    fetch(`${apiUrl}/gold`)
      .then((res) => res.json())
      .then((data) => setGoldData(data));
  }, []);

  const filtered = news.filter((n) => {
    const matchSource = sourceFilter === "all" || n.source === sourceFilter;
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase());
    return matchSource && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-700">NewsHub</span>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="VN">🇻🇳 Việt Nam</option>
              <option value="US">🇺🇸 Mỹ</option>
              <option value="EU">🇪🇺 Châu Âu</option>
            </select>
            <select
              className="px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">Tất cả nguồn</option>
              <option value="vnexpress">VnExpress</option>
              <option value="zingnews">ZingNews</option>
              <option value="tuoitre">Tuổi Trẻ</option>
              <option value="cnn">CNN</option>
              <option value="nyt">NYT</option>
              <option value="bbc">BBC</option>
              <option value="dw">DW</option>
            </select>
            <input
              className="px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gold Price Widget */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-yellow-600 mb-2">
            Giá vàng tại TPHCM (PNJ & SJC)
          </h2>
          {goldData.length === 0 && (
            <p className="text-sm text-gray-500">Đang tải...</p>
          )}
          {goldData.map((item, idx) => (
            <GoldRow key={idx} item={item} />
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, index) => (
            <NewsCard news={item} key={index} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Không tìm thấy bài viết phù hợp
            </h3>
            <p className="text-gray-500 mb-4">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 NewsHub. Built with modern web technologies for the best news experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
