/* EMPRESA SEM VOCÊ — script.js (index + cadastro) */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SCORE_MAP = {
  faturamento:   { "ate-50k": 5,  "50-100k": 12, "100-300k": 20, "300-500k": 25, "500k+": 25 },
  funcionarios:  { "so-eu": 3,    "1-5": 8,      "6-10": 15,     "11-30": 20,    "30+": 15 },
  ausencia_15dias: { "sim": 2,    "trava": 12,   "nunca-testei": 15 },
  horas_operacional: { "menos-4h": 3, "4-8h": 8,  "8-12h": 13,    "mais-12h": 15 },
  urgencia:      { "agora": 20,   "30d": 15,     "90d": 8,       "pesquisando": 2 },
  investimento:  { "sim-avista": 15, "sim-parcelado": 13, "preciso-organizar": 6, "nao-agora": 0 },
};

function calcScore(data) {
  let total = 0;
  for (const field in SCORE_MAP) {
    const value = data[field];
    const points = SCORE_MAP[field][value];
    if (typeof points === "number") total += points;
  }
  return Math.min(total, 100);
}

/* dataLayer (GTM) — eventos sem dado pessoal */
function dl(event, params) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: event }, params || {}));
}

document.querySelectorAll('a[href="/cadastro"]').forEach((a) => {
  a.addEventListener("click", () => {
    dl("clique_cta", { cta_texto: (a.textContent || "").trim(), cta_local: a.className });
  });
});

const nav = document.getElementById("nav");
if (nav) {
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    items.forEach((el) => io.observe(el));
    setTimeout(() => {
      document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
        el.classList.add("is-in");
      });
    }, 1500);
  } else {
    items.forEach((el) => el.classList.add("forced"));
  }
}
initReveals();

