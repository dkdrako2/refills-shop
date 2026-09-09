const API_BASE = "https://refills-shop.onrender.com";

const state = {
  categories: [],
  games: [],
  offers: []
};

// ================================
// API
// ================================

async function api(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Error HTTP ${response.status}`
    );
  }

  return data;
}

// ================================
// HELPERS
// ================================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const messageEl = document.getElementById("toastMessage");

  if (!toast || !messageEl) return;

  messageEl.textContent = message;

  toast.classList.remove("show", "success", "error");

  toast.classList.add("show", type);

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function openModal(html) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");

  if (!overlay || !content) return;

  content.innerHTML = html;
  overlay.classList.add("show");
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");

  if (overlay) {
    overlay.classList.remove("show");
  }
}

// ================================
// CONNECTION
// ================================

async function checkConnection() {
  const text = document.getElementById("connectionText");
  const status = document.getElementById("connectionStatus");

  try {
    await api("/api/status");

    if (text) {
      text.textContent = "API conectada";
    }

    if (status) {
      status.classList.add("online");
      status.classList.remove("offline");
    }

  } catch (error) {

    if (text) {
      text.textContent = "API desconectada";
    }

    if (status) {
      status.classList.add("offline");
      status.classList.remove("online");
    }

    console.error(error);
  }
}

// ================================
// NAVIGATION
// ================================

function openSection(section) {
  document.querySelectorAll(".admin-section").forEach(el => {
    el.classList.remove("active");
  });

  document.querySelectorAll(".menu-item").forEach(el => {
    el.classList.remove("active");
  });

  const sectionEl = document.getElementById(`section-${section}`);

  if (sectionEl) {
    sectionEl.classList.add("active");
  }

  document
    .querySelectorAll(`[data-section="${section}"]`)
    .forEach(el => {
      el.classList.add("active");
    });

  if (section === "categories") {
    loadCategories();
  }

  if (section === "games") {
    loadGames();
  }

  if (section === "offers") {
    loadOffers();
  }

  const sidebar = document.getElementById("sidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }
}

// ================================
// CATEGORIES
// ================================

async function loadCategories() {
  const container = document.getElementById("categoriesTable");

  if (!container) return;

  container.innerHTML = `<div class="loading">Cargando categorías...</div>`;

  try {
    const data = await api("/api/categories");

    state.categories = data.categories || [];

    renderCategories();

    updateDashboard();

  } catch (error) {

    container.innerHTML = `
      <div class="empty-panel">
        <h3>Error cargando categorías</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;

    showToast(error.message, "error");
  }
}

