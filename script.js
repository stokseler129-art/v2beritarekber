// ================= CONFIG =================
const API_URL = "https://api.jsonbin.io/v3/b/6a119f136610dd3ae891d967/latest";
const API_KEY = "$2a$10$b7426vCN3qvmHEGqIaeofuk0b.FXiKdEHj3Nh3zapOGnat.kn3TaW";

// ================= GLOBAL DATA =================
let allPosts = [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadAllData();
  setupNavbarFilter();
  setupSearch(); // 🔥 TAMBAHAN
});

// ================= FETCH =================
async function loadAllData() {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "X-Master-Key": API_KEY,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    const posts = data?.record?.posts;

    if (!posts || posts.length === 0) {
      setError("Data kosong dari JSONBin");
      return;
    }

    allPosts = posts;

    loadHero(posts);
    renderNews(posts);
    loadTrending(posts);

  } catch (err) {
    console.error("ERROR BESAR:", err);
    setError("Gagal mengambil data");
  }
}

// ================= HERO (FIX KLIK) =================
function loadHero(posts) {
  const headline = posts.find(p => p.isHeadline === true);

  if (!headline) {
    setError("Tidak ada berita headline");
    return;
  }

  const container = document.getElementById("hero-container");

  if (!container) return;

  container.innerHTML = `
    <a href="detail.html?id=${headline.id}" class="hero-link">
      <div class="hero-image">
        <img src="${headline.image}" alt="headline">

        <div class="hero-overlay">
          <span class="category">${headline.category}</span>
          <h1>${headline.title}</h1>
          <p>${headline.description}</p>
        </div>
      </div>
    </a>
  `;
}

// ================= NEWS GRID =================
function renderNews(posts) {
  const container = document.getElementById("news-container");

  if (!container) return;

  const newsList = posts.filter(p => !p.isHeadline);

  if (newsList.length === 0) {
    container.innerHTML = "<p style='padding:10px;'>Tidak ada berita</p>";
    return;
  }

  container.innerHTML = newsList.map(post => `
    <a href="detail.html?id=${post.id}" class="news-card">

      <img src="${post.image}" alt="news">

      <div class="news-content">
        <span class="category">${post.category}</span>
        <h3>${post.title}</h3>
        <p>${(post.excerpt || post.description || "").substring(0, 100)}...</p>
      </div>

    </a>
  `).join("");
}

// ================= FILTER NAVBAR =================
function setupNavbarFilter() {
  const menuItems = document.querySelectorAll(".navbar a");

  menuItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const category = item.textContent.trim();

      filterByCategory(category);
    });
  });
}

function filterByCategory(category) {
  if (!allPosts.length) return;

  const filtered = allPosts.filter(post => post.category === category);

  renderNews(filtered);
}

// ================= SEARCH 🔥 =================
function setupSearch() {
  const input = document.getElementById("search-input");

  if (!input) return;

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();

    const filtered = allPosts.filter(post =>
      post.title.toLowerCase().includes(keyword) ||
      (post.description || "").toLowerCase().includes(keyword)
    );

    renderNews(filtered);
  });
}

// ================= TRENDING =================
function loadTrending(posts) {
  const container = document.getElementById("trending-container");
  if (!container) return;

  let trending = posts.filter(p => p.isTrending === true);

  // 🔥 fallback kalau tidak ada trending
  if (trending.length === 0) {
    trending = [...posts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }

  // 🔥 batasi max 6
  trending = trending.slice(0, 6);

  container.innerHTML = trending.map(post => `
    <a href="detail.html?id=${post.id}" class="trending-item">
      <img src="${post.image}" alt="${post.title}">
      <div class="trending-content">
        <h4>${post.title}</h4>
        <span>${post.category}</span>
      </div>
    </a>
  `).join("");
}

// ================= ERROR =================
function setError(message) {
  const container = document.getElementById("hero-container");

  if (!container) return;

  container.innerHTML = `
    <p style="padding:10px; color:red;">
      ⚠️ ${message}
    </p>
  `;
}
