import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.auth{
  min-height:100vh;padding:22px;
  background:
    radial-gradient(circle at top left, rgba(255,167,102,.34), transparent 28%),
    radial-gradient(circle at right center, rgba(67,186,169,.24), transparent 26%),
    linear-gradient(180deg,#f7f0e4 0%,#efe6d2 100%);
  font-family:'IBM Plex Sans',sans-serif;color:#14302b;
  display:grid;place-items:center
}
.card{
  width:min(100%,1020px);display:grid;grid-template-columns:.95fr 1.05fr;border-radius:34px;overflow:hidden;
  background:rgba(255,255,255,.72);border:1px solid rgba(20,48,43,.08);box-shadow:0 28px 60px rgba(20,48,43,.12)
}
.form-wrap{padding:38px}
.story{padding:38px;background:linear-gradient(180deg,#f2b062 0%,#dc6d43 100%);color:#fff}
.story-badge{display:inline-flex;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.18);font-size:.78rem;font-weight:700;margin-bottom:18px}
.story h1{font-family:'Sora',sans-serif;font-size:2.1rem;line-height:1.08;margin-bottom:14px}
.story p{line-height:1.75;color:rgba(255,255,255,.9)}
.story-grid{display:grid;gap:14px;margin-top:26px}
.story-card{padding:16px;border-radius:18px;background:rgba(255,255,255,.14)}
.story-card strong{display:block;margin-bottom:6px}
.mark{
  width:52px;height:52px;border-radius:18px;background:linear-gradient(135deg,#14302b,#2f7f74);display:grid;place-items:center;
  color:#fff;font-size:1.35rem;margin-bottom:18px
}
.title{font-family:'Sora',sans-serif;font-size:1.9rem;margin-bottom:8px}
.sub{color:rgba(20,48,43,.7);line-height:1.65;margin-bottom:24px}
.msg,.err,.ok{
  border-radius:18px;padding:14px 16px;font-size:.92rem;line-height:1.55;margin-bottom:16px
}
.err{background:rgba(188,79,49,.12);color:#9f3f24;border:1px solid rgba(188,79,49,.16)}
.ok{background:rgba(47,127,116,.12);color:#215d53;border:1px solid rgba(47,127,116,.16)}
.field{margin-bottom:14px}
.field label{display:block;margin-bottom:8px;font-size:.82rem;font-weight:700;color:#48655f;text-transform:uppercase;letter-spacing:.05em}
.field input{
  width:100%;padding:16px 18px;border-radius:18px;border:1px solid rgba(20,48,43,.12);
  background:#fff;font-size:1rem;color:#14302b;outline:none;transition:.18s ease
}
.field input:focus{border-color:#bc4f31;box-shadow:0 0 0 4px rgba(188,79,49,.12)}
.submit{
  width:100%;border:none;border-radius:20px;padding:16px 18px;margin-top:6px;cursor:pointer;
  background:linear-gradient(135deg,#dc6d43,#bc4f31);color:#fff;font-weight:700;font-size:1rem
}
.foot{margin-top:18px;color:rgba(20,48,43,.7)}
.foot a{color:#2f7f74;font-weight:700;text-decoration:none}
@media (max-width:860px){
  .card{grid-template-columns:1fr}
  .story{order:-1}
}
`;

export default function Register() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    setErr("");
    setOk("");
    if (!email || !pw || !pw2) {
      setErr("Please fill in all fields.");
      return;
    }
    if (pw !== pw2) {
      setErr("Passwords do not match.");
      return;
    }
    if (pw.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      await axios.post("http://127.0.0.1:8000/auth/register", { email, password: pw });
      setOk("Account created. Redirecting you to sign in...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      setErr(e.response?.data?.detail || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="auth">
        <div className="card">
          <div className="form-wrap">
            <div className="mark">🪴</div>
            <div className="title">Create your care account</div>
            <div className="sub">Start a mindful stress routine built around better self-regulation and healthier relationships.</div>
            {err && <div className="err">{err}</div>}
            {ok && <div className="ok">{ok}</div>}

            <div className="field">
              <label>Email</label>
              <input
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Confirm password</label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
            </div>

            <button className="submit" disabled={busy} onClick={submit}>
              {busy ? "Creating account..." : "Create account"}
            </button>

            <div className="foot">
              Already a member? <Link to="/login">Sign in</Link>
            </div>
          </div>

          <div className="story">
            <div className="story-badge">What you unlock</div>
            <h1>A calmer relationship with stress, and with people.</h1>
            <p>
              Your account saves your stress history, your care streak, and the relationship-centered missions
              that help you recover after hard days instead of carrying them into every conversation.
            </p>
            <div className="story-grid">
              <div className="story-card">
                <strong>Daily pulse</strong>
                Understand if you are approaching overload, shutdown, or reactive communication.
              </div>
              <div className="story-card">
                <strong>Guided repair</strong>
                Receive simple tasks for check-ins, boundaries, appreciation, and nervous-system reset.
              </div>
              <div className="story-card">
                <strong>Gamified progress</strong>
                Build momentum through streaks, care points, and daily missions you can actually finish.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