function renderCategories() {
  const container = document.getElementById("categoriesTable");

  if (!container) return;

  if (!state.categories.length) {
    container.innerHTML = `
      <div class="empty-panel">
        <h3>No hay categorías</h3>
        <p>Crea la primera categoría.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Slug</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        ${state.categories.map(category => `
          <tr>
            <td>${category.id}</td>

            <td>
              <strong>${escapeHTML(category.name)}</strong>
            </td>

            <td>
              ${escapeHTML(category.slug)}
            </td>

            <td>
              <div class="table-actions">

                <button
                  class="btn small"
                  onclick="editCategory(${category.id})"
                >
                  Editar
                </button>

                <button
                  class="btn small danger"
                  onclick="deleteCategory(${category.id})"
                >
                  Eliminar
                </button>

              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function newCategory() {
  openModal(`
    <h2>Nueva categoría</h2>

    <form id="categoryForm">

      <label>Nombre</label>

      <input
        id="categoryName"
        type="text"
        placeholder="Ej. Battle Royale"
        required
      >

      <label>Slug</label>

      <input
        id="categorySlug"
        type="text"
        placeholder="battle-royale"
        required
      >

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          Crear
        </button>

      </div>

    </form>
  `);

  const name = document.getElementById("categoryName");
  const slug = document.getElementById("categorySlug");

  name.addEventListener("input", () => {
    slug.value = slugify(name.value);
  });

  document
    .getElementById("categoryForm")
    .addEventListener("submit", async event => {

      event.preventDefault();

      try {

        await api("/api/categories", {
          method: "POST",

          body: JSON.stringify({
            name: name.value.trim(),
            slug: slug.value.trim()
          })
        });

        closeModal();

        showToast("Categoría creada correctamente");

        await loadCategories();

      } catch (error) {

        showToast(error.message, "error");
      }
    });
}

function editCategory(id) {
  const category = state.categories.find(
    item => Number(item.id) === Number(id)
  );

  if (!category) return;

  openModal(`
    <h2>Editar categoría</h2>

    <form id="categoryEditForm">

      <label>Nombre</label>

      <input
        id="editCategoryName"
        type="text"
        value="${escapeHTML(category.name)}"
        required
      >

      <label>Slug</label>

      <input
        id="editCategorySlug"
        type="text"
        value="${escapeHTML(category.slug)}"
        required
      >

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          Guardar
        </button>

      </div>

    </form>
  `);

  document
    .getElementById("categoryEditForm")
    .addEventListener("submit", async event => {

      event.preventDefault();

      try {

        await api(`/api/categories/${id}`, {
          method: "PUT",

          body: JSON.stringify({
            name: document
              .getElementById("editCategoryName")
              .value
              .trim(),

            slug: document
              .getElementById("editCategorySlug")
              .value
              .trim()
          })
        });

        closeModal();

        showToast("Categoría actualizada");

        await loadCategories();

      } catch (error) {

        showToast(error.message, "error");
      }
    });
}

async function deleteCategory(id) {
  const category = state.categories.find(
    item => Number(item.id) === Number(id)
  );

  if (!category) return;

  const confirmed = confirm(
    `¿Eliminar la categoría "${category.name}"?`
  );

  if (!confirmed) return;

  try {

    await api(`/api/categories/${id}`, {
      method: "DELETE"
    });

    showToast("Categoría eliminada");

    await loadCategories();

  } catch (error) {

    showToast(error.message, "error");
  }
}

// ================================
// GAMES
// ================================

async function loadGames() {
  const container = document.getElementById("gamesTable");

  if (!container) return;

  container.innerHTML = `<div class="loading">Cargando juegos...</div>`;

  try {

    const data = await api("/api/games");

    state.games = data.games || [];

    renderGames();

    updateDashboard();

  } catch (error) {

    container.innerHTML = `
      <div class="empty-panel">
        <h3>Error cargando juegos</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;

    showToast(error.message, "error");
  }
}

function getCategoryName(id) {
  const category = state.categories.find(
    item => Number(item.id) === Number(id)
  );

  return category ? category.name : "Sin categoría";
}

function renderGames() {
  const container = document.getElementById("gamesTable");

  if (!container) return;

  if (!state.games.length) {
    container.innerHTML = `
      <div class="empty-panel">
        <h3>No hay juegos</h3>
        <p>Agrega un juego desde el botón superior.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <table class="admin-table">

      <thead>
        <tr>
          <th>ID</th>
          <th>Juego</th>
          <th>Categoría</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>

        ${state.games.map(game => `
          <tr>

            <td>${game.id}</td>

            <td>
              <div class="game-admin-name">

                ${
                  game.image_url
                    ? `<img src="${escapeHTML(game.image_url)}" alt="">`
                    : ""
                }

                <strong>
                  ${escapeHTML(game.name)}
                </strong>

              </div>
            </td>

            <td>
              ${escapeHTML(
                game.category_name ||
                getCategoryName(game.category_id)
              )}
            </td>

            <td>
              ${
                game.active
                  ? `<span class="status-badge active">Activo</span>`
                  : `<span class="status-badge inactive">Inactivo</span>`
              }
            </td>

            <td>
              <div class="table-actions">

                <button
                  class="btn small"
                  onclick="editGame(${game.id})"
                >
                  Editar
                </button>

                <button
                  class="btn small danger"
                  onclick="deleteGame(${game.id})"
                >
                  Eliminar
                </button>

              </div>
            </td>

          </tr>
        `).join("")}

      </tbody>

    </table>
  `;
}

async function newGame() {
  if (!state.categories.length) {
    await loadCategories();
  }

  openGameForm();
}

function openGameForm(game = null) {
  const editing = Boolean(game);

  openModal(`
    <h2>
      ${editing ? "Editar juego" : "Nuevo juego"}
    </h2>

    <form id="gameForm">

      <label>Nombre</label>

      <input
        id="gameName"
        type="text"
        value="${editing ? escapeHTML(game.name) : ""}"
        placeholder="Ej. Free Fire"
        required
      >

      <label>Slug</label>

      <input
        id="gameSlug"
        type="text"
        value="${editing ? escapeHTML(game.slug) : ""}"
        placeholder="freefire"
        required
      >

      <label>Categoría</label>

      <select id="gameCategory" required>

        <option value="">
          Selecciona una categoría
        </option>

        ${state.categories.map(category => `
          <option
            value="${category.id}"
            ${
              editing &&
              Number(game.category_id) === Number(category.id)
                ? "selected"
                : ""
            }
          >
            ${escapeHTML(category.name)}
          </option>
        `).join("")}

      </select>

      <label>URL de imagen</label>

      <input
        id="gameImage"
        type="url"
        value="${editing ? escapeHTML(game.image_url || "") : ""}"
        placeholder="https://..."
      >

      <label class="checkbox-row">

        <input
          id="gameActive"
          type="checkbox"
          ${!editing || game.active ? "checked" : ""}
        >

        Juego activo

      </label>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          ${editing ? "Guardar cambios" : "Crear juego"}
        </button>

      </div>

    </form>
  `);

  const name = document.getElementById("gameName");
  const slug = document.getElementById("gameSlug");

  name.addEventListener("input", () => {
    if (!editing) {
      slug.value = slugify(name.value);
    }
  });

  document
    .getElementById("gameForm")
    .addEventListener("submit", async event => {

      event.preventDefault();

      const payload = {
        category_id: Number(
          document.getElementById("gameCategory").value
        ),

        name: name.value.trim(),

        slug: slug.value.trim(),

        image_url:
          document.getElementById("gameImage").value.trim(),

        active:
          document.getElementById("gameActive").checked
      };

      try {

        if (editing) {

          await api(`/api/games/${game.id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
          });

          showToast("Juego actualizado");

        } else {

          await api("/api/games", {
            method: "POST",
            body: JSON.stringify(payload)
          });

          showToast("Juego creado");
        }

        closeModal();

        await loadGames();

      } catch (error) {

        showToast(error.message, "error");
      }
    });
}

