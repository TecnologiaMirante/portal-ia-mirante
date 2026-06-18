/**
 * ToolPreview — unique animated preview for each AI tool type
 * Types: "chat" | "code" | "video" | "audio" | "music" | "workflow"
 */
import { Play, Mic, Code2, SkipForward, Zap } from "lucide-react";

/* ── Shared typing dots ─────────────────────────────────── */
function TypingDots({ color }) {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 150, 300].map((d) => (
        <div
          key={d}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{
            backgroundColor: color ?? "oklch(0.55 0.05 264)",
            animationDelay: `${d}ms`,
            animationDuration: "0.9s",
          }}
        />
      ))}
    </div>
  );
}

/* ── 1. CHAT preview (ChatGPT, Claude, Gemini) ──────────── */
export function ChatPreview({ tool }) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-border bg-background/60 backdrop-blur-sm">
      {/* Header bar */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b border-border ${tool.bgClass}`}>
        <div
          className="w-6 h-6 rounded-lg border-2 flex items-center justify-center text-[8px] font-black shrink-0 shadow-sm"
          style={{ backgroundColor: `${tool.color}22`, borderColor: `${tool.color}44`, color: tool.color }}
        >
          {tool.initials}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-bold leading-none" style={{ color: tool.color }}>{tool.name}</span>
          <span className="text-[8px] text-muted-foreground leading-none mt-0.5">{tool.provider}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-muted-foreground">online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col justify-end gap-1.5 p-2.5 overflow-hidden">
        {/* User message */}
        <div className="flex justify-end">
          <div
            className="text-[10px] rounded-2xl rounded-tr-sm px-3 py-1.5 max-w-[80%] leading-relaxed shadow-sm text-white"
            style={{ background: `linear-gradient(135deg, ${tool.color}, ${tool.color}bb)` }}
          >
            {tool.sampleChat?.user}
          </div>
        </div>

        {/* AI response */}
        <div className="flex items-end gap-1.5">
          <div
            className="w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center text-[6px] font-black shadow-sm"
            style={{ backgroundColor: `${tool.color}18`, borderColor: `${tool.color}40`, color: tool.color }}
          >
            {tool.initials[0]}
          </div>
          <div className="bg-card border border-border text-foreground/80 text-[10px] rounded-2xl rounded-tl-sm px-3 py-1.5 max-w-[80%] leading-relaxed shadow-sm line-clamp-2">
            {tool.sampleChat?.ai}
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex items-end gap-1.5">
          <div
            className="w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center text-[6px] font-black"
            style={{ backgroundColor: `${tool.color}18`, borderColor: `${tool.color}40`, color: tool.color }}
          >
            {tool.initials[0]}
          </div>
          <div className="bg-card border border-border rounded-2xl rounded-tl-sm shadow-sm">
            <TypingDots color={tool.color} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 2. CODE preview (Google AI Studio) ─────────────────── */
const CODE_SEGMENTS = {
  comment: { color: "#6a9955", italic: true },
  import:  { color: "#569cd6" },
  assign:  { color: "#9cdcfe" },
  call:    { color: "#dcdcaa" },
  output:  { color: "#4ec9b0" },
  blank:   { color: "transparent" },
  string:  { color: "#ce9178" },
  keyword: { color: "#c586c0" },
};

export function CodePreview({ tool }) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden border border-[#30363d] bg-[#0d1117]">
      {/* Terminal titlebar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] hover:brightness-90" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] hover:brightness-90" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] hover:brightness-90" />
        <div className="flex items-center gap-1.5 ml-auto">
          <Code2 className="w-3 h-3 text-[#8b949e]" />
          <span className="text-[9px] text-[#8b949e] font-mono">main.py</span>
        </div>
      </div>

      {/* Code body */}
      <div className="flex-1 p-3 font-mono text-[10px] leading-[1.8] overflow-hidden">
        {tool.sampleCode?.map((line, i) => {
          const seg = CODE_SEGMENTS[line.type] ?? CODE_SEGMENTS.assign;
          return (
            <div key={i} className="flex gap-3 group">
              <span className="text-[#3d444d] select-none w-3 shrink-0 text-right group-hover:text-[#8b949e] transition-colors">
                {line.type !== "blank" ? i + 1 : ""}
              </span>
              <span
                style={{
                  color: seg.color,
                  fontStyle: seg.italic ? "italic" : "normal",
                }}
              >
                {line.text}
              </span>
            </div>
          );
        })}

        {/* Blinking cursor */}
        <div className="flex gap-3 mt-0.5">
          <span className="text-[#3d444d] w-3 shrink-0 text-right">{(tool.sampleCode?.length ?? 0) + 1}</span>
          <span className="text-[#c9d1d9] animate-pulse">▌</span>
        </div>
      </div>
    </div>
  );
}

/* ── 3. VIDEO preview (HeyGen) ──────────────────────────── */
export function VideoPreview() {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-violet-500/20">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#2d0b5e] to-[#0f0a2e]" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(167,139,250,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.5) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Glow halo behind avatar */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
          animation: "float-glow 3s ease-in-out infinite",
        }}
      />

      {/* Avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Head */}
          <div
            className="relative w-16 h-16 rounded-full shadow-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #c4a8e8, #8b5cf6)",
              boxShadow: "0 0 20px rgba(139,92,246,0.45), inset 0 2px 4px rgba(255,255,255,0.2)",
            }}
          >
            {/* Eyes */}
            <div className="absolute top-[28%] left-[24%] w-2.5 h-2.5 rounded-full bg-[#2d0b5e]/70" />
            <div className="absolute top-[28%] right-[24%] w-2.5 h-2.5 rounded-full bg-[#2d0b5e]/70" />
            {/* Mouth */}
            <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full bg-[#2d0b5e]/40" />
          </div>
          {/* Shoulders */}
          <div
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-28 h-14 rounded-t-[50%]"
            style={{ background: "linear-gradient(to bottom, rgba(139,92,246,0.35), transparent)" }}
          />
        </div>
      </div>

      {/* Top-left: language badges */}
      <div className="absolute top-2.5 left-2.5 flex gap-1">
        {["PT", "EN", "ES", "DE"].map((l) => (
          <span
            key={l}
            className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-white/10 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.65)" }}
          >
            {l}
          </span>
        ))}
      </div>

      {/* Top-right: REC badge */}
      <div
        className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 border border-white/10 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.5)" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] font-semibold text-white/70">REC</span>
      </div>

      {/* Bottom: timeline player */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 border border-white/10 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <Play className="w-3 h-3 fill-white text-white shrink-0" />
          <div className="flex-1 h-0.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "42%",
                background: "linear-gradient(90deg, #a78bfa, #8b5cf6)",
                animation: "progress-pulse 2s ease-in-out infinite",
              }}
            />
          </div>
          <span className="text-[8px] text-white/50 tabular-nums shrink-0">0:24 / 0:58</span>
        </div>
      </div>
    </div>
  );
}

/* ── 4. AUDIO waveform preview (ElevenLabs) ─────────────── */
const WAVE_HEIGHTS = [22, 55, 72, 38, 90, 55, 42, 78, 60, 92, 30, 68, 84, 48, 74, 35, 80, 52, 44, 86, 58, 32, 70, 46, 28];

export function AudioPreview({ tool }) {
  return (
    <div
      className="w-full h-full flex flex-col gap-2 rounded-xl overflow-hidden border border-border p-3"
      style={{ background: `linear-gradient(145deg, ${tool.color}08, ${tool.color}04)` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: `${tool.color}22`, color: tool.color }}
          >
            <Mic className="w-3 h-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold leading-none" style={{ color: tool.color }}>Voice Synthesis</span>
            <span className="text-[8px] text-muted-foreground leading-none mt-0.5">ElevenLabs v2</span>
          </div>
        </div>
        <div className="flex gap-1">
          {["PT-BR", "EN-US"].map((l) => (
            <span
              key={l}
              className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full border"
              style={{
                background: `${tool.color}18`,
                borderColor: `${tool.color}40`,
                color: tool.color,
              }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Waveform — two symmetrical halves */}
      <div className="flex-1 flex flex-col justify-center gap-px overflow-hidden">
        {/* Top half */}
        <div className="flex items-end gap-px h-9">
          {WAVE_HEIGHTS.map((h, i) => (
            <div
              key={`top-${i}`}
              className="flex-1 rounded-t-full"
              style={{
                height: `${h}%`,
                background: i < 10
                  ? `linear-gradient(to top, ${tool.color}, ${tool.color}88)`
                  : `${tool.color}44`,
                animation: `equalizer ${0.65 + (i % 7) * 0.11}s ease-in-out ${(i * 0.035).toFixed(2)}s infinite alternate`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
        {/* Mirror / bottom half */}
        <div className="flex items-start gap-px h-9">
          {WAVE_HEIGHTS.map((h, i) => (
            <div
              key={`bot-${i}`}
              className="flex-1 rounded-b-full"
              style={{
                height: `${h * 0.4}%`,
                background: i < 10 ? `${tool.color}40` : `${tool.color}18`,
                animation: `equalizer ${0.65 + (i % 7) * 0.11}s ease-in-out ${(i * 0.035).toFixed(2)}s infinite alternate`,
                transformOrigin: "top",
              }}
            />
          ))}
        </div>
      </div>

      {/* Player controls */}
      <div className="flex items-center gap-2">
        <button
          className="w-7 h-7 rounded-full border flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: `${tool.color}22`, borderColor: `${tool.color}44`, color: tool.color }}
        >
          <Play className="w-3 h-3 fill-current ml-0.5" />
        </button>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${tool.color}20` }}>
          <div
            className="h-full rounded-full"
            style={{
              width: "38%",
              background: `linear-gradient(90deg, ${tool.color}, ${tool.color}aa)`,
              animation: "progress-pulse 2.5s ease-in-out infinite",
            }}
          />
        </div>
        <span className="text-[9px] text-muted-foreground tabular-nums shrink-0">0:12 / 0:32</span>
      </div>
    </div>
  );
}

