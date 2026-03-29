import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.page{min-height:100vh;padding:22px;background:radial-gradient(circle at top left,rgba(255,167,102,.28),transparent 24%),radial-gradient(circle at 85% 10%,rgba(67,186,169,.2),transparent 20%),linear-gradient(180deg,#f6efe2 0%,#eee4d0 100%);font-family:'IBM Plex Sans',sans-serif;color:#14302b}
.shell{max-width:1180px;margin:0 auto}
.hero{border-radius:36px;padding:28px;background:linear-gradient(135deg,#14302b,#215d53);color:#eff6f4;box-shadow:0 28px 60px rgba(20,48,43,.16);margin-bottom:20px}
.hero-top{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;flex-wrap:wrap}
.hero-title{font-family:'Sora',sans-serif;font-size:clamp(1.9rem,4vw,3.1rem);line-height:1.05;margin-bottom:10px}
.hero-copy{max-width:620px;line-height:1.72;color:rgba(239,246,244,.8)}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap}
.hero-btn,.hero-alt{border:none;border-radius:20px;padding:14px 18px;font-weight:800;cursor:pointer}
.hero-btn{background:#f5efe2;color:#14302b}
.hero-alt{background:rgba(255,255,255,.08);color:#eff6f4}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:18px;margin-top:22px}
.meter{border-radius:28px;padding:22px;background:rgba(255,255,255,.08)}
.meter-top{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);font-size:.86rem;font-weight:700}
.score{display:grid;grid-template-columns:150px 1fr;gap:18px;align-items:center}
.ring{width:150px;height:150px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--ring-color) calc(var(--pct) * 1%), rgba(255,255,255,.12) 0)}
.ring-inner{width:118px;height:118px;border-radius:50%;background:#14302b;display:grid;place-items:center;text-align:center}
.ring-inner strong{display:block;font-family:'Sora',sans-serif;font-size:2rem}
.ring-inner span{font-size:.82rem;color:rgba(239,246,244,.72)}
.insight h3{font-family:'Sora',sans-serif;font-size:1.45rem;margin-bottom:8px}
.insight p{line-height:1.7;color:rgba(239,246,244,.8);margin-bottom:12px}
.insight-tags{display:flex;gap:10px;flex-wrap:wrap}
.insight-tags span{border-radius:999px;padding:8px 12px;background:rgba(255,255,255,.08);font-size:.86rem}
.mini-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.mini-card{border-radius:24px;padding:18px;background:rgba(255,255,255,.08)}
.mini-card strong{display:block;font-family:'Sora',sans-serif;font-size:1.5rem;margin-bottom:6px}
.mini-card span{display:block;color:rgba(239,246,244,.74);line-height:1.55;font-size:.92rem}
.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:20px}
.card{border-radius:32px;padding:24px;background:rgba(255,255,255,.7);border:1px solid rgba(20,48,43,.08);box-shadow:0 22px 48px rgba(20,48,43,.08)}
.card-title{font-family:'Sora',sans-serif;font-size:1.35rem;margin-bottom:8px}
.card-copy{line-height:1.68;color:rgba(20,48,43,.7);margin-bottom:18px}
.missions{display:grid;gap:14px}
.mission{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding:16px;border-radius:24px;background:#fff9f2;border:1px solid rgba(20,48,43,.06);cursor:pointer;transition:.18s ease}
.mission:hover{transform:translateY(-2px)}
.mission.done{background:#ebf5f2}
.mission-icon{width:52px;height:52px;border-radius:18px;background:#14302b;color:#fff;display:grid;place-items:center;font-size:1.4rem}
.mission.done .mission-icon{background:#2f7f74}
.mission strong{display:block;font-size:1rem;margin-bottom:5px}
.mission p{line-height:1.62;color:rgba(20,48,43,.72);font-size:.93rem}
.meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
.meta span{display:inline-flex;padding:7px 10px;border-radius:999px;background:#f2eee4;color:#48655f;font-size:.8rem;font-weight:700}
.toggle{border:none;border-radius:16px;padding:11px 14px;background:rgba(20,48,43,.08);font-weight:800;color:#14302b}
.mission.done .toggle{background:#14302b;color:#fff}
.side-stack{display:grid;gap:20px}
.history-bars{display:flex;gap:12px;align-items:flex-end;height:170px}
.bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px}
.bar{width:100%;max-width:42px;border-radius:18px 18px 10px 10px;background:linear-gradient(180deg,#2f7f74,#14302b)}
.bar-wrap span{font-size:.82rem;color:rgba(20,48,43,.58)}
.empty{border-radius:24px;padding:22px;background:#f7f2e8;color:rgba(20,48,43,.68);line-height:1.7}
.quest-list{display:grid;gap:12px}
.quest{border-radius:24px;padding:16px;background:#fff8ef;border:1px solid rgba(20,48,43,.06)}
.quest strong{display:block;margin-bottom:6px}
.quest span{display:block;line-height:1.62;color:rgba(20,48,43,.7)}
.badge-row{display:flex;gap:10px;flex-wrap:wrap}
.badge{border-radius:999px;padding:10px 14px;background:#14302b;color:#eff6f4;font-size:.85rem;font-weight:700}
.camera-note{margin-top:14px;padding:14px 16px;border-radius:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.08);line-height:1.65;color:rgba(239,246,244,.82)}
@media (max-width:980px){.hero-grid,.grid,.score{grid-template-columns:1fr}}
@media (max-width:620px){.mini-grid{grid-template-columns:1fr}.mission{grid-template-columns:auto 1fr}.toggle{grid-column:1 / -1}}
`;

const API = "http://127.0.0.1:8000";
const LEVEL_UI = {
  Low: { title: "Steady and connected", color: "#2f7f74", story: "Your system looks more regulated today. This is a good moment to maintain connection with small caring habits before stress builds quietly." },
  Medium: { title: "Carrying a real load", color: "#dc8b38", story: "Stress is present enough that your patience, tone, or availability may shift. Your plan should focus on communication clarity and short resets." },
  High: { title: "Needs repair and recovery", color: "#bc4f31", story: "Your system looks overloaded. Prioritize grounding, emotional safety, and very small relationship-support actions rather than forcing productivity." },
};

function readProgressState() {
  const raw = localStorage.getItem("mindful_bonds_progress");
  if (!raw) return { points: 0, streak: 0, completedToday: 0, lastDate: "", badges: [] };
  try { return JSON.parse(raw); } catch { return { points: 0, streak: 0, completedToday: 0, lastDate: "", badges: [] }; }
}

function sameDate(a, b) {
  return a && b && a === b;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("user") || "guest@example.com";
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [done, setDone] = useState([]);
  const [progressState, setProgressState] = useState(() => readProgressState());

  const fetchTasks = useCallback((level, personalityType) => {
    axios.post(`${API}/questions/ai-tasks`, {
      email,
      stress_level: level,
      personality_type: personalityType || "Balanced Individual",
    })
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => {
        axios.get(`${API}/stress/tasks/${level}`, { params: { personality_type: personalityType || "Balanced Individual" } })
          .then((res) => setTasks(res.data.tasks || []))
          .catch(() => setTasks([]));
      });
  }, [email]);

  useEffect(() => {
    const saved = localStorage.getItem("stress_result");
    if (saved) {
      const parsed = JSON.parse(saved);
      setResult(parsed);
      if (parsed.ai_tasks?.length) setTasks(parsed.ai_tasks);
      else fetchTasks(parsed.stress_level, parsed.personality_type);
    } else {
      axios.get(`${API}/stress/level`).then((res) => {
        const fallback = { stress_level: res.data.level, percentage: 45, message: "A fresh check-in will give you a fuller picture.", personality_type: "Balanced Individual" };
        setResult(fallback);
        fetchTasks(fallback.stress_level, fallback.personality_type);
      });
    }

    axios.get(`${API}/stress/history/${email}`)
      .then((res) => setHistory(res.data.history || []))
      .catch(() => setHistory([]));
  }, [email, fetchTasks]);

  useEffect(() => {
    setDone(tasks.map(() => false));
  }, [tasks]);

  function toggleDone(index) {
    setDone((prev) => {
      const next = [...prev];
      const wasDone = next[index];
      next[index] = !wasDone;
      if (!wasDone) {
        const today = new Date().toISOString().slice(0, 10);
        const previous = readProgressState();
        const sameDay = sameDate(previous.lastDate, today);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const streak = sameDay ? previous.streak : previous.lastDate === yesterday ? previous.streak + 1 : 1;
        const completedToday = sameDay ? previous.completedToday + 1 : 1;
        const points = previous.points + 15;
        const badges = [...new Set([
          ...previous.badges,
          completedToday >= 1 ? "First care action" : null,
          completedToday >= 3 ? "Daily repair streak" : null,
          streak >= 3 ? "3-day calm builder" : null,
        ].filter(Boolean))];
        const updated = { points, streak, completedToday, lastDate: today, badges };
        localStorage.setItem("mindful_bonds_progress", JSON.stringify(updated));
        setProgressState(updated);
      }
      return next;
    });
  }

  const level = result?.stress_level || "Low";
  const pct = result?.percentage || 0;
  const personalityType = result?.personality_type || "Balanced Individual";
  const cameraAssisted = Boolean(result?.camera_assisted);
  const dominantExpression = result?.dominant_expression || "steady";
  const levelUi = LEVEL_UI[level] || LEVEL_UI.Low;
  const completedCount = done.filter(Boolean).length;

  const missionSummary = useMemo(() => {
    if (level === "High") return "Start with emotional safety, slower replies, and very small reconnection rituals.";
    if (level === "Medium") return "Focus on clarity, micro-recovery, and reducing misunderstanding before it grows.";
    return "Protect the calm by maintaining connection, appreciation, and light repair habits.";
  }, [level]);

  const questCards = useMemo(() => [
    { title: "1 mindful pause", text: "Take one intentional pause before replying to a difficult message or conversation today." },
    { title: "1 relationship action", text: "Complete one mission that improves emotional safety, connection, or repair." },
    { title: "1 honest check-in", text: "Tell one person how you actually feel in a simple, low-pressure way." },
  ], []);

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="shell">
          <section className="hero">
            <div className="hero-top">
              <div>
                <div className="hero-title">Your mindful stress dashboard</div>
                <div className="hero-copy">A live view of how stress may be shaping your energy, tone, and relationships today, with a care plan that focuses on real repair instead of generic motivation.</div>
              </div>
              <div className="hero-actions">
                <button className="hero-btn" onClick={() => navigate("/questions")}>Retake check-in</button>
                <button className="hero-alt" onClick={() => window.location.reload()}>Refresh missions</button>
              </div>
            </div>

            <div className="hero-grid">
              <div className="meter">
                <div className="meter-top">
                  <span className="pill">Stress level: {level}</span>
                  <span className="pill">Personality: {personalityType}</span>
                  <span className="pill">{cameraAssisted ? "Camera-assisted" : "Self-report only"}</span>
                </div>
                <div className="score">
                  <div className="ring" style={{ "--pct": pct, "--ring-color": levelUi.color }}>
                    <div className="ring-inner"><div><strong>{pct}%</strong><span>stress load</span></div></div>
                  </div>
                  <div className="insight">
                    <h3>{levelUi.title}</h3>
                    <p>{result?.message || levelUi.story}</p>
                    <div className="insight-tags">
                      <span>{missionSummary}</span>
                      <span>{email}</span>
                    </div>
                    {cameraAssisted && (
                      <div className="camera-note">
                        Camera insight added a lightweight facial-expression summary to reduce false assumptions. Dominant read: {dominantExpression}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mini-grid">
                <div className="mini-card"><strong>{progressState.points}</strong><span>Care points earned from completing mindful relationship actions.</span></div>
                <div className="mini-card"><strong>{progressState.streak}</strong><span>Current streak of days where you completed at least one care action.</span></div>
                <div className="mini-card"><strong>{completedCount}/{tasks.length}</strong><span>Daily missions completed so far in this current care plan.</span></div>
              </div>
            </div>
          </section>

          <div className="grid">
            <section className="card">
              <div className="card-title">Today&apos;s relationship support missions</div>
              <div className="card-copy">These tasks are intentionally small. The goal is to help you regulate, communicate more gently, and protect closeness while your stress is active.</div>
              <div className="missions">
                {tasks.map((task, index) => (
                  <div key={`${task.title}-${index}`} className={`mission ${done[index] ? "done" : ""}`} onClick={() => toggleDone(index)}>
                    <div className="mission-icon">{task.emoji || "✨"}</div>
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.desc}</p>
                      <div className="meta">
                        {task.duration && <span>{task.duration}</span>}
                        {task.category && <span>{task.category}</span>}
                      </div>
                    </div>
                    <button className="toggle">{done[index] ? "Completed" : "Mark done"}</button>
                  </div>
                ))}
                {!tasks.length && <div className="empty">Tasks are still loading. If nothing appears after a moment, refresh missions and make sure the backend can reach the external task API.</div>}
              </div>
            </section>

            <div className="side-stack">
              <section className="card">
                <div className="card-title">Stress trend</div>
                <div className="card-copy">Use your recent pattern to notice whether stress is becoming a cycle in your relationships.</div>
                {history.length > 0 ? (
                  <div className="history-bars">
                    {[...history].reverse().map((item, index) => (
                      <div key={`${item.date}-${index}`} className="bar-wrap">
                        <div className="bar" style={{ height: item.level === "High" ? 148 : item.level === "Medium" ? 102 : 62, background: item.level === "High" ? "linear-gradient(180deg,#dc6d43,#bc4f31)" : item.level === "Medium" ? "linear-gradient(180deg,#f0b15e,#dc8b38)" : "linear-gradient(180deg,#5bb5a7,#2f7f74)" }} />
                        <span>{item.date}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="empty">Take a few check-ins over time to reveal your stress rhythm.</div>}
              </section>

              <section className="card">
                <div className="card-title">Today&apos;s quests</div>
                <div className="card-copy">A lightweight gamified layer to keep the experience encouraging and usable.</div>
                <div className="quest-list">
                  {questCards.map((quest) => (
                    <div className="quest" key={quest.title}>
                      <strong>{quest.title}</strong>
                      <span>{quest.text}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card">
                <div className="card-title">Badges earned</div>
                <div className="card-copy">Your progress markers celebrate consistency, not perfection.</div>
                <div className="badge-row">
                  {(progressState.badges.length ? progressState.badges : ["Start with one mission"]).map((badge) => (
                    <div className="badge" key={badge}>{badge}</div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
