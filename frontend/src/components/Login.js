import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.auth{
  min-height:100vh;padding:22px;
  background:
    radial-gradient(circle at top right, rgba(67,186,169,.26), transparent 28%),
    radial-gradient(circle at left bottom, rgba(255,167,102,.34), transparent 30%),
    linear-gradient(180deg,#f5efe2 0%,#f0e8d5 100%);
  font-family:'IBM Plex Sans',sans-serif;color:#14302b;
  display:grid;place-items:center
}
.card{
  width:min(100%,980px);display:grid;grid-template-columns:1fr .9fr;border-radius:34px;overflow:hidden;
  background:rgba(255,255,255,.72);border:1px solid rgba(20,48,43,.08);box-shadow:0 28px 60px rgba(20,48,43,.12)
}
.story{
  padding:38px;background:linear-gradient(180deg,#14302b 0%,#1f554d 100%);color:#eff6f4;position:relative
}
.story-badge{display:inline-flex;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.08);font-size:.78rem;font-weight:700;margin-bottom:18px}
.story h1{font-family:'Sora',sans-serif;font-size:2.2rem;line-height:1.08;margin-bottom:14px}
.story p{color:rgba(239,246,244,.76);line-height:1.75;max-width:420px}
.story-list{display:grid;gap:14px;margin-top:26px}
.story-item{padding:16px;border-radius:18px;background:rgba(255,255,255,.06)}
.story-item strong{display:block;margin-bottom:6px}
.form-wrap{padding:38px}
.mark{
  width:52px;height:52px;border-radius:18px;background:linear-gradient(135deg,#dc6d43,#bc4f31);display:grid;place-items:center;
  color:#fff;font-size:1.35rem;margin-bottom:18px
}
.title{font-family:'Sora',sans-serif;font-size:1.9rem;margin-bottom:8px}
.sub{color:rgba(20,48,43,.7);line-height:1.65;margin-bottom:24px}
.msg,.err{
  border-radius:18px;padding:14px 16px;font-size:.92rem;line-height:1.55;margin-bottom:16px
}
.err{background:rgba(188,79,49,.12);color:#9f3f24;border:1px solid rgba(188,79,49,.16)}
.field{margin-bottom:14px}
.field label{display:block;margin-bottom:8px;font-size:.82rem;font-weight:700;color:#48655f;text-transform:uppercase;letter-spacing:.05em}
.field input{
  width:100%;padding:16px 18px;border-radius:18px;border:1px solid rgba(20,48,43,.12);
  background:#fff;font-size:1rem;color:#14302b;outline:none;transition:.18s ease
}
.field input:focus{border-color:#2f7f74;box-shadow:0 0 0 4px rgba(47,127,116,.12)}
.submit{
  width:100%;border:none;border-radius:20px;padding:16px 18px;margin-top:6px;cursor:pointer;
  background:linear-gradient(135deg,#14302b,#2f7f74);color:#fff;font-weight:700;font-size:1rem
}
.foot{margin-top:18px;color:rgba(20,48,43,.7)}
.foot a{color:#bc4f31;font-weight:700;text-decoration:none}
@media (max-width:860px){
  .card{grid-template-columns:1fr}
  .story{display:none}
}
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    setErr("");
    if (!email || !pw) {
      setErr("Please enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/login", {
        email: email.toLowerCase().trim(),
        password: pw,
      });
      localStorage.setItem("user", res.data.email);
      if (res.data.token) localStorage.setItem("token", res.data.token);
      navigate("/questions");
    } catch (e) {
      const detail = e.response?.data?.detail;
      setErr(detail || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="auth">
        <div className="card">
          <div className="story">
            <div className="story-badge">Return to your care loop</div>
            <h1>Come back to a calmer, kinder version of the day.</h1>
            <p>
              Sign in to continue your stress check-ins, track your pattern over time, and pick up
              relationship-support tasks that fit what is happening in real life.
            </p>
            <div className="story-list">
              <div className="story-item">
                <strong>Read your stress signal sooner</strong>
                Notice overload before it becomes distance, silence, or conflict.
              </div>
              <div className="story-item">
                <strong>Complete mindful missions</strong>
                Gentle tasks help you repair, reconnect, and regulate.
              </div>
              <div className="story-item">
                <strong>Build consistency</strong>
                Streaks and care points reward small healthy actions.
              </div>
            </div>
          </div>

          <div className="form-wrap">
            <div className="mark">☀</div>
            <div className="title">Sign in</div>
            <div className="sub">Check your current stress level and continue your mindful relationship plan.</div>
            {err && <div className="err">{err}</div>}

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
                placeholder="Your password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>

            <button className="submit" disabled={busy} onClick={submit}>
              {busy ? "Signing in..." : "Enter dashboard"}
            </button>

            <div className="foot">
              New here? <Link to="/register">Create your account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
