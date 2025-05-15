// 1) PUT YOUR RAILWAY BACKEND URL HERE:
const BACKEND = "https://YOUR-RAILWAY-URL.up.railway.app";

const brandsSelect = document.getElementById("brand");
const output     = document.getElementById("output");
const btn        = document.getElementById("scrape");

// 2) On page load, fetch all brands
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${BACKEND}/brands`);
    const list = await res.json();
    // clear placeholder
    brandsSelect.innerHTML = `<option value="">— choisissez —</option>`;
    for (const {name, slug} of list) {
      const o = document.createElement("option");
      o.value = slug;
      o.textContent = name;
      brandsSelect.append(o);
    }
  } catch (err) {
    brandsSelect.innerHTML = `<option value="">Erreur de chargement</option>`;
    console.error(err);
  }
});

btn.addEventListener("click", async () => {
  const slug = brandsSelect.value;
  if (!slug) {
    alert("Merci de choisir une marque.");
    return;
  }

  output.textContent = "⏳ Scraping en cours…";
  try {
    const resp = await fetch(`${BACKEND}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const data = await resp.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = `🚨 Erreur: ${err.message}`;
  }
});
