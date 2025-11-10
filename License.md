
## 3) Add LICENSE (MIT)
Create `/LICENSE` with standard MIT text (you can use GitHub’s “Add license” helper).

## 4) AI Studio category (optional but valuable)
If you want the **AI Studio category** credit:
- In **AI Studio**, create a tiny applet with your prompt that guides to the nearest open hub using a small mock hubs JSON.  
- Click **Share App** → paste the link in **Devpost “What to Submit → AI Studio prompts”** and into your README.

**If you skip this:** still fine. Submit under a general category and keep the “Uses Google AI model” bonus.

## 5) 3-minute video script (read this on screen)
- **0:00–0:20 Problem**: “Food insecurity is hyper-local. Families need dignity, hubs want a light process. CommonKind turns donations into QR meal vouchers in minutes.”
- **0:20–1:00 Demo**: Show the map → pick a hub → **Issue voucher** (QR) → **Redeem** (capacity decrements) → **Ask CK** with one helpful Q.
- **1:00–1:40 Architecture & Cloud Run**: Two services on Cloud Run (frontend + API), stateless API, env/secret injection, autoscaling.
- **1:40–2:10 AI**: Gemini 2.5 Flash guides volunteers (no PII), explain the prompt guardrails (privacy, safety).
- **2:10–2:50 Impact & Next**: Jobs (nightly cap reset), hub onboarding approval, fraud analytics, BigQuery export.
- **2:50–3:00 Close**: URLs + repo.

Pro tip: keep cursor visible; zoom the QR flow; include 1–2 quick slides (architecture, future work).

## 6) Devpost description block (paste-ready, short)
**Summary**  
CommonKind converts donations → QR meal vouchers → meals at partner eateries. Volunteers issue vouchers from a phone, restaurants redeem them, and capacity updates live. Built as two Cloud Run services (frontend + API) with a Gemini helper.

**Tech**  
React/Vite, Leaflet, html5-qrcode; Node/Express; Gemini 2.5 Flash; Cloud Run (2 services).

**Architecture**  
Frontend (static SPA) on Cloud Run → API (Express) on Cloud Run. API exposes `/api/hubs`, `/api/voucher/issue`, `/api/voucher/redeem`, `/api/ai`. In-memory demo store; secrets via Cloud Run.

**Try it**  
- Frontend: https://commonkind-web-197600244131.us-central1.run.app  
- Admin (demo): password `commonkind`  
- Repo: https://github.com/kaylew1421/CommonKind  
- Video: <link>  
- (AI Studio prompts: <link> if you add the applet)

**Learnings**  
Stateless design keeps costs low and deploys simple. Gemini improves wayfinding and policy clarity without storing PII.

## 7) LinkedIn post (for bonus points)
> I built **CommonKind (CK)** for the #CloudRunHackathon — a serverless app that turns neighbor generosity into **QR meal vouchers** redeemed at local eateries. Deployed as **two Cloud Run services** (frontend + API) with a **Gemini** helper for volunteers.  
> Try it: <demo link> • Code: <repo> • Video: <video link>  
> #CloudRunHackathon #GoogleCloud #Gemini

---

# Quick quality checks (judging rubric)

**Technical (40%)**
- ✅ Clean, typed frontend; simple Express API.
- ⛳ Add a **README “Runbook”** and **.env example**.
- ⛳ Note the **stateless** caveat + “future: Firestore/BigQuery” for persistence.

**Demo & Presentation (40%)**
- ❗ Add **3-min video**.  
- ✅ Architecture diagram(s) present — reference them inline in README.  
- ✅ Explain “Why Cloud Run”.

**Innovation (20%)**
- ✅ Framing (dignity, local-first, transparency) is strong and unique.  
- ⛳ Mention **fraud resistance** and **audit-ready logs** as roadmap.
