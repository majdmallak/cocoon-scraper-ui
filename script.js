// script.js

// 1) YOUR RAILWAY BACKEND (include protocol)
const BACKEND = "https://cocoon-scraper-backend-production.up.railway.app";

const sel = document.getElementById("brand");
const out = document.getElementById("output");
const btn = document.getElementById("scrape");

// simple slugify for brand → slug
function slugify(s) {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    // load the exact same CSV you ship in this repo
    const txt = await fetch("marques_clean.csv").then(r => {
      if (!r.ok) throw new Error("CSV introuvable");
      return r.text();
    });
    const lines = txt.trim().split("\n");
    sel.innerHTML = `<option value="">— choisissez —</option>`;

    for (let line of lines.slice(1)) {
      // split into [index, name]
      const [, name] = line.split(",");
      const slug     = slugify(name);
      const opt      = new Option(name, slug);
      sel.append(opt);
    }
  } catch (e) {
    sel.innerHTML = `<option>Erreur de chargement</option>`;
    console.error(e);
  }
});

btn.addEventListener("click", async () => {
  const slug = sel.value;
  if (!slug) {
    alert("Merci de choisir une marque.");
    return;
  }

  out.textContent = "⏳ Scraping en cours…";
  try {
    const resp = await fetch(`${BACKEND}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });
    if (!resp.ok) throw new Error(await resp.text());

    const data = await resp.json();
    if (data.length === 0) {
      out.textContent = "Aucun produit trouvé.";
      return;
    }

    // JSON → CSV
    const keys = Object.keys(data[0]);
    const rows = [
      keys.join(","),
      ...data.map(obj =>
        keys.map(k =>
          `"${(obj[k]||"").toString().replace(/"/g,'""')}"`
        ).join(",")
      )
    ];
    const blob = new Blob([rows.join("\r\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);

    out.innerHTML = "";
    const a = document.createElement("a");
    a.href     = url;
    a.download = `cocoon_${slug}_${Date.now()}.csv`;
    a.textContent = "📥 Télécharger les résultats (CSV)";
    out.appendChild(a);

  } catch (err) {
    out.innerHTML = `<span style="color:red">🚨 Erreur : ${err.message}</span>`;
    console.error(err);
  }
});
