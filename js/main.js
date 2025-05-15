document.getElementById('scrape-btn').onclick = async () => {
  const select = document.getElementById('brand-select');
  const slug = select.value;
  document.getElementById('spinner').hidden = false;
  const res = await fetch('https://ton-backend-url/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug })
  });
  const data = await res.json();
  document.getElementById('spinner').hidden = true;
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
};
