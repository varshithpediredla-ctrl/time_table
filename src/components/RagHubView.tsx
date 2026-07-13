import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  Sliders, 
  HelpCircle, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  Scale, 
  Terminal, 
  CheckCircle2, 
  Database,
  ArrowRight,
  Info,
  Clock,
  RefreshCw
} from "lucide-react";

interface RagDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  x: number;
  y: number;
  score: number;
  tfidfScore: number;
  semanticScore: number;
  hybridScore: number;
  svmScore: number;
}

interface SvmData {
  slope: number;
  intercept: number;
  marginUpperIntercept: number;
  marginLowerIntercept: number;
  weights: { wx: number; wy: number };
  bias: number;
}

interface QueryResponse {
  success: boolean;
  results: RagDocument[];
  answer: string;
  isAiGenerated: boolean;
  retrievalTime: number;
  explanation: string;
  svmData: SvmData | null;
}

export default function RagHubView() {
  const [query, setQuery] = useState("How do I request a substitute teacher for casual leave?");
  const [system, setSystem] = useState<"svm" | "tfidf" | "semantic" | "hybrid">("svm");
  const [alpha, setAlpha] = useState(0.5);
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [hoveredDoc, setHoveredDoc] = useState<RagDocument | null>(null);

  const suggestedQuestions = [
    { label: "Faculty Leave rules", text: "What is the policy for casual leaves and sabbatical plans?" },
    { label: "Substitute compensation", text: "How much is a substitute paid per lecture hour?" },
    { label: "Teaching hour limits", text: "Are there weekly credit workload limits to prevent teacher burnout?" },
    { label: "GPU/HPC Lab bookings", text: "Can I reserve the HPC supercomputer cluster or AI-Lab?" },
    { label: "Grading CIE deadline", text: "What are the rules for CIE continuous marks upload and deadlines?" }
  ];

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          system,
          alpha
        })
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data);
        if (data.results && data.results.length > 0) {
          setActiveDoc(data.results[0].id);
        }
      }
    } catch (error) {
      console.error("RAG search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [system, alpha]);

  // Helper to parse simple markdown bold and bullet points into HTML elements
  const renderFormattedAnswer = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-[14px] font-bold text-slate-900 mt-4 mb-2 first:mt-0">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-[16px] font-bold text-slate-900 mt-4 mb-2 first:mt-0">{line.replace("## ", "")}</h3>;
      }
      // Bullet points
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const content = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 leading-relaxed mb-1.5 pl-1">
            {parseInlineStyles(content)}
          </li>
        );
      }
      // Standard text
      if (line.trim() === "") return <div key={idx} className="h-2" />;
      return <p key={idx} className="text-slate-700 leading-relaxed mb-2">{parseInlineStyles(line)}</p>;
    });
  };

  const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // SVM Graph coordinate calculations for SVG (Dimensions: 400x320)
  const graphWidth = 400;
  const graphHeight = 320;
  const paddingLeft = 40;
  const paddingBottom = 40;
  const plottingWidth = graphWidth - paddingLeft - 15;
  const plottingHeight = graphHeight - paddingBottom - 15;

  const toSvgX = (x: number) => {
    return paddingLeft + (x / 10) * plottingWidth;
  };

  const toSvgY = (y: number) => {
    return plottingHeight - (y / 10) * plottingHeight + 10;
  };

  // Hyperplane Line SVG coordinates
  const getHyperplaneLinePoints = (slope: number, intercept: number) => {
    let x1 = 0;
    let y1 = slope * x1 + intercept;
    let x2 = 10;
    let y2 = slope * x2 + intercept;

    // Constrain inside bounds [0, 10]
    return {
      x1: toSvgX(x1),
      y1: toSvgY(Math.max(0, Math.min(10, y1))),
      x2: toSvgX(x2),
      y2: toSvgY(Math.max(0, Math.min(10, y2)))
    };
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            Academic RAG Intelligence Center
          </h2>
          <p className="text-[12px] text-slate-500 font-medium mt-1">
            Explore institutional leaves, teaching credits, syllabus guidelines, and lab policies using real-time machine learning retrievers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Database size={13} className="text-primary" />
            <span>Corpus: 7 Active Policies</span>
          </div>
        </div>
      </div>

      {/* Suggested chips */}
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(q.text);
              handleSearch(q.text);
            }}
            className="text-[11px] font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <HelpCircle size={12} className="text-indigo-gamify" />
            {q.label}
          </button>
        ))}
      </div>

      {/* Query Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Query the academic rules... (e.g., 'What is the standard payment rate for substitute cover?')"
            className="block w-full pl-10 pr-4 py-3 text-[13px] bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all font-semibold"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="px-6 py-3 bg-primary text-on-primary font-bold text-[13px] rounded-xl shadow-md hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} className="text-amber-conflict" />
          )}
          <span>{loading ? "Optimizing Retrieval..." : "Query Corpus"}</span>
        </button>
      </div>

      {/* Retriever Engine Controller Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters and Vector Space Visualization */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders size={16} className="text-primary" />
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">
                Retriever Model Config
              </h3>
            </div>

            {/* Strategy Selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Retrieval Strategy
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                <button
                  onClick={() => setSystem("svm")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    system === "svm"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-1 font-extrabold">
                    <Scale size={13} className="text-indigo-gamify" />
                    Linear SVM RAG
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-400 leading-normal">Maximum-margin hyperplanes in 2D embedding space.</span>
                </button>

                <button
                  onClick={() => setSystem("hybrid")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    system === "hybrid"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-1 font-extrabold">
                    <Layers size={13} className="text-emerald-optimized" />
                    Hybrid Sparse+Dense
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-400 leading-normal">Calculates balanced weighted index combinations.</span>
                </button>

                <button
                  onClick={() => setSystem("semantic")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    system === "semantic"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-1 font-extrabold">
                    <Sparkles size={13} className="text-amber-conflict" />
                    Concept Semantic
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-400 leading-normal">Matches concept cluster overlap and synonyms.</span>
                </button>

                <button
                  onClick={() => setSystem("tfidf")}
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    system === "tfidf"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-1 font-extrabold">
                    <BookOpen size={13} className="text-slate-500" />
                    TF-IDF Keyword
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-400 leading-normal">Lexical sparse term frequency and cosine math.</span>
                </button>
              </div>
            </div>

            {/* Alpha Slide for Hybrid */}
            {system === "hybrid" && (
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between text-[11px] font-extrabold text-slate-500">
                  <span>TF-IDF (Keyword) Weight</span>
                  <span className="text-primary">Semantic (Theme) Weight</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400">{(1 - alpha).toFixed(1)}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={alpha}
                    onChange={(e) => setAlpha(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-[10px] font-black text-primary">{alpha.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive SVM Hyperplane Visualizer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-indigo-gamify" />
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">
                  SVM separating Decision Space
                </h3>
              </div>
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">2D Projection</span>
            </div>

            {/* SVG Plotting Frame */}
            <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2 border border-slate-800">
              <svg width={graphWidth} height={graphHeight} className="overflow-visible select-none">
                {/* Horizontal and Vertical grid lines */}
                {[2, 4, 6, 8, 10].map((val) => (
                  <g key={val}>
                    {/* Vertical grid lines */}
                    <line
                      x1={toSvgX(val)}
                      y1={toSvgY(0)}
                      x2={toSvgX(val)}
                      y2={toSvgY(10)}
                      stroke="#1e293b"
                      strokeWidth={1}
                      strokeDasharray={val === 10 ? "none" : "2 3"}
                    />
                    {/* Horizontal grid lines */}
                    <line
                      x1={toSvgX(0)}
                      y1={toSvgY(val)}
                      x2={toSvgX(10)}
                      y2={toSvgY(val)}
                      stroke="#1e293b"
                      strokeWidth={1}
                      strokeDasharray={val === 10 ? "none" : "2 3"}
                    />
                    {/* Tick label X */}
                    <text
                      x={toSvgX(val)}
                      y={graphHeight - 20}
                      fill="#64748b"
                      fontSize={9}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {val}
                    </text>
                    {/* Tick label Y */}
                    <text
                      x={20}
                      y={toSvgY(val) + 3}
                      fill="#64748b"
                      fontSize={9}
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {/* Axes lines */}
                <line x1={paddingLeft} y1={toSvgY(0)} x2={paddingLeft} y2={toSvgY(10)} stroke="#475569" strokeWidth={1.5} />
                <line x1={paddingLeft} y1={toSvgY(0)} x2={toSvgX(10)} y2={toSvgY(0)} stroke="#475569" strokeWidth={1.5} />

                {/* Axis Titles */}
                <text x={paddingLeft + plottingWidth / 2} y={graphHeight - 5} fill="#94a3b8" fontSize={9} fontWeight="extrabold" textAnchor="middle">
                  Term Match Relevance (X-Axis)
                </text>
                <text
                  x={10}
                  y={plottingHeight / 2}
                  fill="#94a3b8"
                  fontSize={9}
                  fontWeight="extrabold"
                  textAnchor="middle"
                  transform={`rotate(-90 10 ${plottingHeight / 2})`}
                >
                  Semantic Theme Affinity (Y-Axis)
                </text>

                {/* SVM separating Hyperplane drawing */}
                {response && response.svmData && system === "svm" && (() => {
                  const pts = getHyperplaneLinePoints(response.svmData.slope, response.svmData.intercept);
                  const upperPts = getHyperplaneLinePoints(response.svmData.slope, response.svmData.marginUpperIntercept);
                  const lowerPts = getHyperplaneLinePoints(response.svmData.slope, response.svmData.marginLowerIntercept);

                  return (
                    <g>
                      {/* Highlight separating band */}
                      <path
                        d={`M ${upperPts.x1} ${upperPts.y1} L ${upperPts.x2} ${upperPts.y2} L ${lowerPts.x2} ${lowerPts.y2} L ${lowerPts.x1} ${lowerPts.y1} Z`}
                        fill="rgba(99, 102, 241, 0.08)"
                      />
                      
                      {/* Upper margin limit (f(x) = +1) */}
                      <line x1={upperPts.x1} y1={upperPts.y1} x2={upperPts.x2} y2={upperPts.y2} stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                      <text x={upperPts.x2 - 40} y={upperPts.y2 - 5} fill="#3b82f6" fontSize={8} fontWeight="bold" opacity={0.7}>Margin +1</text>

                      {/* Lower margin limit (f(x) = -1) */}
                      <line x1={lowerPts.x1} y1={lowerPts.y1} x2={lowerPts.x2} y2={lowerPts.y2} stroke="#f43f5e" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
                      <text x={lowerPts.x1 + 10} y={lowerPts.y1 + 12} fill="#f43f5e" fontSize={8} fontWeight="bold" opacity={0.7}>Margin -1</text>

                      {/* Separating Hyperplane line (f(x) = 0) */}
                      <line x1={pts.x1} y1={pts.y1} x2={pts.x2} y2={pts.y2} stroke="#6366f1" strokeWidth={2.5} />
                      <text x={pts.x2 - 80} y={pts.y2 + 12} fill="#6366f1" fontSize={8} fontWeight="black" transform={`rotate(${Math.atan(response.svmData.slope)*180/Math.PI} ${pts.x2 - 80} ${pts.y2 + 12})`}>
                        Decision Hyperplane f(x)=0
                      </text>
                    </g>
                  );
                })()}

                {/* Plot Document Points */}
                {response && response.results && response.results.map((doc) => {
                  const px = toSvgX(doc.x);
                  const py = toSvgY(doc.y);
                  const isRetrieved = doc.score > (system === "svm" ? 0 : 0.1);
                  const isHovered = hoveredDoc?.id === doc.id;

                  return (
                    <g
                      key={doc.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDoc(doc)}
                      onMouseLeave={() => setHoveredDoc(null)}
                      onClick={() => setActiveDoc(doc.id)}
                    >
                      {/* Outer pulse shadow for hovered/active doc */}
                      {(isHovered || activeDoc === doc.id) && (
                        <circle
                          cx={px}
                          cy={py}
                          r={12}
                          fill={isRetrieved ? "rgba(16, 185, 129, 0.3)" : "rgba(225, 29, 72, 0.2)"}
                          className="animate-ping"
                        />
                      )}
                      
                      {/* Document point circle */}
                      <circle
                        cx={px}
                        cy={py}
                        r={isHovered ? 7 : 5.5}
                        fill={isRetrieved ? "#10b981" : "#f43f5e"}
                        stroke="#0f172a"
                        strokeWidth={1.5}
                      />
                      
                      {/* Quick index reference inside node */}
                      <text
                        x={px}
                        y={py - 10}
                        fill="#f8fafc"
                        fontSize={8}
                        fontWeight="black"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow-md"
                      >
                        Doc-{doc.id.replace("doc-", "")}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Float Hover Tooltip overlay inside space */}
              {hoveredDoc && (
                <div className="absolute bottom-16 left-4 right-4 bg-slate-950/95 border border-slate-800 p-3 rounded-lg text-[10.5px] text-slate-300 leading-normal pointer-events-none z-10 space-y-1 shadow-xl">
                  <p className="font-extrabold text-white text-[11px] truncate">
                    Doc-{hoveredDoc.id.replace("doc-", "")}: {hoveredDoc.title}
                  </p>
                  <div className="flex justify-between font-mono text-[9px] text-slate-400">
                    <span>X (Term Match): {hoveredDoc.x}</span>
                    <span>Y (Semantic): {hoveredDoc.y}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-slate-400">
                    <span>Score Metric: {hoveredDoc.score.toFixed(3)}</span>
                    <span className="font-bold text-indigo-300">
                      Margin Pos: {system === "svm" ? (hoveredDoc.svmScore >= 0 ? "Positive Side (+)" : "Negative Side (-)") : "Retrieved"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold px-1 select-none">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Positive Zone (Retrieved Context)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Negative Zone (Non-Retrieved)
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Generated Answer & Cited Context Document Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Answer Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2 select-none">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-optimized shrink-0" />
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Synthesized Answer Output
                  </span>
                </div>
                
                {response && (
                  <span className={`text-[9.5px] font-extrabold px-2 py-1 rounded flex items-center gap-1 ${
                    response.isAiGenerated 
                      ? "bg-indigo-50 text-indigo-gamify" 
                      : "bg-amber-50 text-amber-800"
                  }`}>
                    <Sparkles size={11} className={response.isAiGenerated ? "animate-pulse" : ""} />
                    {response.isAiGenerated ? "Gemini AI-Generated" : "Local RAG Compiler"}
                  </span>
                )}
              </div>

              {/* Rendered markdown body */}
              <div className="text-[12.5px] leading-relaxed text-slate-800 space-y-2">
                {loading ? (
                  <div className="space-y-3 py-6 select-none">
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6" />
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
                    <p className="text-[11px] text-slate-400 italic font-semibold text-center mt-4">Invoking retrieval matrices & compiling answer vectors...</p>
                  </div>
                ) : response ? (
                  <div className="prose max-w-none">
                    {renderFormattedAnswer(response.answer)}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-center py-10 select-none">Submit a query or click one of the preset prompts above to explore.</p>
                )}
              </div>
            </div>

            {/* Response metadata footprint */}
            {response && !loading && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold select-none flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Retrieval: {response.retrievalTime} ms
                </span>
                <span className="italic truncate max-w-xs">{response.explanation}</span>
              </div>
            )}
          </div>

          {/* Context Document cards citation list */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <BookOpen size={13} className="text-slate-500" />
              Retrieved Context Documents (Vector Neighborhood)
            </h4>

            {loading ? (
              <div className="space-y-2">
                <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : response && response.results ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                {response.results.slice(0, 4).map((doc) => {
                  const isActive = activeDoc === doc.id;
                  const scorePercentage = Math.round(doc.score * 100);

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDoc(doc.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? "border-primary bg-white shadow-md ring-1 ring-primary/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                            Doc-{doc.id.replace("doc-", "")}
                          </span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            doc.score > 0.5 
                              ? "bg-emerald-50 text-emerald-700" 
                              : doc.score > 0.1 
                              ? "bg-slate-100 text-slate-700" 
                              : "bg-rose-50 text-rose-700"
                          }`}>
                            Score: {system === "svm" ? doc.score.toFixed(2) : `${scorePercentage}%`}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 mt-2 leading-snug">
                          {doc.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {doc.content}
                        </p>
                      </div>

                      {/* Expanded View Modal toggle button */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-primary uppercase tracking-wide">
                        <span>Category: {doc.category}</span>
                        <span className="flex items-center gap-0.5 hover:underline">
                          Read Full
                          <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

        </div>
      </div>

      {/* Selected Policy Document Details Modal view (collapsible) */}
      {activeDoc && response && response.results && (() => {
        const doc = response.results.find(d => d.id === activeDoc);
        if (!doc) return null;
        return (
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-3 mt-6">
            <div className="flex items-center justify-between select-none flex-wrap gap-2">
              <span className="text-[10px] font-extrabold text-indigo-gamify uppercase tracking-wider bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full">
                Active Policy: Doc-{doc.id.replace("doc-", "")} ({doc.category})
              </span>
              <button
                onClick={() => setActiveDoc(null)}
                className="text-[11px] font-black text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0"
              >
                Close Details
              </button>
            </div>
            <h3 className="text-base font-black text-slate-900">{doc.title}</h3>
            <p className="text-[12.5px] leading-relaxed text-slate-700 font-medium">
              {doc.content}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-slate-500">
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block font-bold text-[9px] text-slate-400">TF-IDF RAW</span>
                {doc.tfidfScore.toFixed(4)}
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block font-bold text-[9px] text-slate-400">SEMANTIC RAW</span>
                {doc.semanticScore.toFixed(4)}
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block font-bold text-[9px] text-slate-400">SVM DECISION</span>
                {doc.svmScore.toFixed(4)}
              </div>
              <div className="bg-white p-2 rounded border border-slate-150">
                <span className="block font-bold text-[9px] text-slate-400">GRID POSITION</span>
                ({doc.x}, {doc.y})
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
