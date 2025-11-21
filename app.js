// app.js

document.addEventListener("DOMContentLoaded", () => {
  setupCollectionPage();
});

let vinyls = [];

/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
   替换成你的后端 API 地址
   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
const API_URL = "http://localhost:5000/vinyls";

function setupCollectionPage() {
  const grid = document.getElementById("vinylGrid");
  if (!grid) return;

  const messageEl = document.getElementById("message");
  const modalOverlay = document.getElementById("vinylModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const openAddModalBtn = document.getElementById("openAddModalBtn");
  const vinylForm = document.getElementById("vinylForm");
  const vinylIdInput = document.getElementById("vinylId");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");

  // Delete modal
  const deleteModal = document.getElementById("deleteModal");
  const closeDeleteModalBtn = document.getElementById("closeDeleteModal");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  let deleteTargetId = null;

  /* ---------- 后端：加载所有唱片 ---------- */
  async function loadVinyls() {
    try {
      const res = await fetch(API_URL);
      vinyls = await res.json();
      renderVinyls();
    } catch (err) {
      console.error("LOAD ERROR:", err);
      showMessage("Cannot load data from server.", "error");
    }
  }

  /* ---------- 打开 / 关闭 Modal ---------- */

  function openModal(mode = "add", vinyl = null) {
    if (mode === "add") {
      modalTitle.textContent = "Add Vinyl";
      modalSubtitle.textContent = "Add a new record to your collection";
      vinylIdInput.value = "";
      vinylForm.reset();
    } else if (mode === "edit" && vinyl) {
      modalTitle.textContent = "Edit Vinyl";
      modalSubtitle.textContent = "Update the details of this record";
      vinylIdInput.value = vinyl._id;

      document.getElementById("title").value = vinyl.title || "";
      document.getElementById("artist").value = vinyl.artist || "";
      document.getElementById("year").value = vinyl.year || "";
      document.getElementById("genre").value = vinyl.genre || "";
      document.getElementById("coverImageUrl").value = vinyl.coverImage || "";
    }

    modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
  }

  openAddModalBtn.addEventListener("click", () => openModal("add"));
  modalCloseBtn.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  /* ---------- Delete Modal ---------- */

  function openDeleteModal(id) {
    deleteTargetId = id;
    deleteModal.classList.remove("hidden");
  }
  function closeDeleteModal() {
    deleteTargetId = null;
    deleteModal.classList.add("hidden");
  }

  closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
  cancelDeleteBtn.addEventListener("click", closeDeleteModal);

  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    if (!deleteTargetId) return;

    try {
      await fetch(`${API_URL}/${deleteTargetId}`, { method: "DELETE" });
      showMessage("Vinyl deleted.", "success");
      await loadVinyls();
    } catch (err) {
      showMessage("Delete failed.", "error");
    }

    closeDeleteModal();
  });

  /* ---------- Render 卡片 ---------- */

  function renderVinyls() {
    grid.innerHTML = "";

    if (!vinyls.length) return;

    vinyls.forEach((v) => {
      const card = document.createElement("article");
      card.className = "vinyl-card";

      const img = document.createElement("img");
      img.className = "vinyl-cover";
      img.alt = v.title || "Album cover";
      img.src =
        v.coverImage && v.coverImage.trim()
          ? v.coverImage
          : "https://via.placeholder.com/400x400?text=Album+Cover";

      const body = document.createElement("div");
      body.className = "vinyl-body";

      const titleEl = document.createElement("div");
      titleEl.className = "vinyl-title";
      titleEl.textContent = v.title;

      const artistEl = document.createElement("div");
      artistEl.className = "vinyl-artist";
      artistEl.textContent = v.artist;

      const metaEl = document.createElement("div");
      metaEl.className = "vinyl-meta";
      metaEl.textContent = [v.year, v.genre].filter(Boolean).join(" • ");

      body.appendChild(titleEl);
      body.appendChild(artistEl);
      body.appendChild(metaEl);

      const footer = document.createElement("div");
      footer.className = "vinyl-footer";

      const editBtn = document.createElement("button");
      editBtn.className = "card-btn card-btn-primary";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openModal("edit", v));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "card-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => openDeleteModal(v._id));

      footer.appendChild(editBtn);
      footer.appendChild(deleteBtn);

      card.appendChild(img);
      card.appendChild(body);
      card.appendChild(footer);

      grid.appendChild(card);
    });
  }

  /* ---------- Add / Edit Vinyl ---------- */

  vinylForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = vinylIdInput.value;
    const title = document.getElementById("title").value.trim();
    const artist = document.getElementById("artist").value.trim();
    const year = document.getElementById("year").value.trim();
    const genre = document.getElementById("genre").value.trim();
    const coverImage = document.getElementById("coverImageUrl").value.trim();

    if (!title || !artist) {
      showMessage("Title and artist are required.", "error");
      return;
    }

    const payload = { title, artist, year, genre, coverImage };

    try {
      if (id) {
        // 更新
        await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        showMessage("Vinyl updated.", "success");
      } else {
        // 新增
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        showMessage("Vinyl added.", "success");
      }

      await loadVinyls();
      closeModal();
      vinylForm.reset();
    } catch (err) {
      console.error(err);
      showMessage("Save failed.", "error");
    }
  });

  /* ---------- 初始化加载 ---------- */

  loadVinyls();
}

/* ---------- 工具函数 ---------- */

function showMessage(text, type = "success") {
  const messageEl = document.getElementById("message");
  if (!messageEl) return;

  messageEl.textContent = text;
  messageEl.classList.remove("success", "error");

  if (type === "success") messageEl.classList.add("success");
  if (type === "error") messageEl.classList.add("error");

  if (text) {
    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.classList.remove("success", "error");
    }, 2500);
  }
}
