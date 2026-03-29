import { Link } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#f5efe2;color:#14302b}
.home{
  min-height:100vh;
  background:
    radial-gradient(circle at top left, rgba(255,167,102,.42), transparent 30%),
    radial-gradient(circle at 85% 15%, rgba(67,186,169,.28), transparent 24%),
    linear-gradient(180deg,#f5efe2 0%,#f1ead9 100%);
  font-family:'IBM Plex Sans',sans-serif;
  overflow:hidden;
}
.shell{max-width:1180px;margin:0 auto;padding:28px 20px 64px;position:relative}
.nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:44px;gap:16px}
.brand{
  display:inline-flex;align-items:center;gap:12px;
  font-family:'Sora',sans-serif;font-weight:800;font-size:1.05rem;color:#14302b;text-decoration:none
}
.brand-mark{
  width:44px;height:44px;border-radius:16px;
  display:grid;place-items:center;
  background:linear-gradient(135deg,#14302b,#2f7f74);
  color:#fff;box-shadow:0 18px 36px rgba(20,48,43,.18)
}
.nav-links{display:flex;gap:12px;flex-wrap:wrap}
.nav-btn,.nav-primary{
  text-decoration:none;border-radius:999px;padding:12px 18px;font-size:.95rem;font-weight:600;transition:.22s ease
}
.nav-btn{color:#14302b;background:rgba(255,255,255,.55);border:1px solid rgba(20,48,43,.08)}
.nav-primary{
  color:#fff;background:linear-gradient(135deg,#dc6d43,#bc4f31);
  box-shadow:0 16px 32px rgba(188,79,49,.2)
}
.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:28px;align-items:center}
.eyebrow{
  display:inline-flex;align-items:center;gap:10px;margin-bottom:18px;
  padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.56);
  border:1px solid rgba(20,48,43,.08);font-size:.8rem;font-weight:700;color:#2f7f74;letter-spacing:.03em
}
.hero h1{
  font-family:'Sora',sans-serif;font-weight:800;
  font-size:clamp(2.7rem,6vw,5rem);line-height:1.04;letter-spacing:-.04em;
  max-width:720px;margin-bottom:16px
}
.hero h1 span{color:#bc4f31}
.hero p{
  max-width:640px;font-size:1.08rem;line-height:1.75;color:rgba(20,48,43,.78);margin-bottom:28px
}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:28px}
.cta-main,.cta-soft{
  text-decoration:none;border-radius:22px;padding:16px 22px;font-weight:700;transition:.22s ease
}
.cta-main{
  color:#fff;background:linear-gradient(135deg,#14302b,#2f7f74);box-shadow:0 20px 42px rgba(20,48,43,.18)
}
.cta-soft{
  color:#14302b;background:rgba(255,255,255,.6);border:1px solid rgba(20,48,43,.08)
}
.micro{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px
}
.micro-card{
  padding:18px;border-radius:24px;background:rgba(255,255,255,.56);
  border:1px solid rgba(20,48,43,.08);backdrop-filter:blur(12px)
}
.micro-k{font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:700;margin-bottom:6px}
.micro-v{font-size:.92rem;line-height:1.5;color:rgba(20,48,43,.72)}

