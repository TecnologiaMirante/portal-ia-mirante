/**
 * Cloud Function — sendInscricaoEmail
 * Dispara automaticamente quando uma nova inscrição é criada no Firestore.
 * Usa Nodemailer + Gmail SMTP (senha de app).
 *
 * Secrets necessários (configure uma vez):
 *   firebase functions:secrets:set GMAIL_USER
 *   firebase functions:secrets:set GMAIL_PASS
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret }      = require("firebase-functions/params");
const nodemailer            = require("nodemailer");

/* ── Secrets ────────────────────────────────────────────── */
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

/* ── Helpers de template ─────────────────────────────────── */
function row(label, val) {
  return `
  <tr>
    <td style="padding:11px 0;border-bottom:1px solid #3f3f46;">
      <div style="color:#71717a;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:3px;">${label}</div>
      <div style="color:#f4f4f5;font-size:13px;line-height:1.5;">${val || "—"}</div>
    </td>
  </tr>`;
}

function section(title, content) {
  return `
  <div style="margin-bottom:28px;">
    <h3 style="margin:0 0 14px;color:#d97706;font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">${title}</h3>
    ${content}
  </div>`;
}

/* ── Template HTML ──────────────────────────────────────── */
function buildEmailHtml({ toName, type, data }) {
  const isTeam    = type === "team";
  const isCoautor = type === "coautor";

  const message = isTeam
    ? `Nova inscrição recebida de <strong>${data.participantName}</strong> (${data.participantDept}). Acesse o painel admin para avaliar.`
    : isCoautor
    ? `Você foi incluído como coautor na inscrição de <strong>${data.participantName}</strong> para o Prêmio IA Mirante 2026. Obrigado pela sua contribuição!`
    : `Sua inscrição foi recebida com sucesso! Nossa banca avaliadora analisará seu caso em breve. Obrigado por participar do Prêmio IA Mirante 2026!`;

  const coautoresHtml = (data.coautores ?? []).length
    ? data.coautores.map((c) =>
        `<span style="display:block;color:#f4f4f5;font-size:13px;margin-bottom:2px;">
          • ${c.name || "—"}${c.role ? ` (${c.role})` : ""} — ${c.email || ""}
        </span>`).join("")
    : `<span style="color:#71717a;font-size:13px;">—</span>`;

  /* Bloco de edição — só para participante e coautores */
  const editBlock = !isTeam && data.editUrl ? `
  <div style="background:#1c1917;border:1px solid #44403c;border-radius:12px;padding:20px 22px;margin-bottom:32px;">
    <p style="margin:0 0 6px;color:#d97706;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">🔗 Link para editar a inscrição</p>
    <p style="margin:0 0 12px;color:#a8a29e;font-size:12px;line-height:1.6;">
      Se precisar corrigir ou complementar as informações, acesse o link abaixo. Guarde-o — ele é único e intransferível.
    </p>
    <a href="${data.editUrl}"
       style="display:inline-block;background:#292524;border:1px solid #57534e;color:#fbbf24;text-decoration:none;font-size:12px;font-weight:600;padding:10px 20px;border-radius:8px;word-break:break-all;">
      ✏️ Editar minha inscrição
    </a>
    <p style="margin:10px 0 0;color:#57534e;font-size:10px;">
      Backup — ID da inscrição: <span style="font-family:monospace;color:#78716c;">${data.docId}</span><br/>
      Token: <span style="font-family:monospace;color:#78716c;">${data.editToken || ""}</span>
    </p>
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f11;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#b45309,#78350f);border-radius:20px 20px 0 0;padding:40px 40px 32px;text-align:center;">
      <div style="font-size:44px;line-height:1;margin-bottom:12px;">🏆</div>
      <h1 style="margin:0;color:#fef3c7;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Prêmio IA Mirante</h1>
      <p style="margin:8px 0 0;color:#fde68a;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Edição 2026</p>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background:#18181b;border-radius:0 0 20px 20px;padding:36px 40px;">

      <p style="margin:0 0 4px;color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Olá,</p>
      <h2 style="margin:0 0 24px;color:#f4f4f5;font-size:20px;font-weight:700;">${toName} ✨</h2>

      <!-- Mensagem principal -->
      <div style="background:#27272a;border-left:3px solid #d97706;border-radius:0 12px 12px 0;padding:18px 22px;margin-bottom:32px;">
        <p style="margin:0;color:#e4e4e7;font-size:14px;line-height:1.75;">${message}</p>
      </div>

      <!-- Link de edição (participante / coautor) -->
      ${editBlock}

      <!-- Dados do participante -->
      ${section("📋 Dados do Participante", `<table width="100%" cellpadding="0" cellspacing="0">
        ${row("Participante", `<strong>${data.participantName}</strong>`)}
        ${row("Cargo · Área", `${data.participantRole} · ${data.participantDept}`)}
        ${row("Gestor", data.manager)}
        ${row("E-mail", data.participantEmail)}
        ${row("Ferramentas de IA", data.tools)}
        ${row("Coautores", coautoresHtml)}
        ${row("ID da Inscrição", `<span style="font-family:monospace;color:#a78bfa;font-size:12px;">${data.docId}</span>`)}
      </table>`)}

      <!-- Desafio -->
      ${data.challenge ? section("🎯 Desafio / Problema", `
        <div style="background:#27272a;border-radius:10px;padding:16px 18px;">
          <p style="margin:0;color:#d4d4d8;font-size:13px;line-height:1.75;">${data.challenge.replace(/\n/g, "<br/>")}</p>
        </div>`) : ""}

      <!-- Uso da IA -->
      ${data.application ? section("⚡ Como a IA Foi Aplicada", `
        <div style="background:#27272a;border-radius:10px;padding:16px 18px;">
          <p style="margin:0;color:#d4d4d8;font-size:13px;line-height:1.75;">${data.application.replace(/\n/g, "<br/>")}</p>
        </div>
        ${data.frequency ? `<p style="margin:10px 0 0;color:#71717a;font-size:12px;">Frequência: <span style="color:#e4e4e7;">${data.frequency}</span></p>` : ""}`) : ""}

      <!-- Resultados -->
      ${data.results ? section("📊 Resultados Obtidos", `
        <div style="background:#27272a;border-radius:10px;padding:16px 18px;">
          <p style="margin:0;color:#d4d4d8;font-size:13px;line-height:1.75;">${data.results.replace(/\n/g, "<br/>")}</p>
        </div>
        ${data.timeGain ? `<p style="margin:10px 0 0;color:#71717a;font-size:12px;">Ganho de tempo: <span style="color:#e4e4e7;">${data.timeGain}</span></p>` : ""}
        ${data.indicators ? `<p style="margin:6px 0 0;color:#71717a;font-size:12px;">Indicadores: <span style="color:#e4e4e7;">${data.indicators}</span></p>` : ""}`) : ""}

      <!-- Resumo -->
      ${section("💡 Resumo do Caso", `
        <div style="background:#27272a;border-radius:12px;padding:20px 22px;">
          <p style="margin:0;color:#d4d4d8;font-size:14px;line-height:1.75;font-style:italic;">"${data.summary || "—"}"</p>
        </div>`)}

      <!-- CTA -->
      <div style="text-align:center;margin-top:8px;">
        <a href="${data.portalUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#b45309,#92400e);color:#fef3c7;text-decoration:none;font-size:14px;font-weight:700;padding:15px 36px;border-radius:12px;">
          🏆 Acessar Portal Prêmio IA
        </a>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:28px 0;text-align:center;">
      <p style="margin:0;color:#52525b;font-size:12px;">© 2026 Grupo Mirante · Prêmio IA Mirante</p>
      <p style="margin:5px 0 0;color:#3f3f46;font-size:11px;">E-mail gerado automaticamente. Não responda.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ── Trigger: dispara ao criar documento em premioInscricoes ── */
exports.sendInscricaoEmail = onDocumentCreated(
  {
    document: "premioInscricoes/{docId}",
    region:   "southamerica-east1",
    secrets:  [GMAIL_USER, GMAIL_PASS],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const form  = snap.data();
    const docId = event.params.docId;

    const transporter = nodemailer.createTransport({
      host:   "smtp.gmail.com",
      port:   587,
      secure: false,
      auth: {
        user: GMAIL_USER.value(),
        pass: GMAIL_PASS.value(),
      },
    });

    const tools = [
      ...(form.tools ?? []),
      form.toolOther ? `Outra: ${form.toolOther}` : "",
    ].filter(Boolean).join(", ");

    const editUrl = form.editToken
      ? `https://portal-ia-mirante.web.app/premio-ia/editar/${docId}?token=${form.editToken}`
      : null;

    const emailData = {
      participantName:  form.name,
      participantRole:  form.role,
      participantDept:  form.dept,
      participantEmail: form.email,
      manager:          form.manager,
      tools,
      summary:          form.summary,
      challenge:        form.challenge,
      application:      form.application,
      frequency:        form.frequency,
      results:          form.results,
      timeGain:         form.timeGain,
      indicators:       form.indicators,
      coautores:        form.coautores ?? [],
      docId,
      editToken:        form.editToken,
      editUrl,
      portalUrl:        "https://portal-ia-mirante.web.app/premio-ia",
    };

    const sends = [
      /* 1. Equipe Mirante */
      transporter.sendMail({
        from:    `"Prêmio IA Mirante" <${GMAIL_USER.value()}>`,
        to:      "team@mirante.com.br",
        subject: `🏆 Nova Inscrição — ${form.name} (${form.dept})`,
        html:    buildEmailHtml({ toName: "Equipe Mirante", type: "team", data: emailData }),
      }),

      /* 2. Participante */
      transporter.sendMail({
        from:    `"Prêmio IA Mirante" <${GMAIL_USER.value()}>`,
        to:      form.email,
        subject: `🏆 Inscrição recebida — Prêmio IA Mirante 2026`,
        html:    buildEmailHtml({ toName: form.name, type: "participant", data: emailData }),
      }),
    ];

    /* 3. Cada coautor */
    for (const c of (form.coautores ?? [])) {
      if (c.email) {
        sends.push(transporter.sendMail({
          from:    `"Prêmio IA Mirante" <${GMAIL_USER.value()}>`,
          to:      c.email,
          subject: `🏆 Você foi incluído como coautor — Prêmio IA Mirante 2026`,
          html:    buildEmailHtml({ toName: c.name || c.email, type: "coautor", data: emailData }),
        }));
      }
    }

    const results = await Promise.allSettled(sends);
    const failed  = results.filter((r) => r.status === "rejected");
    if (failed.length) {
      console.warn(`[Email] ${failed.length} falha(s):`, failed.map((r) => r.reason?.message));
    } else {
      console.log(`[Email] ${results.length} e-mail(s) enviados para inscrição ${docId}`);
    }
  },
);
