import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { getUserSummaries } from "../../../services/summariesService";

export default function SavedSummaries({ onSelectSummary }) {
  const [summaries, setSummaries] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);

  async function loadSummaries() {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const res = await getUserSummaries({ page, limit: 5 });

      setSummaries(prev => {
        const ids = new Set(prev.map(s => s._id));
        const filtered = res.data.filter(s => !ids.has(s._id));
        return [...prev, ...filtered];
      });

      setHasMore(res.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error("Erro ao carregar resumos:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }

  useEffect(() => {
    loadSummaries();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadSummaries();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="saved-summaries">
      <h3>📚 Resumos Salvos</h3>

      {summaries.map(summary => (
        <motion.div
          key={summary._id}
          className="summary-item"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectSummary(summary)} 
        >
          <h4>
            {summary.contentType === "youtube" ? "🎬" : "📄"} {summary.title}
          </h4>

          <p>{summary.summary.slice(0, 120)}...</p>

          <span className="date">
            {new Date(summary.createdAt).toLocaleDateString()}
          </span>
        </motion.div>
      ))}

      {loading && <p className="loading">Carregando...</p>}
      {!hasMore && summaries.length > 0 && (
        <p className="end">Você chegou ao fim 📌</p>
      )}

      <div ref={observerRef} style={{ height: 1 }} />
    </div>
  );
}
