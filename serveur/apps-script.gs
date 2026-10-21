/* =====================================================================
   RELAIS DU MARIAGE - Google Apps Script (classeur Google Sheets)
   Reçoit les confirmations de présence et les mots du livre d'or envoyés
   par le site et les écrit dans VOTRE classeur Google Sheets :
     - onglet "Confirmation de presence"
     - onglet "Livre d'or"
   Mode d'emploi : voir GUIDE-GOOGLE-SHEETS.txt
   ===================================================================== */

var FUSEAU = "Africa/Abidjan";

// Les onglets sont retrouvés grâce à un mot de leur nom (sans tenir compte des accents ni des majuscules).
// S'ils n'existent pas, ils sont créés.
var ONGLETS = {
  presence: { mot: "confirmation", nom: "Confirmation de presence", entetes: ["Date", "Nom", "Réponse", "Nombre de personnes"] },
  voeu:     { mot: "livre",        nom: "Livre d'or",               entetes: ["Date", "Nom", "Message", "Visible"] }
};

var P = PropertiesService.getScriptProperties();

/* ---------- Réception des envois du site ---------- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse(e.postData.contents);
    var nom = nettoyer(d.name, 80);
    if (!nom) return reponse({ ok: false, error: "nom manquant" });
    var quand = Utilities.formatDate(new Date(), FUSEAU, "dd/MM/yyyy HH:mm");

    if (d.type === "presence") {
      var present = d.attending === true;
      var n = Math.max(1, Math.min(20, parseInt(d.guests, 10) || 1));
      feuille("presence").appendRow([quand, nom, present ? "Présent" : "Absent", present ? n : 0]);
      prevenir("presence", present
        ? "✅ Nouvelle confirmation\n👤 " + nom + "\n👥 " + n + " personne" + (n > 1 ? "s" : "") + "\nSera présent(e)"
        : "❌ Absence annoncée\n👤 " + nom + "\nNe pourra pas venir");

    } else if (d.type === "voeu") {
      var msg = nettoyer(d.message, 1000);
      if (!msg) return reponse({ ok: false, error: "message manquant" });
      feuille("voeu").appendRow([quand, nom, msg, "oui"]);
      prevenir("voeu", "💌 Nouveau mot pour le livre d'or\n👤 " + nom + "\n\n" + msg);

    } else {
      return reponse({ ok: false, error: "type inconnu" });
    }
    return reponse({ ok: true });
  } catch (err) {
    return reponse({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ---------- Lecture du livre d'or (affiché sur le site) ---------- */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === "voeux") {
    var lignes = feuille("voeu").getDataRange().getValues();
    var liste = [];
    for (var i = 1; i < lignes.length; i++) {
      // pour masquer un message : écrivez "non" dans la colonne Visible
      if (String(lignes[i][3]).toLowerCase() !== "non" && lignes[i][2]) {
        liste.push({ n: String(lignes[i][1]), m: String(lignes[i][2]) });
      }
    }
    return reponse({ ok: true, voeux: liste.slice(-200) });
  }
  return reponse({ ok: true });
}

/* ---------- Outils ---------- */
function sansAccent(t) {
  return String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function feuille(type) {
  var cfg = ONGLETS[type];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var toutes = ss.getSheets(), sh = null;
  for (var i = 0; i < toutes.length; i++) {
    if (sansAccent(toutes[i].getName()).indexOf(cfg.mot) > -1) { sh = toutes[i]; break; }
  }
  if (!sh) sh = ss.insertSheet(cfg.nom);
  if (sh.getLastRow() === 0) preparer(sh, cfg, type);     // onglet vide : on écrit les titres de colonnes
  return sh;
}

function preparer(sh, cfg, type) {
  sh.getRange(1, 1, 1, cfg.entetes.length).setValues([cfg.entetes])
    .setFontWeight("bold").setBackground("#0d3a25").setFontColor("#ffffff");
  sh.setFrozenRows(1);
  sh.setColumnWidth(1, 130);
  sh.setColumnWidth(2, 190);
  if (type === "presence") {
    sh.setColumnWidth(3, 110);
    sh.setColumnWidth(4, 170);
    sh.getRange("F1").setValue("Total des personnes présentes :").setFontWeight("bold");
    sh.getRange("G1").setFormula('=SUMIF(C:C,"Présent",D:D)').setFontWeight("bold");
  } else {
    sh.setColumnWidth(3, 520);
    sh.setColumnWidth(4, 80);
    sh.getRange("C:C").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  }
}

function nettoyer(t, max) {
  var v = String(t == null ? "" : t).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;          // empêche les formules dans la feuille
}

function reponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Facultatif : être prévenu sur Telegram et/ou par e-mail ----------
   Rien à faire si vous voulez seulement le tableau Google Sheets.
   (Propriétés du script : TELEGRAM_TOKEN, CHAT_PRESENCES, CHAT_LIVRE_OR, EMAIL) */
function prevenir(type, texte) {
  var token = P.getProperty("TELEGRAM_TOKEN");
  var chat = P.getProperty(type === "presence" ? "CHAT_PRESENCES" : "CHAT_LIVRE_OR");
  if (token && chat) {
    try {
      UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage",
        { method: "post", payload: { chat_id: chat, text: texte }, muteHttpExceptions: true });
    } catch (e) {}
  }
  var mail = P.getProperty("EMAIL");
  if (mail) {
    try { MailApp.sendEmail(mail, type === "presence" ? "Mariage : confirmation de présence" : "Mariage : livre d'or", texte); } catch (e) {}
  }
}

/* ---------- À lancer une fois à la main pour vérifier ---------- */
// Ajoute une ligne d'essai dans chaque onglet (vous pouvez ensuite les supprimer).
function testerLeClasseur() {
  var quand = Utilities.formatDate(new Date(), FUSEAU, "dd/MM/yyyy HH:mm");
  feuille("presence").appendRow([quand, "TEST - à supprimer", "Présent", 2]);
  feuille("voeu").appendRow([quand, "TEST - à supprimer", "Ceci est un message d'essai.", "oui"]);
}
