// 1) YOUR RAILWAY BACKEND (include the https://)
const BACKEND = "https://cocoon-scraper-backend-production.up.railway.app";

// DOM references
const sel  = document.getElementById("brand");
const out  = document.getElementById("output");
const btn  = document.getElementById("scrape");

// slugify in JS (strip accents + down-case + non-alnum→-)
function slugify(s) {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// 2) Load marques_clean.csv and populate dropdown
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const txt = await fetch("marques_clean.csv").then(r => r.text());
    const lines = txt.trim().split("\n");
    // assume header is "name" (if your CSV has more columns, adjust)
    sel.innerHTML = `<option value="">— choisissez —</option>`;
    for (let line of lines.slice(1)) {
      const name = line.split(",")[0];
      const slug = slugify(name);
      const opt  = new Option(name, slug);
      sel.append(opt);
    }
  } catch (e) {
    sel.innerHTML = `<option>Erreur de chargement</option>`;
    console.error(e);
  }
});

// 3) When clicking “Lancer le scraping…”
btn.addEventListener("click", async () => {
  const slug = sel.value;
  if (!slug) {
    alert("Merci de choisir une marque.");
    return;
  }

  out.textContent = "⏳ Scraping en cours…";
  try {
    const resp = await fetch(`${BACKEND}/scrape`, {
      method:  "POST",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({ slug })
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const data = await resp.json();

    // 4) Convert JSON → CSV
    if (!data.length) {
      out.textContent = "Aucun produit retourné.";
      return;
    }
    const keys = Object.keys(data[0]);
    const csvLines = [
      keys.join(","),
      ...data.map(obj =>
        keys.map(k =>
          `"${(obj[k]||"").toString().replace(/"/g,'""')}"`
        ).join(",")
      )
    ];
    const csvBlob = new Blob([csvLines.join("\r\n")], { type:"text/csv" });
    const url     = URL.createObjectURL(csvBlob);

    // 5) Offer download link
    out.innerHTML = "";
    const a = document.createElement("a");
    a.href        = url;
    a.download    = `cocoon_${slug}_${Date.now()}.csv`;
    a.textContent = "📥 Télécharger les résultats en CSV";
    out.appendChild(a);

  } catch (err) {
    out.textContent = `🚨 Erreur : ${err.message}`;
    console.error(err);
  }
});