/* ── 5. MUSIC preview (Suno) ────────────────────────────── */
const MUSIC_BARS = [40, 72, 55, 88, 45, 78, 62, 92, 50, 82, 36, 66, 56, 76, 46, 90, 62, 72, 42, 80, 56, 66, 48, 84, 38];

// eslint-disable-next-line no-unused-vars
export function MusicPreview({ tool }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-rose-800/30">
      {/* Background layers */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a0010, #3d0020, #1a001a, #0a000f)" }} />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(244,63,94,0.3) 0%, transparent 50%)" }} />

      {/* Vinyl record (right side) */}
      <div
        className="absolute right-2 top-1/2 -translate-y-1/2 w-[84px] h-[84px] rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #1a0010, #3d0028, #1a0010, #4a0030, #1a0010)",
          boxShadow: "0 0 16px rgba(244,63,94,0.25), inset 0 0 8px rgba(0,0,0,0.5)",
          animation: "spin 5s linear infinite",
          border: "3px solid rgba(244,63,94,0.25)",
        }}
      >
        {/* Inner ring */}
        <div
          className="absolute inset-3 rounded-full flex items-center justify-center"
          style={{ background: "radial-gradient(circle, #3d0028, #0a000f)", border: "1.5px solid rgba(244,63,94,0.3)" }}
        >
          {/* Center hole */}
          <div className="w-3 h-3 rounded-full" style={{ background: "#f43f5e55", border: "1px solid rgba(244,63,94,0.4)" }} />
        </div>

        {/* Groove rings */}
        {[28, 22, 16].map((s) => (
          <div
            key={s}
            className="absolute rounded-full border border-rose-900/40"
            style={{ inset: `${s}px` }}
          />
        ))}
      </div>

      {/* Tonearm */}
      <div
        className="absolute"
        style={{ top: "14px", right: "20px", width: "2px", height: "34px", background: "linear-gradient(to bottom, rgba(244,63,94,0.5), transparent)", borderRadius: "1px", transformOrigin: "top", transform: "rotate(-20deg)" }}
      />

      {/* Left content */}
      <div className="absolute inset-0 flex flex-col justify-between p-3 pr-[100px]">
        {/* Track info */}
        <div>
          <div
            className="text-[8px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: "rgba(244,63,94,0.7)" }}
          >
            ♪ Gerando trilha...
          </div>
          <div className="text-[11px] font-bold text-white/90 leading-tight">Trilha Institucional</div>
          <div className="text-[9px] mt-0.5" style={{ color: "rgba(244,63,94,0.6)" }}>Mirante · Pop Corporativo · 2025</div>
        </div>

        {/* Mini waveform */}
        <div className="flex items-center gap-px h-7">
          {MUSIC_BARS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${h}%`,
                background: i < 10
                  ? `linear-gradient(to top, #f43f5e, #fb7185)`
                  : "rgba(244,63,94,0.35)",
                animation: `equalizer ${0.55 + (i % 6) * 0.13}s ease-in-out ${(i * 0.035).toFixed(2)}s infinite alternate`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
            style={{ background: "rgba(244,63,94,0.2)", borderColor: "rgba(244,63,94,0.3)" }}
          >
            <Play className="w-3 h-3 fill-rose-300 text-rose-300 ml-0.5" />
          </button>
          <button className="p-0.5 opacity-40">
            <SkipForward className="w-3 h-3 text-rose-400" />
          </button>
          <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(244,63,94,0.15)" }}>
            <div
              className="w-1/3 h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #f43f5e, #fb7185)", animation: "progress-pulse 2s ease-in-out infinite" }}
            />
          </div>
          <span className="text-[8px] tabular-nums" style={{ color: "rgba(255,255,255,0.35)" }}>1:15</span>
        </div>
      </div>
    </div>
  );
}