.spotlight{
  position:relative;padding:28px;border-radius:34px;background:#14302b;color:#eff6f4;
  box-shadow:0 26px 54px rgba(20,48,43,.2);overflow:hidden
}
.spotlight::before{
  content:'';position:absolute;inset:auto -40px -60px auto;width:180px;height:180px;border-radius:50%;
  background:rgba(255,167,102,.2);filter:blur(4px)
}
.orb{width:92px;height:92px;border-radius:28px;background:linear-gradient(135deg,#f9b36d,#dc6d43);display:grid;place-items:center;font-size:2.2rem;margin-bottom:22px}
.spotlight h2{font-family:'Sora',sans-serif;font-size:1.7rem;line-height:1.15;margin-bottom:12px}
.spotlight p{color:rgba(239,246,244,.78);line-height:1.7;margin-bottom:18px}
.quest-list{display:grid;gap:12px;margin-top:16px}
.quest{
  display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;
  padding:14px 16px;border-radius:20px;background:rgba(255,255,255,.06)
}
.quest-no{
  width:32px;height:32px;border-radius:12px;background:rgba(255,255,255,.12);
  display:grid;place-items:center;font-weight:700
}
.quest strong{display:block;font-size:.98rem;margin-bottom:4px}
.quest span{display:block;color:rgba(239,246,244,.72);font-size:.92rem;line-height:1.55}

.section{margin-top:56px}
.section-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:18px;flex-wrap:wrap}
.section-title{font-family:'Sora',sans-serif;font-size:1.85rem}
.section-copy{max-width:560px;line-height:1.7;color:rgba(20,48,43,.72)}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.panel{
  border-radius:28px;padding:24px;background:rgba(255,255,255,.56);
  border:1px solid rgba(20,48,43,.08);min-height:220px
}
.panel-icon{font-size:1.9rem;margin-bottom:18px}
.panel h3{font-family:'Sora',sans-serif;font-size:1.1rem;margin-bottom:10px}
.panel p{line-height:1.7;color:rgba(20,48,43,.72);font-size:.96rem}
.panel ul{margin-top:16px;padding-left:18px;color:rgba(20,48,43,.76);line-height:1.8}

@media (max-width:960px){
  .hero{grid-template-columns:1fr}
}
@media (max-width:720px){
  .micro,.grid{grid-template-columns:1fr}
  .shell{padding:20px 16px 56px}
  .nav{align-items:flex-start;flex-direction:column}
  .nav-links{width:100%}
  .nav-btn,.nav-primary{flex:1;text-align:center}
}
`;

export default function Home() {
  return (
    <>
      <style>{CSS}</style>
      <div className="home">
        <div className="shell">
          <div className="nav">
            <Link to="/" className="brand">
              <span className="brand-mark">☀</span>
              Mindful Bonds
            </Link>
            <div className="nav-links">
              <Link to="/login" className="nav-btn">Sign In</Link>
              <Link to="/register" className="nav-primary">Start Free Check-In</Link>
            </div>
          </div>

          <section className="hero">
            <div>
              <div className="eyebrow">Relationship-first stress care</div>
              <h1>
                Identify stress early.
                <span> Repair connection gently.</span>
              </h1>
              <p>
                Mindful Bonds helps people spot their stress patterns, understand how overload changes the
                way they show up with others, and follow small daily tasks that support calmer relationships,
                clearer communication, and emotional reset.
              </p>
              <div className="cta-row">
                <Link to="/register" className="cta-main">Begin your 3-minute check-in</Link>
                <Link to="/login" className="cta-soft">I already have an account</Link>
              </div>
              <div className="micro">
                <div className="micro-card">
                  <div className="micro-k">Stress Radar</div>
                  <div className="micro-v">Detect low, medium, and high stress before it spills into conflict or shutdown.</div>
                </div>
                <div className="micro-card">
                  <div className="micro-k">Mindful Missions</div>
                  <div className="micro-v">Follow dynamic tasks focused on repair, check-ins, grounding, and relationship care.</div>
                </div>
                <div className="micro-card">
                  <div className="micro-k">Gentle Gamification</div>
                  <div className="micro-v">Build streaks, earn care points, and complete short quests that feel rewarding instead of pressuring.</div>
                </div>
              </div>
            </div>

            <aside className="spotlight">
              <div className="orb">🪴</div>
              <h2>Your daily care loop</h2>
              <p>
                The app is designed for real life: busy mornings, tension after work, unread messages,
                difficult conversations, and emotional fatigue that quietly affects the people closest to you.
              </p>
              <div className="quest-list">
                <div className="quest">
                  <div className="quest-no">1</div>
                  <div>
                    <strong>Check in</strong>
                    <span>Answer a mobile-friendly pulse assessment on stress and your current relational state.</span>
                  </div>
                </div>
                <div className="quest">
                  <div className="quest-no">2</div>
                  <div>
                    <strong>Understand your pattern</strong>
                    <span>See how your personality and stress level influence reactions like withdrawal, irritability, or overthinking.</span>
                  </div>
                </div>
                <div className="quest">
                  <div className="quest-no">3</div>
                  <div>
                    <strong>Repair and reconnect</strong>
                    <span>Get small, achievable missions focused on communication, repair, and mindful co-regulation.</span>
                  </div>
                </div>
              </div>
            </aside>
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <div className="section-title">Built for actual stressful moments</div>
              </div>
              <div className="section-copy">
                This is not just a score screen. The experience is meant to help users when stress shows up as short replies,
                avoidance, emotional flooding, caregiving fatigue, or difficulty being present in relationships.
              </div>
            </div>
            <div className="grid">
              <div className="panel">
                <div className="panel-icon">📱</div>
                <h3>Mobile-first check-ins</h3>
                <p>Fast, tap-friendly assessment cards let users complete the flow with one hand, during a commute, break, or after a difficult interaction.</p>
                <ul>
                  <li>Short cards</li>
                  <li>Large controls</li>
                  <li>Clear progress cues</li>
                </ul>
              </div>
              <div className="panel">
                <div className="panel-icon">🎯</div>
                <h3>Relationship-focused tasks</h3>
                <p>Recommendations prioritize emotional safety, repair, boundaries, appreciation, and healthy reconnection instead of generic productivity tips.</p>
                <ul>
                  <li>Repair prompts</li>
                  <li>Mindful pauses</li>
                  <li>Connection rituals</li>
                </ul>
              </div>
              <div className="panel">
                <div className="panel-icon">🏅</div>
                <h3>Gentle motivation</h3>
                <p>Progress feels encouraging, not punishing, through streaks, care points, badges, and a “finish one small thing today” mindset.</p>
                <ul>
                  <li>Daily streaks</li>
                  <li>Care points</li>
                  <li>Quest completion</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
