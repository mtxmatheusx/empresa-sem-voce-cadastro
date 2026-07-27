// Notificação por email de nova candidatura (via Resend).
// Ativa quando RESEND_API_KEY/NOTIFY_TO/NOTIFY_FROM existem na Vercel. Sem elas, no-op.
// O form chama POST /api/notify com o payload do lead APÓS o insert no Supabase.
// (O registro do lead é o insert no Supabase — feito no script.js do cliente.)
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const KEY = process.env.RESEND_API_KEY;
  const TO = process.env.NOTIFY_TO;
  const FROM = process.env.NOTIFY_FROM;
  if (!KEY || !TO || !FROM) {
    return res.status(200).json({ ok: true, emailed: false }); // no-op sem chave
  }
  try {
    const lead = req.body || {};
    const linhas = Object.entries(lead)
      .filter(([k]) => !["user_agent", "referrer"].includes(k))
      .map(([k, v]) => `<b>${k}:</b> ${v == null ? "—" : String(v)}`)
      .join("<br>");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: TO,
        subject: `Nova candidatura — ${lead.nome || "sem nome"}`,
        html: `<h2>Nova candidatura · Empresa Sem Você</h2>${linhas}`,
      }),
    });
    return res.status(200).json({ ok: true, emailed: true });
  } catch (e) {
    return res.status(200).json({ ok: true, emailed: false }); // best-effort
  }
};