/* ── 6. WORKFLOW preview (Flow) ─────────────────────────── */
const FLOW_NODES = [
  { id: "A", x: 12, y: 50, label: "Input",  icon: "→" },
  { id: "B", x: 35, y: 22, label: "IA",     icon: "✦" },
  { id: "C", x: 35, y: 78, label: "Filtro", icon: "⚙" },
  { id: "D", x: 60, y: 22, label: "Gera",   icon: "◈" },
  { id: "E", x: 60, y: 78, label: "Revisa", icon: "✔" },
  { id: "F", x: 88, y: 50, label: "Output", icon: "★" },
];
const FLOW_EDGES = [
  ["A", "B"], ["A", "C"],
  ["B", "D"], ["C", "E"],
  ["D", "F"], ["E", "F"],
];

export function WorkflowPreview({ tool }) {
  const nodeMap = Object.fromEntries(FLOW_NODES.map((n) => [n.id, n]));

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden border border-border flex flex-col gap-1.5 p-3"
      style={{ background: `linear-gradient(145deg, ${tool.color}06, ${tool.color}03)` }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold" style={{ color: tool.color }}>
            Fluxo ativo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-muted-foreground">3 processos</span>
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold border"
            style={{ background: `${tool.color}18`, borderColor: `${tool.color}40`, color: tool.color }}
          >
            <Zap className="w-2.5 h-2.5" />
            Live
          </div>
        </div>
      </div>

      {/* SVG graph */}
      <div className="flex-1 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
              <path d="M0,0 L4,2 L0,4 Z" fill="rgba(6,182,212,0.5)" />
            </marker>
            <filter id="node-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {FLOW_EDGES.map(([a, b]) => {
            const na = nodeMap[a], nb = nodeMap[b];
            return (
              <line
                key={`${a}-${b}`}
                x1={na.x + 6} y1={na.y} x2={nb.x - 6} y2={nb.y}
                stroke="rgba(6,182,212,0.2)"
                strokeWidth="0.7"
                strokeDasharray="2.5 2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Animated flow dots — all edges */}
          {FLOW_EDGES.map(([a, b], i) => {
            const na = nodeMap[a], nb = nodeMap[b];
            return (
              <circle key={`dot-${i}`} r="1.4" fill={tool.color} opacity="0.85">
                <animateMotion
                  dur={`${1.4 + i * 0.35}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.25}s`}
                  path={`M${na.x + 6},${na.y} L${nb.x - 6},${nb.y}`}
                />
              </circle>
            );
          })}

          {/* Node glow halos */}
          {FLOW_NODES.map((n) => (
            <circle
              key={`halo-${n.id}`}
              cx={n.x} cy={n.y} r="9"
              fill={`${tool.color}08`}
              stroke={`${tool.color}20`}
              strokeWidth="0"
            />
          ))}

          {/* Nodes */}
          {FLOW_NODES.map((n, idx) => (
            <g key={n.id} filter="url(#node-glow)">
              {/* Outer ring */}
              <circle
                cx={n.x} cy={n.y} r="7.5"
                fill={idx === 0 || idx === FLOW_NODES.length - 1
                  ? `${tool.color}28`
                  : `${tool.color}14`}
                stroke={tool.color}
                strokeWidth={idx === 0 || idx === FLOW_NODES.length - 1 ? "1" : "0.6"}
                strokeOpacity={idx === 0 || idx === FLOW_NODES.length - 1 ? "0.7" : "0.4"}
              />
              {/* Label */}
              <text
                x={n.x} y={n.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="3.8"
                fill={tool.color}
                fillOpacity="0.9"
                fontWeight="700"
                fontFamily="monospace"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Footer metrics */}
      <div className="flex items-center gap-3 pt-1 border-t border-border/50">
        {[
          { label: "Execuções", value: "142" },
          { label: "Sucesso", value: "99.3%" },
          { label: "Latência", value: "1.2s" },
        ].map((m) => (
          <div key={m.label} className="flex flex-col items-center flex-1">
            <span className="text-[10px] font-bold" style={{ color: tool.color }}>{m.value}</span>
            <span className="text-[7px] text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 7. VIDEO-GEN preview (Google Flow) ─────────────────── */
const FLOW_FRAMES = [
  { label: "Frame 01", progress: 100, done: true  },
  { label: "Frame 02", progress: 100, done: true  },
  { label: "Frame 03", progress: 68,  done: false },
  { label: "Frame 04", progress: 0,   done: false },
];

export function VideoGenPreview({ tool }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-cyan-500/20">
      {/* Deep dark background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #010e18, #031a2b, #010e18)" }} />
      {/* Subtle scanlines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6,182,212,0.5) 2px, rgba(6,182,212,0.5) 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* Cinematic frame area */}
      <div
        className="absolute inset-x-2.5 top-2.5"
        style={{ height: "60%", borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(6,182,212,0.25)" }}
      >
        {/* Fake rendered frame */}
        <div className="w-full h-full" style={{ background: "linear-gradient(160deg, #0a1628, #1a3a5c, #0f2340)" }}>
          {/* City light blobs */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{ background: "linear-gradient(to top, rgba(6,182,212,0.12), transparent)" }} />
          <div className="absolute bottom-2 left-4 w-8 h-8 rounded-full"
            style={{ background: "rgba(6,182,212,0.18)", filter: "blur(8px)" }} />
          <div className="absolute bottom-2 right-6 w-6 h-6 rounded-full"
            style={{ background: "rgba(96,165,250,0.15)", filter: "blur(6px)" }} />
          <div className="absolute bottom-1 left-1/2 w-12 h-3 rounded-full"
            style={{ background: "rgba(6,182,212,0.10)", filter: "blur(10px)" }} />
          {/* Stars */}
          {[12, 28, 45, 60, 72, 84, 38, 55].map((x, i) => (
            <div key={i} className="absolute w-px h-px rounded-full bg-white/60"
              style={{ left: `${x}%`, top: `${10 + (i % 4) * 12}%` }} />
          ))}
        </div>
        {/* Letterbox bars */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-black/70" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/70" />
        {/* Frame counter */}
        <div className="absolute top-2.5 right-2.5 text-[8px] font-mono text-cyan-400/70">03/04</div>
      </div>

      {/* Prompt pill */}
      <div
        className="absolute left-2.5 right-2.5 flex items-start gap-1.5 px-2 py-1.5 rounded-lg border"
        style={{ top: "calc(60% + 16px)", background: "rgba(6,182,212,0.08)", borderColor: "rgba(6,182,212,0.2)" }}
      >
        <span className="text-[8px] font-bold text-cyan-400 shrink-0 mt-px">✦</span>
        <span className="text-[8.5px] text-white/50 leading-relaxed line-clamp-2">
          {tool.samplePrompt}
        </span>
      </div>

      {/* Generation progress rows */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col gap-1">
        {FLOW_FRAMES.map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-[7.5px] font-mono text-white/30 w-12 shrink-0">{f.label}</span>
            <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(6,182,212,0.12)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${f.progress}%`,
                  background: f.done
                    ? "linear-gradient(90deg, #06b6d4, #22d3ee)"
                    : "linear-gradient(90deg, #06b6d4aa, #06b6d460)",
                  animation: !f.done && f.progress > 0 ? "progress-pulse 1.5s ease-in-out infinite" : "none",
                }}
              />
            </div>
            <span className="text-[7.5px] font-mono shrink-0" style={{ color: f.done ? "#06b6d4" : "rgba(255,255,255,0.25)" }}>
              {f.done ? "✓" : `${f.progress}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Dispatcher ─────────────────────────────────────────── */
export function ToolPreview({ tool }) {
  const type = tool.previewType;
  if (type === "chat")      return <ChatPreview tool={tool} />;
  if (type === "code")      return <CodePreview tool={tool} />;
  if (type === "video")     return <VideoPreview />;
  if (type === "audio")     return <AudioPreview tool={tool} />;
  if (type === "music")     return <MusicPreview tool={tool} />;
  if (type === "workflow")  return <WorkflowPreview tool={tool} />;
  if (type === "video-gen") return <VideoGenPreview tool={tool} />;
  return null;
}
