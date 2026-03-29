import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.page{min-height:100vh;padding:22px;background:radial-gradient(circle at top left,rgba(255,167,102,.32),transparent 26%),radial-gradient(circle at 85% 15%,rgba(67,186,169,.22),transparent 22%),linear-gradient(180deg,#f7f0e4 0%,#efe6d3 100%);font-family:'IBM Plex Sans',sans-serif;color:#14302b}
.shell{max-width:1120px;margin:0 auto}
.top{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px;flex-wrap:wrap}
.brand{font-family:'Sora',sans-serif;font-size:1.75rem;font-weight:800}
.subtitle{max-width:620px;line-height:1.7;color:rgba(20,48,43,.72);margin-top:6px}
.chips{display:flex;gap:10px;flex-wrap:wrap}
.chip{padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.58);border:1px solid rgba(20,48,43,.08);font-size:.86rem;font-weight:700;color:#48655f}
.layout{display:grid;grid-template-columns:320px 1fr;gap:20px}
.side,.main{border-radius:30px;background:rgba(255,255,255,.68);border:1px solid rgba(20,48,43,.08);box-shadow:0 24px 50px rgba(20,48,43,.08)}
.side{padding:24px;align-self:start;position:sticky;top:22px}
.stage{display:grid;gap:12px;margin-top:18px}
.stage-card{border-radius:22px;padding:16px;background:#f7f3ea;border:1px solid rgba(20,48,43,.06)}
.stage-card.active{background:#14302b;color:#eff6f4}
.stage-card strong{display:block;margin-bottom:6px;font-family:'Sora',sans-serif;font-size:.96rem}
.stage-card span{display:block;font-size:.9rem;line-height:1.55;color:inherit;opacity:.8}
.mini-stat{margin-top:18px;padding:18px;border-radius:24px;background:linear-gradient(135deg,#dc6d43,#bc4f31);color:#fff}
.mini-stat strong{display:block;font-family:'Sora',sans-serif;font-size:1.25rem;margin-bottom:6px}
.mini-stat p{line-height:1.6;font-size:.92rem;opacity:.92}
.main{padding:24px}
.progress-wrap{margin-bottom:20px}
.progress-row{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px;flex-wrap:wrap}
.progress-title{font-family:'Sora',sans-serif;font-size:1.05rem}
.progress-copy{font-size:.92rem;color:rgba(20,48,43,.66)}
.progress-bar{height:10px;background:#e2ddd1;border-radius:999px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,#2f7f74,#dc6d43);border-radius:999px;transition:.28s ease}
.intro{display:grid;grid-template-columns:1.1fr .9fr;gap:18px;align-items:stretch}
.hero{border-radius:30px;padding:28px;background:#14302b;color:#eff6f4;position:relative;overflow:hidden}
.hero::after{content:'';position:absolute;width:180px;height:180px;border-radius:50%;background:rgba(255,167,102,.18);right:-50px;bottom:-70px}
.hero h2{font-family:'Sora',sans-serif;font-size:2.05rem;line-height:1.08;margin-bottom:14px;max-width:430px}
.hero p{max-width:480px;line-height:1.75;color:rgba(239,246,244,.8)}
.hero-btn,.camera-btn,.camera-alt{margin-top:20px;border:none;border-radius:20px;padding:15px 18px;font-weight:800;cursor:pointer}
.hero-btn{background:#f5efe2;color:#14302b}
.camera-btn{background:linear-gradient(135deg,#43baa9,#2f7f74);color:#fff}
.camera-alt{background:rgba(255,255,255,.08);color:#eff6f4;margin-left:10px}
.note{border-radius:30px;padding:24px;background:#f6efe2;border:1px dashed rgba(20,48,43,.14)}
.note h3{font-family:'Sora',sans-serif;font-size:1.2rem;margin-bottom:12px}
.note ul{padding-left:18px;line-height:1.8;color:rgba(20,48,43,.74)}
.camera-consent{margin-top:22px;padding:18px;border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.08)}
.camera-consent strong{display:block;font-family:'Sora',sans-serif;font-size:1rem;margin-bottom:8px}
.camera-consent p{line-height:1.65;color:rgba(239,246,244,.78)}
.camera-actions{display:flex;gap:10px;flex-wrap:wrap}
.camera-panel{display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:stretch;margin-bottom:18px}
.camera-panel.intro-panel{margin-top:18px;margin-bottom:0}
.camera-preview{position:relative;border-radius:24px;overflow:hidden;background:#0f211d;min-height:164px}
.camera-preview video{width:100%;height:100%;object-fit:cover;display:block;transform:scaleX(-1)}
.camera-overlay{position:absolute;inset:auto 10px 10px 10px;display:flex;justify-content:space-between;gap:10px;align-items:center}
.camera-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(20,48,43,.78);color:#eff6f4;font-size:.78rem;font-weight:700}
.camera-badge.warm{background:rgba(220,109,67,.9)}
.camera-copy{border-radius:24px;padding:18px;background:#f4efe4;border:1px solid rgba(20,48,43,.06)}
.camera-copy strong{display:block;font-family:'Sora',sans-serif;font-size:1rem;margin-bottom:8px}
.camera-copy p{line-height:1.65;color:rgba(20,48,43,.72)}
.camera-metrics{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.camera-metrics span{padding:8px 12px;border-radius:999px;background:#fff;font-size:.8rem;font-weight:700;color:#48655f;border:1px solid rgba(20,48,43,.06)}
.question-card{border-radius:30px;padding:26px;background:linear-gradient(180deg,#fffdfa 0%,#f6f0e5 100%);border:1px solid rgba(20,48,43,.06)}
.kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(47,127,116,.1);color:#2f7f74;font-size:.82rem;font-weight:700;margin-bottom:16px}
.q-emoji{font-size:2.6rem;margin-bottom:14px}
.q-title{font-family:'Sora',sans-serif;font-size:1.7rem;line-height:1.18;margin-bottom:12px}
.q-copy{font-size:1rem;line-height:1.72;color:rgba(20,48,43,.72);margin-bottom:22px}
.option-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.option{border-radius:22px;padding:16px;background:#fff;border:1px solid rgba(20,48,43,.08);cursor:pointer;transition:.18s ease;text-align:left}
.option:hover{transform:translateY(-2px);border-color:rgba(47,127,116,.4)}
.option.selected{background:#14302b;color:#eff6f4;border-color:#14302b}
.option-emoji{display:block;font-size:1.45rem;margin-bottom:8px}
.option-label{display:block;font-weight:700;line-height:1.55}
.scale{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.scale-btn{border:none;border-radius:22px;padding:18px 10px;background:#fff;cursor:pointer;border:1px solid rgba(20,48,43,.08);transition:.18s ease}
.scale-btn strong{display:block;font-family:'Sora',sans-serif;font-size:1.2rem;margin-bottom:8px}
.scale-btn span{font-size:.82rem;line-height:1.45;color:rgba(20,48,43,.68)}
.scale-btn.selected{background:#14302b;color:#eff6f4}
.scale-btn.selected span{color:rgba(239,246,244,.78)}
.nav-row{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:24px;flex-wrap:wrap}
.ghost,.primary{border:none;border-radius:18px;padding:14px 18px;font-weight:800;cursor:pointer}
.ghost{background:rgba(20,48,43,.08);color:#14302b}
.primary{background:linear-gradient(135deg,#dc6d43,#bc4f31);color:#fff}
.primary:disabled,.camera-btn:disabled,.camera-alt:disabled{opacity:.45;cursor:not-allowed}
.loading,.error{border-radius:28px;padding:40px;text-align:center;background:#fff7ef;border:1px solid rgba(20,48,43,.08)}
.loading h3,.error h3{font-family:'Sora',sans-serif;font-size:1.55rem;margin-bottom:10px}
.loading p,.error p{line-height:1.7;color:rgba(20,48,43,.72)}
@media (max-width:960px){.layout,.intro,.camera-panel{grid-template-columns:1fr}.side{position:static}}
@media (max-width:620px){.option-grid{grid-template-columns:1fr}.scale{grid-template-columns:1fr}.main,.side{padding:18px}.q-title{font-size:1.45rem}.camera-actions{flex-direction:column}.camera-alt{margin-left:0}}
`;

const API = "http://127.0.0.1:8000";
const STRESS_SCALE_COPY = { 1: "Rarely", 2: "Sometimes", 3: "Mixed", 4: "Often", 5: "Almost always" };
const FACE_API_MODEL_URL = `${process.env.PUBLIC_URL || ""}/models`;
const FACE_API_SCRIPT_URL = `${process.env.PUBLIC_URL || ""}/vendor/face-api.min.js`;
const EMPTY_FACIAL_SIGNAL = { consent: false, stress_signal: null, dominant_expression: null, sample_count: 0 };
const EMPTY_EXPRESSION_SCORES = { angry: 0, anxious: 0, disgusted: 0, happy: 0, neutral: 0, sad: 0, surprised: 0 };

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeExpressionLabel(label) {
  if (label === "fearful") return "anxious";
  return label;
}

function loadFaceApiScript() {
  if (window.faceapi) return Promise.resolve(window.faceapi);

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[data-face-api="true"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.faceapi), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load face-api script")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = FACE_API_SCRIPT_URL;
    script.async = true;
    script.dataset.faceApi = "true";
    script.onload = () => resolve(window.faceapi);
    script.onerror = () => reject(new Error("Failed to load face-api script"));
    document.body.appendChild(script);
  });
}

function summarizeCameraStats(stats) {
  if (!stats.samples) return EMPTY_FACIAL_SIGNAL;

  const averages = Object.entries(stats.expressionTotals).reduce((acc, [label, total]) => {
    acc[label] = total / stats.samples;
    return acc;
  }, {});
  const dominantEntry = Object.entries(averages).sort((a, b) => b[1] - a[1])[0] || ["neutral", 0];
  const dominantExpression = dominantEntry[0];
  const stressSignal = clamp(
    (averages.anxious || 0) * 1.0 +
    (averages.angry || 0) * 0.88 +
    (averages.sad || 0) * 0.82 +
    (averages.disgusted || 0) * 0.74 +
    (averages.surprised || 0) * 0.42 +
    (averages.neutral || 0) * 0.28 -
    (averages.happy || 0) * 0.55,
    0,
    1,
  );

  return {
    consent: true,
    stress_signal: Number(stressSignal.toFixed(3)),
    dominant_expression: dominantExpression,
    sample_count: stats.samples,
  };
}

export default function Questionnaire() {
  const navigate = useNavigate();
  const email = localStorage.getItem("user") || "guest@example.com";
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const faceApiRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const processingRef = useRef(false);
  const statsRef = useRef({ samples: 0, expressionTotals: { ...EMPTY_EXPRESSION_SCORES } });

  const [phase, setPhase] = useState("intro");
  const [pQuestions, setPQuestions] = useState([]);
  const [sQuestions, setSQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [sourceLabel, setSourceLabel] = useState("dynamic");
  const [idx, setIdx] = useState(0);
  const [pAns, setPAns] = useState({});
  const [sAns, setSAns] = useState({});
  const [cameraConsent, setCameraConsent] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("off");
  const [cameraError, setCameraError] = useState("");
  const [facialSignal, setFacialSignal] = useState(EMPTY_FACIAL_SIGNAL);
  const [liveEmotion, setLiveEmotion] = useState("No face read yet");

  useEffect(() => {
    axios.get(`${API}/questions/assessment/${encodeURIComponent(email)}`)
      .then((res) => {
        setPQuestions(res.data.personality_questions || []);
        setSQuestions(res.data.stress_questions || []);
        setSourceLabel(res.data.source || "dynamic");
        setLoading(false);
      })
      .catch(() => {
        Promise.all([
          axios.get(`${API}/questions/personality`, { params: { email } }),
          axios.get(`${API}/questions/stress`, { params: { email } }),
        ])
          .then(([pRes, sRes]) => {
            setPQuestions(pRes.data.questions || []);
            setSQuestions(sRes.data.questions || []);
            setSourceLabel("dynamic");
            setLoading(false);
          })
          .catch(() => {
            setFetchError("We could not load your check-in. Please make sure the backend is running and try again.");
            setLoading(false);
          });
      });
  }, [email]);

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    async function attachPreview() {
      if (!cameraConsent || cameraStatus !== "active" || !videoRef.current || !streamRef.current) return;

      if (videoRef.current.srcObject !== streamRef.current) videoRef.current.srcObject = streamRef.current;

      try {
        await videoRef.current.play();
      } catch {
      }

      if (!rafRef.current && faceApiRef.current) beginCameraLoop();
    }

    attachPreview();
  }, [cameraConsent, cameraStatus, phase]);

  const totalQ = pQuestions.length + sQuestions.length;
  const answeredSoFar = phase === "stress" ? pQuestions.length + idx : phase === "personality" ? idx : 0;
  const progress = totalQ > 0 ? Math.round((answeredSoFar / totalQ) * 100) : 0;
  const curP = pQuestions[idx];
  const curS = sQuestions[idx];
  const curPAns = curP ? pAns[curP.id] : null;
  const curSAns = curS ? sAns[curS.id] : null;
  const stageName = phase === "personality" ? "Pattern check" : phase === "stress" ? "Stress pulse" : phase === "loading" ? "Scoring" : "Get ready";

  const cameraSummaryLabel =
    facialSignal.sample_count ? `${facialSignal.dominant_expression} detected` : "No signal yet";

  async function startCameraAssist() {
    try {
      setCameraConsent(true);
      setCameraError("");
      setCameraStatus("requesting");
      statsRef.current = { samples: 0, expressionTotals: { ...EMPTY_EXPRESSION_SCORES } };
      setFacialSignal({ ...EMPTY_FACIAL_SIGNAL, consent: true });
      setLiveEmotion("Loading emotion model");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      const faceapi = await loadFaceApiScript();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(FACE_API_MODEL_URL),
      ]);

      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      faceApiRef.current = faceapi;

      setCameraStatus("active");
      setLiveEmotion("Face model ready");
      setPhase("personality");
    } catch (error) {
      console.error(error);
      stopCameraAssist();
      setCameraError("Camera access is required for this assessment. Please allow camera permission in your browser and try again.");
      setCameraStatus("error");
    }
  }

  function stopCameraAssist(clearConsent = true) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastVideoTimeRef.current = -1;
    processingRef.current = false;
    faceApiRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) videoRef.current.srcObject = null;

    if (clearConsent) {
      setCameraConsent(false);
      setFacialSignal(EMPTY_FACIAL_SIGNAL);
      statsRef.current = { samples: 0, expressionTotals: { ...EMPTY_EXPRESSION_SCORES } };
      setCameraStatus("off");
      setCameraError("");
      setLiveEmotion("No face read yet");
    }
  }

  function beginCameraLoop() {
    const processFrame = async () => {
      const video = videoRef.current;
      const faceapi = faceApiRef.current;

      if (video && faceapi && video.readyState >= 2 && !processingRef.current) {
        if (video.currentTime !== lastVideoTimeRef.current) {
          processingRef.current = true;
          lastVideoTimeRef.current = video.currentTime;
          try {
            const detection = await faceapi
              .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 }))
              .withFaceExpressions();

            if (detection?.expressions) {
              const normalizedExpressions = Object.entries(detection.expressions).reduce((acc, [label, value]) => {
                acc[normalizeExpressionLabel(label)] = value;
                return acc;
              }, {});
              const expressionTotals = { ...statsRef.current.expressionTotals };
              Object.entries(normalizedExpressions).forEach(([label, value]) => {
                expressionTotals[label] = (expressionTotals[label] || 0) + value;
              });

              statsRef.current = {
                samples: statsRef.current.samples + 1,
                expressionTotals,
              };

              const liveTop = Object.entries(normalizedExpressions).sort((a, b) => b[1] - a[1])[0];
              if (liveTop) setLiveEmotion(`${liveTop[0]} ${Math.round(liveTop[1] * 100)}%`);
              if (statsRef.current.samples % 3 === 0) setFacialSignal(summarizeCameraStats(statsRef.current));
            } else {
              setLiveEmotion("Face not clearly visible");
            }
          } finally {
            processingRef.current = false;
          }
        }
      }

      rafRef.current = requestAnimationFrame(processFrame);
    };

    rafRef.current = requestAnimationFrame(processFrame);
  }

  function goNext() {
    if (phase === "personality") {
      if (idx < pQuestions.length - 1) setIdx((value) => value + 1);
      else {
        setIdx(0);
        setPhase("stress_intro");
      }
      return;
    }

    if (phase === "stress") {
      if (idx < sQuestions.length - 1) setIdx((value) => value + 1);
      else submitAll();
    }
  }

  function goBack() {
    if (idx > 0) setIdx((value) => value - 1);
  }

  async function submitAll() {
    setPhase("loading");

    try {
      const personalityAnswers = pQuestions.map((question) => pAns[question.id] ?? 3);
      const stressAnswers = sQuestions.map((question) => sAns[question.id] ?? 3);
      const finalFacialSignal = cameraConsent ? summarizeCameraStats(statsRef.current) : EMPTY_FACIAL_SIGNAL;

      const res = await axios.post(`${API}/stress/full-analyze`, {
        email,
        personality_answers: personalityAnswers,
        personality_questions: pQuestions,
        stress_answers: stressAnswers,
        facial_signal: finalFacialSignal,
      });

      localStorage.setItem("stress_level", res.data.stress_level);
      localStorage.setItem("stress_result", JSON.stringify(res.data));

      try {
        const taskRes = await axios.post(`${API}/questions/ai-tasks`, {
          email,
          stress_level: res.data.stress_level,
          personality_type: res.data.personality_type,
        });
        const stored = JSON.parse(localStorage.getItem("stress_result") || "{}");
        stored.ai_tasks = taskRes.data.tasks;
        localStorage.setItem("stress_result", JSON.stringify(stored));
      } catch {
      }

      stopCameraAssist(false);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setPhase("error");
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="shell">
          <div className="top">
            <div>
              <div className="brand">Mindful Bonds Check-In</div>
              <div className="subtitle">This 3-question pulse is designed to catch real-world stress before it spills into conflict, distance, shutdown, or saying things you do not mean.</div>
            </div>
            <div className="chips">
              <div className="chip">Source: {sourceLabel}</div>
              <div className="chip">Stage: {stageName}</div>
              <div className="chip">{cameraConsent ? "Camera required: connected" : "Camera required"}</div>
            </div>
          </div>

          <div className="layout">
            <aside className="side">
              <div className="brand">3-question care route</div>
              <div className="stage">
                <div className={`stage-card ${phase === "intro" || phase === "personality" ? "active" : ""}`}>
                  <strong>1. Notice your pattern</strong>
                  <span>See how your personality shapes the way stress appears in conversation and connection.</span>
                </div>
                <div className={`stage-card ${phase === "stress_intro" || phase === "stress" ? "active" : ""}`}>
                  <strong>2. Measure your current load</strong>
                  <span>Track the intensity of recent stress before it becomes emotional spillover.</span>
                </div>
                <div className={`stage-card ${phase === "loading" ? "active" : ""}`}>
                  <strong>3. Get mindful missions</strong>
                  <span>Receive relationship-centered tasks for repair, grounding, and reconnection.</span>
                </div>
              </div>
              <div className="mini-stat">
                <strong>{progress}% complete</strong>
                <p>Small honest answers are enough. The goal is not perfection. It is noticing what kind of care you need before the day gets heavier.</p>
              </div>
            </aside>

            <main className="main">
              <div className="progress-wrap">
                <div className="progress-row">
                  <div>
                    <div className="progress-title">Mindful relationship pulse</div>
                    <div className="progress-copy">Only 3 questions. Answer what feels true right now and we will translate it into calming next steps.</div>
                  </div>
                  <div className="chip">{progress}% done</div>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              </div>

              {loading && <div className="loading"><h3>Preparing your check-in</h3><p>Loading your personality and stress prompts so we can build a relevant care plan.</p></div>}

              {!loading && fetchError && <div className="error"><h3>We hit a loading problem</h3><p>{fetchError}</p></div>}

              {!loading && !fetchError && phase === "intro" && (
                <div className="intro">
                  <section className="hero">
                    <div className="kicker">Relationship-aware assessment</div>
                    <h2>Understand your stress before it changes how you show up with others.</h2>
                    <p>In just 3 questions, you will map your style, check your current overload level, and unlock a personalized set of mindful missions designed for communication, repair, and emotional safety.</p>

                    <div className="camera-consent">
                      <strong>Mandatory camera-assisted check-in</strong>
                      <p>This assessment uses both your answers and live facial-expression signals to reduce false assumptions. Raw video stays in your browser. Only a small summary signal is sent to the backend.</p>
                      <div className="camera-actions">
                        <button className="camera-btn" onClick={startCameraAssist} disabled={cameraStatus === "requesting" || cameraStatus === "active"}>
                          {cameraStatus === "requesting" ? "Starting camera..." : cameraStatus === "active" ? "Camera connected" : "Turn on camera and begin"}
                        </button>
                        {cameraStatus === "active" && (
                          <button className="camera-alt" onClick={() => stopCameraAssist()}>
                            Reset camera
                          </button>
                        )}
                      </div>
                      {cameraError && <p style={{ marginTop: 12 }}>{cameraError}</p>}
                    </div>
                    {cameraConsent && (
                      <div className="camera-panel intro-panel">
                        <div className="camera-preview">
                          <video ref={videoRef} autoPlay muted playsInline />
                          <div className="camera-overlay">
                            <span className={`camera-badge ${facialSignal.dominant_expression === "tension" ? "warm" : ""}`}>
                              {cameraStatus === "active" ? "Camera live" : "Waiting for permission"}
                            </span>
                            <span className="camera-badge">{cameraSummaryLabel}</span>
                          </div>
                        </div>
                        <div className="camera-copy">
                          <strong>Live preview required before questions</strong>
                          <p>Once the camera is connected, the assessment starts automatically so your facial-expression signal is captured while you answer each question.</p>
                          <div className="camera-metrics">
                            <span>Samples: {facialSignal.sample_count || 0}</span>
                            <span>Status: {cameraStatus}</span>
                            <span>Live emotion: {liveEmotion}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                  <aside className="note">
                    <h3>What this helps with</h3>
                    <ul>
                      <li>Short replies after a stressful day</li>
                      <li>Avoiding conversations because you feel drained</li>
                      <li>Snapping when your nervous system is overloaded</li>
                      <li>Feeling distant even when you care deeply</li>
                    </ul>
                  </aside>
                </div>
              )}

              {!loading && !fetchError && cameraConsent && phase !== "intro" && phase !== "loading" && phase !== "error" && (
                <div className="camera-panel">
                  <div className="camera-preview">
                    <video ref={videoRef} autoPlay muted playsInline />
                    <div className="camera-overlay">
                      <span className={`camera-badge ${facialSignal.dominant_expression === "tension" ? "warm" : ""}`}>
                        {cameraStatus === "active" ? "Camera live" : "Camera paused"}
                      </span>
                      <span className="camera-badge">{cameraSummaryLabel}</span>
                    </div>
                  </div>
                  <div className="camera-copy">
                    <strong>Camera-assisted stress signal</strong>
                    <p>We are tracking real emotion labels while you answer. This helps reduce false assumptions when your words and visible stress cues do not fully match.</p>
                    <div className="camera-metrics">
                      <span>Samples: {facialSignal.sample_count || 0}</span>
                      <span>Signal: {facialSignal.stress_signal == null ? "--" : `${Math.round(facialSignal.stress_signal * 100)}%`}</span>
                      <span>Read: {cameraSummaryLabel}</span>
                      <span>Live emotion: {liveEmotion}</span>
                    </div>
                  </div>
                </div>
              )}

              {phase === "personality" && curP && (
                <div className="question-card">
                  <div className="kicker">Pattern check • {idx + 1} of {pQuestions.length}</div>
                  <div className="q-emoji">{curP.emoji || "Mind"}</div>
                  <div className="q-title">{curP.text}</div>
                  <div className="q-copy">Choose the answer that feels most like you in everyday life, especially under pressure or in close relationships.</div>
                  <div className="option-grid">
                    {(curP.options || []).map((opt) => (
                      <button key={opt.value} className={`option ${curPAns === opt.value ? "selected" : ""}`} onClick={() => setPAns((prev) => ({ ...prev, [curP.id]: opt.value }))}>
                        <span className="option-emoji">{opt.emoji || "*"}</span>
                        <span className="option-label">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="nav-row">
                    {idx > 0 ? <button className="ghost" onClick={goBack}>Back</button> : <div />}
                    <button className="primary" disabled={!curPAns} onClick={goNext}>{idx < pQuestions.length - 1 ? "Continue" : "Move to stress check"}</button>
                  </div>
                </div>
              )}

              {phase === "stress_intro" && (
                <div className="intro">
                  <section className="hero">
                    <div className="kicker">Stress pulse</div>
                    <h2>Now let&apos;s measure how heavy things feel right now.</h2>
                    <p>Rate recent signals like overload, tension, mental fatigue, and difficulty staying calm. This is what shapes your care plan for the day.</p>
                    <button className="hero-btn" onClick={() => { setIdx(0); setPhase("stress"); }}>Finish with the final question</button>
                  </section>
                  <aside className="note">
                    <h3>How to answer</h3>
                    <ul>
                      <li>Choose based on recent days, not your best day</li>
                      <li>Answer honestly even if it feels uncomfortable</li>
                      <li>This is a support tool, not a judgment</li>
                    </ul>
                  </aside>
                </div>
              )}

              {phase === "stress" && curS && (
                <div className="question-card">
                  <div className="kicker">Stress pulse • {idx + 1} of {sQuestions.length}</div>
                  <div className="q-emoji">{curS.emoji || "Stress"}</div>
                  <div className="q-title">{curS.text}</div>
                  <div className="q-copy">Pick how often this feels true recently, especially in moments when you are interacting with people who matter to you.</div>
                  <div className="scale">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} className={`scale-btn ${curSAns === value ? "selected" : ""}`} onClick={() => setSAns((prev) => ({ ...prev, [curS.id]: value }))}>
                        <strong>{value}</strong>
                        <span>{STRESS_SCALE_COPY[value]}</span>
                      </button>
                    ))}
                  </div>
                  <div className="nav-row">
                    {idx > 0 ? <button className="ghost" onClick={goBack}>Back</button> : <div />}
                    <button className="primary" disabled={!curSAns} onClick={goNext}>{idx < sQuestions.length - 1 ? "Next signal" : "Build my care plan"}</button>
                  </div>
                </div>
              )}

              {phase === "loading" && <div className="loading"><h3>Building your care plan</h3><p>Scoring your stress level, identifying your pattern, and selecting mindful tasks that support calmer relationships.</p></div>}

              {phase === "error" && (
                <div className="error">
                  <h3>We could not finish the assessment</h3>
                  <p>Please try again. If the backend is running, the app should recover on the next attempt.</p>
                  <div className="nav-row" style={{ marginTop: 18 }}><div /><button className="primary" onClick={() => setPhase("stress")}>Try again</button></div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
