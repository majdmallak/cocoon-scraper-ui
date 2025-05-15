// 1) YOUR RAILWAY BACKEND (must include https://)
const BACKEND = "https://cocoon-scraper-backend-production.up.railway.app";

const sel = document.getElementById("brand");
const out = document.getElementById("output");
const btn = document.getElementById("scrape");

// JS slugify (remove accents → lowercase → non-alnum→dash)
function slugify(s) {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// 2) On load, fetch marques_clean.csv and fill <select>
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const txt = await fetch("marques_clean.csv").then(r => {
      if (!r.ok) throw new Error("CSV not found");
      return r.text();
    });
    const lines = txt.trim().split("\n");
    // header line: skip it
    sel.innerHTML = `<option value="">— choisissez —</option>`;
    for (let line of lines.slice(1)) {
      const [name] = line.split(","); // if your CSV uses semicolons, use .split(";") here
      const slug = slugify(name);
      const opt  = new Option(name, slug);
      sel.append(opt);
    }
  } catch (e) {
    sel.innerHTML = `<option>Erreur chargement</option>`;
    console.error(e);
  }
});

// 3) On click => POST /scrape and offer CSV download
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
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const data = await resp.json();
    if (data.length === 0) {
      out.textContent = "Aucun produit trouvé.";
      return;
    }

    // Convert JSON → CSV lines
    const keys = Object.keys(data[0]);
    const rows = [
      keys.join(","),
      ...data.map(obj =>
        keys.map(k => `"${(obj[k]||"").toString().replace(/"/g,'""')}"`)
            .join(",")
      )
    ];
    const blob = new Blob([rows.join("\r\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);

    // Show download link
    out.innerHTML = "";
    const a = document.createElement("a");
    a.href        = url;
    a.download    = `cocoon_${slug}_${Date.now()}.csv`;
    a.textContent = "📥 Télécharger les résultats (CSV)";
    out.appendChild(a);

  } catch (err) {
    out.innerHTML = `<span style="color:red">🚨 Erreur : ${err.message}</span>`;
    console.error(err);
  }
});
