// ================= CONFIG =================
const API_URL = "https://api.jsonbin.io/v3/b/6a119f136610dd3ae891d967";
const API_KEY = "$2a$10$b7426vCN3qvmHEGqIaeofuk0b.FXiKdEHj3Nh3zapOGnat.kn3TaW";

let posts = [];

const form = document.getElementById("news-form");
const statusText = document.getElementById("status");

// INPUT
const title = document.getElementById("title");
const image = document.getElementById("image");
const excerpt = document.getElementById("excerpt");
const content = document.getElementById("content");
const category = document.getElementById("category");
const headline = document.getElementById("headline");
const previewBox = document.getElementById("preview-box");


// ================= LOAD DATA =================
document.addEventListener("DOMContentLoaded", loadPosts);

async function loadPosts() {
  const res = await fetch(API_URL + "/latest", {
    headers: { "X-Master-Key": API_KEY }
  });

  const data = await res.json();
  posts = data?.record?.posts || [];

  renderList();
}


// ================= RENDER LIST =================
function renderList() {
  const container = document.getElementById("admin-list");

  container.innerHTML = posts.map(post => `
    <div class="admin-item">
      <h3>${post.title}</h3>
      <small>
        ${post.category} 
        ${post.isHeadline ? "🔥 HEADLINE" : ""}
      </small>

      <div class="admin-actions">
        <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
        <button class="delete-btn" onclick="deletePost(${post.id})">Hapus</button>
      </div>
    </div>
  `).join("");
}


// ================= PREVIEW LIVE =================
content.addEventListener("input", () => {
  previewBox.innerHTML = content.value;
});


// ================= SUBMIT (ADD / EDIT) =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;

  const newPost = {
    id: id ? Number(id) : Date.now(),
    title: title.value,
    image: image.value,
    excerpt: excerpt.value,
    content: content.value,
    category: category.value,
    isHeadline: headline.checked,
    isTrending: false,
    createdAt: new Date().toISOString().split("T")[0]
  };

  // reset headline lama
  if (newPost.isHeadline) {
    posts = posts.map(p => ({ ...p, isHeadline: false }));
  }

  if (id) {
    // EDIT
    posts = posts.map(p => p.id == id ? newPost : p);
  } else {
    // TAMBAH
    posts.unshift(newPost);
  }

  await saveToServer();

  form.reset();
  previewBox.innerHTML = "";
  document.getElementById("edit-id").value = "";
});


// ================= EDIT =================
function editPost(id) {
  const post = posts.find(p => p.id == id);

  document.getElementById("edit-id").value = post.id;
  title.value = post.title;
  image.value = post.image;
  excerpt.value = post.excerpt || "";
  content.value = post.content || "";
  category.value = post.category;
  headline.checked = post.isHeadline;

  // tampilkan preview saat edit
  previewBox.innerHTML = post.content || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}


// ================= DELETE =================
function deletePost(id) {
  if (!confirm("Hapus berita ini?")) return;

  posts = posts.filter(p => p.id != id);

  saveToServer();
}


// ================= SAVE =================
async function saveToServer() {
  statusText.innerText = "⏳ Menyimpan...";

  await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify({ posts })
  });

  statusText.innerText = "✅ Berhasil disimpan!";
  renderList();
}