function editGame(id) {
  const game = state.games.find(
    item => Number(item.id) === Number(id)
  );

  if (!game) return;

  openGameForm(game);
}

async function deleteGame(id) {
  const game = state.games.find(
    item => Number(item.id) === Number(id)
  );

  if (!game) return;

  const confirmed = confirm(
    `¿Eliminar "${game.name}" y todas sus ofertas?`
  );

  if (!confirmed) return;

  try {

    await api(`/api/games/${id}`, {
      method: "DELETE"
    });

    showToast("Juego eliminado");

    await loadGames();

  } catch (error) {

    showToast(error.message, "error");
  }
}

// ================================
// OFFERS
// ================================

async function loadOffers() {
  const container = document.getElementById("offersTable");

  if (!container) return;

  container.innerHTML = `<div class="loading">Cargando ofertas...</div>`;

  try {

    const data = await api("/api/offers");

    state.offers = data.offers || [];

    renderOffers();

    updateDashboard();

  } catch (error) {

    container.innerHTML = `
      <div class="empty-panel">
        <h3>Error cargando ofertas</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;

    showToast(error.message, "error");
  }
}

function getGameName(id) {
  const game = state.games.find(
    item => Number(item.id) === Number(id)
  );

  return game ? game.name : "Sin juego";
}

function renderOffers() {
  const container = document.getElementById("offersTable");

  if (!container) return;

  if (!state.offers.length) {
    container.innerHTML = `
      <div class="empty-panel">
        <h3>No hay ofertas</h3>
        <p>Agrega una oferta desde el botón superior.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <table class="admin-table">

      <thead>
        <tr>
          <th>ID</th>
          <th>Juego</th>
          <th>Oferta</th>
          <th>SM</th>
          <th>CUP</th>
          <th>USDT</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>

        ${state.offers.map(offer => `
          <tr>

            <td>${offer.id}</td>

            <td>
              <strong>
                ${escapeHTML(
                  offer.game_name ||
                  getGameName(offer.game_id)
                )}
              </strong>
            </td>

            <td>
              ${escapeHTML(offer.name)}
              ${
                offer.amount
                  ? `<small>${escapeHTML(offer.amount)}</small>`
                  : ""
              }
            </td>

            <td>
              ${offer.price_sm ?? "—"}
            </td>

            <td>
              ${offer.price_cup ?? "—"}
            </td>

            <td>
              ${
                offer.price_usdt !== null &&
                offer.price_usdt !== undefined
                  ? `$${offer.price_usdt}`
                  : "—"
              }
            </td>

            <td>
              ${
                offer.active
                  ? `<span class="status-badge active">Activo</span>`
                  : `<span class="status-badge inactive">Inactivo</span>`
              }
            </td>

            <td>
              <div class="table-actions">

                <button
                  class="btn small"
                  onclick="editOffer(${offer.id})"
                >
                  Editar
                </button>

                <button
                  class="btn small danger"
                  onclick="deleteOffer(${offer.id})"
                >
                  Eliminar
                </button>

              </div>
            </td>

          </tr>
        `).join("")}

      </tbody>

    </table>
  `;
}

async function newOffer() {
  if (!state.games.length) {
    await loadGames();
  }

  openOfferForm();
}

function openOfferForm(offer = null) {
  const editing = Boolean(offer);

  openModal(`
    <h2>
      ${editing ? "Editar oferta" : "Nueva oferta"}
    </h2>

    <form id="offerForm">

      <label>Juego</label>

      <select id="offerGame" required>

        <option value="">
          Selecciona un juego
        </option>

        ${state.games.map(game => `
          <option
            value="${game.id}"
            ${
              editing &&
              Number(offer.game_id) === Number(game.id)
                ? "selected"
                : ""
            }
          >
            ${escapeHTML(game.name)}
          </option>
        `).join("")}

      </select>

      <label>Nombre de la oferta</label>

      <input
        id="offerName"
        type="text"
        value="${editing ? escapeHTML(offer.name) : ""}"
        placeholder="Ej. 110 Diamantes"
        required
      >

      <label>Cantidad</label>

      <input
        id="offerAmount"
        type="text"
        value="${editing ? escapeHTML(offer.amount || "") : ""}"
        placeholder="Ej. 110"
      >

      <label>Precio SM</label>

      <input
        id="offerSM"
        type="number"
        step="0.01"
        value="${editing ? offer.price_sm ?? "" : ""}"
        placeholder="0.00"
      >

      <label>Precio CUP</label>

      <input
        id="offerCUP"
        type="number"
        step="0.01"
        value="${editing ? offer.price_cup ?? "" : ""}"
        placeholder="0.00"
      >

      <label>Precio USDT</label>

      <input
        id="offerUSDT"
        type="number"
        step="0.01"
        value="${editing ? offer.price_usdt ?? "" : ""}"
        placeholder="0.00"
      >

      <label class="checkbox-row">

        <input
          id="offerActive"
          type="checkbox"
          ${!editing || offer.active ? "checked" : ""}
        >

        Oferta activa

      </label>

      <div class="modal-actions">

        <button
          type="button"
          class="btn"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="btn primary"
        >
          ${editing ? "Guardar cambios" : "Crear oferta"}
        </button>

      </div>

    </form>
  `);

  document
    .getElementById("offerForm")
    .addEventListener("submit", async event => {

      event.preventDefault();

      const sm =
        document.getElementById("offerSM").value;

      const cup =
        document.getElementById("offerCUP").value;

      const usdt =
        document.getElementById("offerUSDT").value;

      const payload = {
        game_id:
          Number(
            document.getElementById("offerGame").value
          ),

        name:
          document.getElementById("offerName").value.trim(),

        amount:
          document.getElementById("offerAmount").value.trim(),

        price_sm:
          sm === "" ? null : Number(sm),

        price_cup:
          cup === "" ? null : Number(cup),

        price_usdt:
          usdt === "" ? null : Number(usdt),

        active:
          document.getElementById("offerActive").checked
      };

      try {

        if (editing) {

          await api(`/api/offers/${offer.id}`, {
            method: "PUT",
            body: JSON.stringify(payload)
          });

          showToast("Oferta actualizada");

        } else {

          await api("/api/offers", {
            method: "POST",
            body: JSON.stringify(payload)
          });

          showToast("Oferta creada");
        }

        closeModal();

        await loadOffers();

      } catch (error) {

        showToast(error.message, "error");
      }
    });
}

function editOffer(id) {
  const offer = state.offers.find(
    item => Number(item.id) === Number(id)
  );

  if (!offer) return;

  openOfferForm(offer);
}

async function deleteOffer(id) {
  const offer = state.offers.find(
    item => Number(item.id) === Number(id)
  );

  if (!offer) return;

  const confirmed = confirm(
    `¿Eliminar la oferta "${offer.name}"?`
  );

  if (!confirmed) return;

  try {

    await api(`/api/offers/${id}`, {
      method: "DELETE"
    });

    showToast("Oferta eliminada");

    await loadOffers();

  } catch (error) {

    showToast(error.message, "error");
  }
}

// ================================
// DASHBOARD
// ================================

async function updateDashboard() {
  try {

    const [categories, games, offers] =
      await Promise.all([
        api("/api/categories"),
        api("/api/games"),
        api("/api/offers")
      ]);

    state.categories = categories.categories || [];
    state.games = games.games || [];
    state.offers = offers.offers || [];

    const categoryCount =
      document.getElementById("dashboardCategories");

    const gameCount =
      document.getElementById("dashboardGames");

    const offerCount =
      document.getElementById("dashboardOffers");

    const orderCount =
      document.getElementById("dashboardOrders");

    if (categoryCount) {
      categoryCount.textContent =
        state.categories.length;
    }

    if (gameCount) {
      gameCount.textContent =
        state.games.length;
    }

    if (offerCount) {
      offerCount.textContent =
        state.offers.length;
    }

    if (orderCount) {
      orderCount.textContent = "0";
    }

  } catch (error) {

    console.error(
      "Error actualizando dashboard:",
      error
    );
  }
}

// ================================
// EVENTS
// ================================

document.addEventListener("DOMContentLoaded", () => {

  // Navegación
  document
    .querySelectorAll("[data-section]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const section =
          button.dataset.section;

        if (section) {
          openSection(section);
        }
      });
    });

  // Menú móvil
  const mobileMenu =
    document.getElementById("mobileMenu");

  const sidebar =
    document.getElementById("sidebar");

  if (mobileMenu && sidebar) {

    mobileMenu.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Modal
  const modalClose =
    document.getElementById("modalClose");

  const modalOverlay =
    document.getElementById("modalOverlay");

  if (modalClose) {
    modalClose.addEventListener(
      "click",
      closeModal
    );
  }

  if (modalOverlay) {

    modalOverlay.addEventListener(
      "click",
      event => {

        if (
          event.target === modalOverlay
        ) {
          closeModal();
        }
      }
    );
  }

  // Botones categorías
  const newCategoryBtn =
    document.getElementById("newCategoryBtn");

  if (newCategoryBtn) {
    newCategoryBtn.addEventListener(
      "click",
      newCategory
    );
  }

  const refreshCategories =
    document.getElementById("refreshCategories");

  if (refreshCategories) {
    refreshCategories.addEventListener(
      "click",
      loadCategories
    );
  }

  // Botones juegos
  const newGameBtn =
    document.getElementById("newGameBtn");

  if (newGameBtn) {
    newGameBtn.addEventListener(
      "click",
      newGame
    );
  }

  const refreshGames =
    document.getElementById("refreshGames");

  if (refreshGames) {
    refreshGames.addEventListener(
      "click",
      loadGames
    );
  }

  // Botones ofertas
  const newOfferBtn =
    document.getElementById("newOfferBtn");

  if (newOfferBtn) {
    newOfferBtn.addEventListener(
      "click",
      newOffer
    );
  }

  const refreshOffers =
    document.getElementById("refreshOffers");

  if (refreshOffers) {
    refreshOffers.addEventListener(
      "click",
      loadOffers
    );
  }

  // Dashboard
  const refreshDashboard =
    document.getElementById("refreshDashboard");

  if (refreshDashboard) {
    refreshDashboard.addEventListener(
      "click",
      async () => {

        await checkConnection();
        await updateDashboard();

        showToast(
          "Dashboard actualizado"
        );
      }
    );
  }

  // Inicialización
  checkConnection();
  updateDashboard();

});