const form = document.getElementById("leadForm");
if (form) {

const SUPABASE_URL = "https://gdbvrexbpiwdubusciwm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYnZyZXhicGl3ZHVidXNjaXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODU3MjcsImV4cCI6MjA5NzM2MTcyN30.So1TmEYUBt3QskEKg7u1JYIL8Al_Kmn5JfnDPgRaVEo";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const steps = Array.from(form.querySelectorAll(".step"));
const totalSteps = steps.length;
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnSubmit = document.getElementById("btnSubmit");
const formError = document.getElementById("formError");
const formCard = document.getElementById("formCard");

let current = 0;

function renderStep() {
  steps.forEach((s, i) => s.classList.toggle("is-active", i === current));
  const pct = ((current + 1) / totalSteps) * 100;
  progressFill.style.width = pct + "%";
  progressLabel.textContent = `Passo ${current + 1} de ${totalSteps}`;
  btnPrev.hidden = current === 0;
  const isLast = current === totalSteps - 1;
  btnNext.hidden = isLast;
  btnSubmit.hidden = !isLast;
  clearError();
}

function validateStep(stepEl) {
  let valid = true;
  let firstInvalid = null;
  stepEl.querySelectorAll(".field").forEach((f) => f.classList.remove("is-invalid"));
  const requiredRadios = stepEl.querySelectorAll('input[type="radio"][required]');
  requiredRadios.forEach((radio) => {
    const name = radio.name;
    const checked = stepEl.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      valid = false;
      const field = radio.closest(".field");
      if (field) field.classList.add("is-invalid");
      if (!firstInvalid) firstInvalid = field;
    }
  });
  const requiredInputs = stepEl.querySelectorAll("input[required], textarea[required]");
  requiredInputs.forEach((inp) => {
    if (inp.type === "radio") return;
    if (!inp.value.trim()) {
      valid = false;
      const field = inp.closest(".field");
      if (field) field.classList.add("is-invalid");
      if (!firstInvalid) firstInvalid = field;
    }
  });
  if (!valid) {
    showError("Preenche os campos destacados pra continuar.");
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return valid;
}

function showError(msg) { formError.textContent = msg; formError.hidden = false; }
function clearError() { formError.hidden = true; formError.textContent = ""; }

btnNext.addEventListener("click", () => {
  if (!validateStep(steps[current])) return;
  if (current < totalSteps - 1) {
    current++;
    dl("form_etapa", { etapa: current + 1, etapas_total: totalSteps });
    renderStep();
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
btnPrev.addEventListener("click", () => {
  if (current > 0) {
    current--;
    renderStep();
    formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
form.addEventListener("input", (e) => {
  const field = e.target.closest(".field");
  if (field) field.classList.remove("is-invalid");
  clearError();
});
let formIniciado = false;
form.addEventListener("change", (e) => {
  const field = e.target.closest(".field");
  if (field) field.classList.remove("is-invalid");
  if (!formIniciado) {
    formIniciado = true;
    dl("form_iniciado", { etapa: current + 1, etapas_total: totalSteps });
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateStep(steps[current])) return;
  const fd = new FormData(form);
  const payload = {
    nome:              (fd.get("nome") || "").trim(),
    whatsapp:          (fd.get("whatsapp") || "").trim(),
    instagram:         (fd.get("instagram") || "").trim() || null,
    faturamento:       fd.get("faturamento"),
    funcionarios:      fd.get("funcionarios"),
    tempo_empresa:     fd.get("tempo_empresa"),
    horas_operacional: fd.get("horas_operacional"),
    ausencia_15dias:   fd.get("ausencia_15dias"),
    gargalo_area:      fd.get("gargalo_area"),
    gargalo:           (fd.get("gargalo") || "").trim() || null,
    urgencia:          fd.get("urgencia"),
    investimento:      fd.get("investimento"),
    porque_voce:       (fd.get("porque_voce") || "").trim() || null,
    status:            "novo",
    source:            "presell-esv",
    user_agent:        navigator.userAgent,
    referrer:          document.referrer || null,
  };
  payload.score = calcScore(payload);
  setSubmitting(true);
  clearError();
  try {
    const { error } = await supabase.from("mtx_mentoria_leads").insert([payload]);
    if (error) throw error;
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (_) {}
    const WA_NUM = "5551991443171";
    const WA_LABELS = {
      faturamento: { "ate-50k": "Até R$50k", "50-100k": "R$50–100k", "100-300k": "R$100–300k", "300-500k": "R$300–500k", "500k+": "R$500k+" },
      funcionarios: { "so-eu": "Só eu", "1-5": "1–5", "6-10": "6–10", "11-30": "11–30", "30+": "30+" },
      horas_operacional: { "menos-4h": "Menos de 4h/dia", "4-8h": "4–8h/dia", "8-12h": "8–12h/dia", "mais-12h": "Mais de 12h/dia" },
      ausencia_15dias: { "sim": "Roda sem mim", "trava": "Trava em poucos dias", "nunca-testei": "Nunca testei" },
      gargalo_area: { "tudo-passa-por-mim": "Tudo passa por mim", "equipe-nao-decide": "Equipe não decide sozinha", "sem-processo": "Falta processo", "sem-tempo": "Sem tempo pra estratégia", "outro": "Outro" },
      urgencia: { "agora": "Agora", "30d": "Próximos 30 dias", "90d": "Próximos 90 dias", "pesquisando": "Só pesquisando" },
      investimento: { "sim-avista": "Sim, à vista", "sim-parcelado": "Sim, parcelado", "preciso-organizar": "Preciso me organizar", "nao-agora": "Não agora" },
    };
    const waL = (f, v) => (WA_LABELS[f] && WA_LABELS[f][v]) || v || "—";
    const waLinhas = [
      "Olá! Acabei de me candidatar à mentoria *Empresa Sem Você*. 🪞",
      "",
      "*Nome:* " + (payload.nome || "—"),
      "*Meu WhatsApp:* " + (payload.whatsapp || "—"),
      "*Faturamento:* " + waL("faturamento", payload.faturamento),
      "*Funcionários:* " + waL("funcionarios", payload.funcionarios),
      "*Maior gargalo:* " + waL("gargalo_area", payload.gargalo_area) + (payload.gargalo ? " — " + payload.gargalo : ""),
      "*Quando quer resolver:* " + waL("urgencia", payload.urgencia),
      "*Pronto pra investir:* " + waL("investimento", payload.investimento),
    ];
    if (payload.instagram) waLinhas.push("*Instagram:* " + payload.instagram);
    const waMsg = waLinhas.join("\n");
    if (window.fbq) window.fbq("track", "Lead");
    // Só redireciona depois que o GTM disparar as tags (ou 1,2s, o que vier antes).
    const waUrl = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(waMsg);
    let redirecionou = false;
    const irPraWhats = () => {
      if (redirecionou) return;
      redirecionou = true;
      window.location.assign(waUrl);
    };
    dl("lead_enviado", {
      score: payload.score,
      faturamento: payload.faturamento,
      funcionarios: payload.funcionarios,
      tempo_empresa: payload.tempo_empresa,
      horas_operacional: payload.horas_operacional,
      urgencia: payload.urgencia,
      investimento: payload.investimento,
      gargalo_area: payload.gargalo_area,
      eventCallback: irPraWhats,
      eventTimeout: 1200,
    });
    setTimeout(irPraWhats, 1500);
  } catch (err) {
    console.error("Erro ao enviar candidatura:", err);
    setSubmitting(false);
    const detail = err && (err.message || err.hint || err.code) ? ` (${err.message || err.hint || err.code})` : "";
    showError("Não consegui enviar agora. Tenta de novo em instantes; seus dados continuam aqui." + detail);
  }
});

function setSubmitting(isLoading) {
  btnSubmit.disabled = isLoading;
  btnNext.disabled = isLoading;
  btnPrev.disabled = isLoading;
  btnSubmit.textContent = isLoading ? "Enviando…" : "Enviar candidatura";
}

const gargaloInput = document.getElementById("gargalo");
if (gargaloInput) {
  const exemplos = [
    "Ex: passo o dia apagando incêndio",
    "Ex: a equipe me chama pra tudo",
    "Ex: não consigo tirar férias",
  ];
  let gi = 0;
  gargaloInput.placeholder = exemplos[0];
  setInterval(() => {
    if (document.activeElement === gargaloInput || gargaloInput.value) return;
    gi = (gi + 1) % exemplos.length;
    gargaloInput.placeholder = exemplos[gi];
  }, 3000);
}

renderStep();

}
