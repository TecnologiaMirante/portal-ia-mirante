/**
 * Email service — sem chamada ativa do browser.
 * Os e-mails são enviados automaticamente pela Cloud Function
 * "sendInscricaoEmail" que escuta novos documentos em premioInscricoes/.
 *
 * Este módulo existe apenas para manter a interface de chamada no formulário
 * sem precisar alterar PremioIAPage.jsx.
 */

export async function sendInscricaoEmails() {
  // E-mails são disparados pelo trigger Firestore na Cloud Function.
  // Nenhuma ação necessária aqui.
  return { sent: true };
}
