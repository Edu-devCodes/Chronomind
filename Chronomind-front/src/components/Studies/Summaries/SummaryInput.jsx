import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FiYoutube, FiSend, FiX } from "react-icons/fi";


import { summarizePDF } from "../../../services/pdfService";
import { generateSummary } from "../../../services/youtubeService";

/**
 * Props opcionais:
 * - selectedSummary: resumo vindo do SavedSummaries
 * - clearSelected: função pra limpar seleção
 */
export default function SummaryInput({
  selectedSummary = null,
  clearSelected = () => { }
}) {
  const [type, setType] = useState("video");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  /* ===============================
     LOADING STEPS (DOPAMINA)
  =============================== */
  const loadingSteps = [
    "Analisando conteúdo 📡",
    "Processando texto 💌",
    "Entendendo o contexto 🧠",
    "Gerando resumo com IA ✨",
  ];

  /* ===============================
     QUANDO CLICAR EM RESUMO SALVO
  =============================== */
  useEffect(() => {
    if (!selectedSummary) return;

    setResult(selectedSummary);
    setType(selectedSummary.contentType || "video");
    setFile(null);
    setVideoUrl("");
    setLoading(false);
    setLoadingStep(0);
  }, [selectedSummary]);

  /* ===============================
     ANIMAÇÃO DE LOADING
  =============================== */
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  /* ===============================
     PDF
  =============================== */
  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são permitidos.");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("O PDF deve ter no máximo 10MB.");
      return;
    }

    setFile(selected);
    toast.success("PDF selecionado com sucesso!");
  }

  async function handleGeneratePDF() {
    if (!file) return;

    try {
      setLoading(true);
      const data = await summarizePDF(file);
      setResult(data);
      toast.success("Resumo gerado!");
    } catch {
      toast.error("Erro ao gerar resumo.");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     YOUTUBE
  =============================== */
  async function handleGenerateVideo() {
    if (!videoUrl) {
      toast.error("Cole a URL do YouTube.");
      return;
    }

    try {
      setLoading(true);

      const data = await generateSummary({
        contentType: "youtube",
        contentId: videoUrl,
        title: "Vídeo do YouTube",
        url: videoUrl,
      });

      setResult(data);
      toast.success("Resumo gerado!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Não foi possível gerar o resumo do vídeo."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setFile(null);
    setVideoUrl("");
    setResult(null);
    setLoading(false);
    setLoadingStep(0);
    clearSelected();

    const input = document.querySelector('input[type="file"]');
    if (input) input.value = "";
  }

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="summary-box">
      <h2>Resumo</h2>

      <div className="summary-type">
        <button
          className={type === "video" ? "active" : ""}
          onClick={() => setType("video")}
          disabled={loading}
        >
          🎬 Vídeo
        </button>

        <button
          className={type === "pdf" ? "active" : ""}
          onClick={() => setType("pdf")}
          disabled={loading}
        >
          📄 PDF
        </button>
      </div>

      {/* ================= LOADING ================= */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-box"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "linear",
              }}
            />

            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {loadingSteps[loadingStep]}
            </motion.p>

            <span className="loading-hint">
              Isso pode levar até 1 minuto ⏳
            </span>
          </motion.div>
        )}
      </AnimatePresence>

{/* ================= PDF ================= */}
{!loading && type === "pdf" && !result && (
  <motion.div
    className="pdf-box"
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
  >

    {/* INPUT FAKE */}
    <label className="pdf-input">

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        hidden
      />

      {!file && (
        <span className="pdf-placeholder">
          📄 Selecionar PDF
        </span>
      )}

      {file && (
        <span className="pdf-selected">
          📄 {file.name}
        </span>
      )}

    </label>

    {/* BOTÃO REMOVER */}
    {file && (
      <button
        className="pdf-remove-btn"
        onClick={resetAll}
        title="Remover PDF"
      >
        <FiX size={16} />
      </button>
    )}

    {/* BOTÃO GERAR */}
    <button
      className="generate-btn"
      onClick={handleGeneratePDF}
      disabled={!file}
    >
      <FiSend size={18} />
      Gerar
    </button>

  </motion.div>
)}


      {/* ================= YOUTUBE ================= */}

      {!loading && type === "video" && !result && (
        <motion.div
          className="video-box-inline"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="video-input-wrapper">

            <FiYoutube className="yt-icon" />

            <input
              type="text"
              placeholder="Cole o link do YouTube aqui..."
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
            />

            <button
              className="video-generate-btn"
              onClick={handleGenerateVideo}
              disabled={loading}
            >
              <FiSend size={18} />
              Gerar
            </button>

          </div>
        </motion.div>
      )}


      {/* ================= RESULTADO ================= */}
      {result && !loading && (
        <motion.div
          className="summary-result"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4>{result.title || "Resumo"}</h4>
          <p>{result.summary}</p>

          <button className="close-btn" onClick={resetAll}>
            Novo resumo
          </button>
        </motion.div>
      )}
    </div>
  );
}
