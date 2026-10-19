const productsEl = document.querySelector("#products");
const statusEl = document.querySelector("#status");
const searchEl = document.querySelector("#search");
const categoryEl = document.querySelector("#category");
document.querySelector("#year").textContent = new Date().getFullYear();
let allProducts = [];

function money(item) {
  // Provider's API states priceUsd and currency in the returned catalog.
  if (item.priceUsd != null) return `$${Number(item.priceUsd).toFixed(2)}`;
  if (item.price != null && item.currency === "IDR") return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(item.price));
  if (item.price != null) return String(item.price);
  return "Hubungi admin";
}
function getItems(payload) {
  const candidates = [payload?.data?.items, payload?.items, payload?.data?.products, payload?.products, payload?.data];
  return candidates.find(Array.isArray) || [];
}
function safeImage(url) {
  if (!url) return "";
  try {
    const absolute = new URL(url, "https://dripclientofficial.dev");
    return absolute.protocol === "https:" ? absolute.href : "";
  } catch { return ""; }
}
function render() {
  const term = searchEl.value.trim().toLowerCase();
  const category = categoryEl.value;
  const filtered = allProducts.filter(p => {
    const text = `${p.name||""} ${p.product||""} ${p.label||""} ${p.description||""}`.toLowerCase();
    return text.includes(term) && (!category || (p.category || "Lainnya") === category);
  });
  productsEl.replaceChildren();
  if (!filtered.length) {
    productsEl.innerHTML = '<div class="empty">Tidak ada produk yang cocok dengan pencarian.</div>';
    return;
  }
  for (const p of filtered) {
    const card = document.createElement("article");
    card.className = "product";
    const art = document.createElement("div"); art.className = "product-art";
    const imgUrl = safeImage(p.imageUrl);
    if (imgUrl) {
      const img = document.createElement("img"); img.src = imgUrl; img.alt = p.product || p.name || "Produk"; img.loading = "lazy";
      img.onerror = () => { art.replaceChildren(); const icon = document.createElement("span"); icon.className = "product-icon"; icon.textContent = "✦"; art.append(icon); };
      art.append(img);
    } else { const icon = document.createElement("span"); icon.className = "product-icon"; icon.textContent = "✦"; art.append(icon); }
    const body = document.createElement("div"); body.className = "product-body";
    const tag = document.createElement("div"); tag.className = "category-tag"; tag.textContent = p.category || "Digital";
    const title = document.createElement("h3"); title.textContent = p.name || p.label || p.product || "Produk digital";
    const desc = document.createElement("p"); desc.textContent = p.label ? `${p.label}${p.version ? " • "+p.version : ""}` : (p.description || "Produk digital gaming").slice(0,100);
    const bottom = document.createElement("div"); bottom.className = "product-bottom";
    const price = document.createElement("span"); price.className = "price"; price.textContent = money(p);
    const stock = document.createElement("span"); stock.className = "stock" + ((p.inStock === false || p.is_maintenance === true || Number(p.stock) === 0) ? " off" : "");
    stock.textContent = (p.inStock === false || p.is_maintenance === true || Number(p.stock) === 0) ? "Habis" : "Tersedia";
    bottom.append(price, stock); body.append(tag,title,desc,bottom); card.append(art,body); productsEl.append(card);
  }
}
async function loadProducts() {
  statusEl.textContent = "Mengambil katalog produk...";
  productsEl.replaceChildren();
  try {
    const response = await fetch("/api/products", { headers: { "Accept": "application/json" }, cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Gagal memuat produk.");
    allProducts = getItems(payload);
    if (!allProducts.length) throw new Error("Respons API tidak berisi daftar produk yang dikenali.");
    const categories = [...new Set(allProducts.map(p => p.category || "Lainnya"))].sort();
    categoryEl.replaceChildren(new Option("Semua kategori", ""));
    categories.forEach(c => categoryEl.add(new Option(c,c)));
    statusEl.textContent = `${allProducts.length} produk ditemukan`;
    render();
  } catch (err) {
    statusEl.textContent = err.message || "Katalog belum bisa dimuat.";
    productsEl.innerHTML = '<div class="empty">Periksa konfigurasi API dan API key di environment variables server, lalu tekan “Muat ulang”.</div>';
  }
}
searchEl.addEventListener("input", render);
categoryEl.addEventListener("change", render);
document.querySelector("#refresh").addEventListener("click", loadProducts);
loadProducts();