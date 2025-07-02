import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const NewsCard = ({ news }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="transition-transform duration-200"
    >
      <Card className="rounded-2xl shadow-md p-4 hover:shadow-xl border-l-4 border-blue-500 h-full flex flex-col justify-between">
        <CardContent>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-700">
              <a href={news.link} target="_blank" rel="noopener noreferrer">
                {news.title}
              </a>
            </h2>
            <Badge>{news.source}</Badge>
          </div>
          {news.image && (
            <div className="w-full aspect-video overflow-hidden rounded-xl my-3">
              <img
                src={news.image}
                alt="thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-gray-600 mt-2 text-sm">
            {news.summary?.slice(0, 150)}...
          </p>
          <p className="text-gray-400 mt-2 text-xs mt-auto">{news.published}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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

const App = () => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [goldData, setGoldData] = useState([]);
  const [country, setCountry] = useState("VN");

  useEffect(() => {
    let endpoint = "http://192.168.56.10:5000/news";

    if (country === "US") {
      endpoint = "http://192.168.56.10:5000/news/us";
    } else if (country === "EU") {
      endpoint = "http://192.168.56.10:5000/news/eu";
    }

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setNews(data));
  }, [country]);

  useEffect(() => {
    fetch("http://192.168.56.10:5000/gold")
      .then((res) => res.json())
      .then((data) => setGoldData(data));
  }, []);

  const filtered = news.filter((n) => {
    const matchSource = sourceFilter === "all" || n.source === sourceFilter;
    const matchText =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase());
    return matchSource && matchText;
  });

  return (
    <main className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
        Tin tức lười
      </h1>

      <div className="mb-6">
        <label className="font-semibold mr-2">Chọn quốc gia:</label>
        <select
          className="px-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="VN">🇻🇳 Việt Nam</option>
          <option value="US">🇺🇸 Hoa Kỳ</option>
          <option value="EU">🇪🇺 Châu Âu</option>
        </select>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-yellow-600 mb-2">Giá vàng tại TPHCM (PNJ & SJC)</h2>
        {goldData.length === 0 && <p className="text-sm text-gray-500">Đang tải...</p>}
        {goldData.map((item, idx) => <GoldRow key={idx} item={item} />)}
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
        <Input
          placeholder="Tìm kiếm bài viết..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="all">Tất cả nguồn</option>
          <option value="vnexpress">VnExpress</option>
          <option value="zingnews">ZingNews</option>
          <option value="tuoitre">Tuổi Trẻ</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, index) => (
          <NewsCard news={item} key={index} />
        ))}
      </div>
    </main>
  );
};

export default App;
