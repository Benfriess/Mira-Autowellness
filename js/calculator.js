/* Mira Autowellness — Preis-Rechner (clientseitig, ohne KI)
   Mischform: Innenreinigung, Außenreinigung & Autoaufbereitung (innen + außen) sowie
   Smart Repair = Richtpreis; Keramikversiegelung = individuelles Angebot.
   Richtpreise sind Platzhalter — der Inhaber kann die Zahlen unten jederzeit anpassen. */
(function () {
  "use strict";
  var form = document.getElementById("calcForm");
  if (!form) return;

  var WA = "4915115298007"; // WhatsApp-Nummer Mira Autowellness

  // --- Preis-Modell (EUR, [min, max]) — bei Bedarf anpassen ---
  var MODEL = {
    innen: {
      base: { klein: [70, 110], limo: [110, 160], suv: [150, 210], transporter: [190, 260] },
      extras: { shampoo: [40, 80], leder: [40, 70], ozon: [30, 50] }
    },
    aussen: {
      base: { klein: [90, 140], limo: [130, 190], suv: [170, 240], transporter: [210, 300] },
      extras: { politur: [50, 120], versiegelung: [30, 70] }
    },
    cond: { leicht: 0.9, normal: 1.0, stark: 1.25 },
    smart: {
      kratzer: [50, 100], delle: [100, 200], spot: [150, 350],
      felge_lack: [100, 250], felge_glanz: [200, 350], leder: [150, 300], hagel: null
    }
  };

  var L = {
    service: { innen: "Innenreinigung", aussen: "Außenreinigung", komplett: "Autoaufbereitung (innen + außen)", smart: "Smart Repair", keramik: "Keramikversiegelung" },
    size: { klein: "Kleinwagen", limo: "Limousine / Kombi", suv: "SUV / Van", transporter: "Transporter / Bus" },
    condition: { leicht: "leicht", normal: "normal", stark: "stark" },
    extras: { shampoo: "Polster-Shampoonierung", leder: "Lederreinigung & -pflege", ozon: "Ozonbehandlung" },
    extrasA: { politur: "Lackpolitur", versiegelung: "Lackversiegelung" },
    repair: { kratzer: "Kratzer entfernen", delle: "Delle (ohne Lackieren)", spot: "Lackschaden / Spot-Repair", felge_lack: "Felge lackiert", felge_glanz: "Felge hochglanz gedreht", leder: "Lederreparatur", hagel: "Hagelschaden" }
  };

  var elPrice = document.getElementById("calcPrice"),
      elSum = document.getElementById("calcSum"),
      elNote = document.getElementById("calcNote"),
      elTitle = document.getElementById("calcResultTitle"),
      elWa = document.getElementById("calcWa"),
      elMail = document.getElementById("calcMail"),
      elSendLabel = document.getElementById("calcSendLabel");

  function round5(n) { return Math.round(n / 5) * 5; }
  function val(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; }
  function checks(name) { return [].slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (e) { return e.value; }); }

  function render() {
    var service = val("service") || "innen";

    // passende Schritte ein-/ausblenden + neu nummerieren
    var n = 1;
    [].forEach.call(form.querySelectorAll(".calc__step"), function (fs) {
      var when = fs.getAttribute("data-when");
      var show = !when || when.split(",").indexOf(service) !== -1;
      fs.hidden = !show;
      if (show) { var num = fs.querySelector(".calc__num"); if (num) num.textContent = n++; }
    });

    var sum = [["Leistung", L.service[service]]];
    var priceHtml = "", anfrage = false;

    if (service === "innen" || service === "aussen" || service === "komplett") {
      var size = val("size") || "limo", cond = val("condition") || "normal";
      var m = MODEL.cond[cond], min = 0, max = 0, exUsed = [];
      // Grundpreis (innen, außen oder beides kombiniert)
      if (service === "innen" || service === "komplett") { var bi = MODEL.innen.base[size]; min += bi[0]; max += bi[1]; }
      if (service === "aussen" || service === "komplett") { var ba = MODEL.aussen.base[size]; min += ba[0]; max += ba[1]; }
      min *= m; max *= m;
      // Extras (innen-Extras bei innen/komplett, außen-Extras bei aussen/komplett)
      if (service === "innen" || service === "komplett") {
        checks("extras").forEach(function (k) { var e = MODEL.innen.extras[k]; min += e[0]; max += e[1]; exUsed.push(L.extras[k]); });
      }
      if (service === "aussen" || service === "komplett") {
        checks("extras_a").forEach(function (k) { var e = MODEL.aussen.extras[k]; min += e[0]; max += e[1]; exUsed.push(L.extrasA[k]); });
      }
      min = round5(min); max = round5(max);
      priceHtml = "ca. " + min + "–" + max + "&nbsp;<span class='cur'>€</span>";
      sum.push(["Fahrzeug", L.size[size]]);
      sum.push(["Zustand", L.condition[cond]]);
      if (exUsed.length) sum.push(["Extras", exUsed.join(", ")]);
    } else if (service === "smart") {
      var type = val("repair") || "kratzer", r = MODEL.smart[type];
      sum.push(["Art", L.repair[type]]);
      if (r) priceHtml = "ca. " + r[0] + "–" + r[1] + "&nbsp;<span class='cur'>€</span>";
      else { priceHtml = "individuell"; anfrage = true; }
    } else { // keramik
      anfrage = true; priceHtml = "Individuelles Angebot";
      var s2 = val("size"); if (s2) sum.push(["Fahrzeug", L.size[s2]]);
    }

    elTitle.textContent = L.service[service];
    elPrice.innerHTML = priceHtml;
    elPrice.classList.toggle("is-anfrage", anfrage);
    elSum.innerHTML = sum.map(function (row) { return "<li><span>" + row[0] + "</span><span>" + row[1] + "</span></li>"; }).join("");
    elNote.textContent = anfrage
      ? "Für die Keramikversiegelung erstellen wir dir ein individuelles Angebot nach Lackzustand – sende uns einfach deine Auswahl."
      : "Unverbindlicher Richtwert. Der finale Festpreis hängt vom Zustand ab und wird vor Ort bzw. per WhatsApp bestätigt.";

    var lines = ["Hallo Mira Autowellness, ich interessiere mich für: " + L.service[service] + "."];
    sum.slice(1).forEach(function (row) { lines.push(row[0] + ": " + row[1]); });
    lines.push(anfrage ? "Bitte um ein individuelles Angebot." : "Geschätzter Richtpreis: " + elPrice.textContent.trim() + ".");
    lines.push("Bitte um einen Termin. Danke!");
    var text = lines.join("\n");
    var subject = (anfrage ? "Angebotsanfrage: " : "Preisanfrage: ") + L.service[service];
    elWa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
    elMail.href = "mailto:info@mira-autowellness.de?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    elSendLabel.textContent = anfrage ? "Angebot anfragen" : "Auswahl senden";
  }

  // Info-Buttons bei den Extras / Schadenarten ein-/ausklappen
  form.addEventListener("click", function (e) {
    var btn = e.target.closest(".opt__i");
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    var desc = btn.closest(".opt__box").querySelector(".opt__desc");
    if (!desc) return;
    if (desc.hasAttribute("hidden")) { desc.removeAttribute("hidden"); btn.setAttribute("aria-expanded", "true"); }
    else { desc.setAttribute("hidden", ""); btn.setAttribute("aria-expanded", "false"); }
  });

  form.addEventListener("change", render);
  render();
})();
