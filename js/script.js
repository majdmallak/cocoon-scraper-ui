// Adresse de votre backend sur Railway (ou localhost:8000 si dev local)
const API_URL = "https://your-railway-app.up.railway.app/scrape";

document.getElementById("scrape").addEventListener("click", async () => {
  const slug = document.getElementById("brand").value.trim();
  if (!slug) {
    alert("Merci d’entrer un slug de marque.");
    return;
  }

  document.getElementById("output").textContent = "⏳ Scraping en cours…";
  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!resp.ok) {
      throw new Error(`Erreur ${resp.status}: ${await resp.text()}`);
    }
    const data = await resp.json();
    document.getElementById("output").textContent =
      JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById("output").textContent =
      `🚨 Erreur: ${err.message}`;
  }
});
