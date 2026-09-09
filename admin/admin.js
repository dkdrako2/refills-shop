<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>REFILLS SHOP — Admin</title>

  <link rel="stylesheet" href="admin.css">
</head>

<body>

  <!-- =========================
       SIDEBAR
  ========================== -->

  <aside class="sidebar" id="sidebar">

    <div class="brand">
      <div class="brand-logo">RS</div>

      <div>
        <strong>REFILLS SHOP</strong>
        <span>ADMIN PANEL</span>
      </div>
    </div>

    <nav class="menu">

      <button class="menu-item active" data-section="dashboard">
        <span>⌂</span>
        Dashboard
      </button>

      <button class="menu-item" data-section="categories">
        <span>▦</span>
        Categorías
      </button>

      <button class="menu-item" data-section="games">
        <span>🎮</span>
        Juegos
      </button>

      <button class="menu-item" data-section="offers">
        <span>💰</span>
        Ofertas
      </button>

      <button class="menu-item" data-section="orders">
        <span>🛒</span>
        Pedidos
      </button>

    </nav>

    <div class="sidebar-bottom">

      <a
        href="https://dkdrako2.github.io/refills-shop/"
        target="_blank"
        class="view-shop"
      >
        🌐 Ver tienda
      </a>

    </div>

  </aside>


  <!-- =========================
       MAIN
  ========================== -->

  <main class="main">

    <!-- TOPBAR -->

    <header class="topbar">

      <button
        class="mobile-menu"
        id="mobileMenu"
        type="button"
      >
        ☰
      </button>

      <div>

        <div class="top-title">
          Panel administrativo
        </div>

        <div class="top-subtitle">
          Gestiona REFILLS SHOP
        </div>

      </div>

      <div class="connection" id="connectionStatus">

        <span class="connection-dot"></span>

        <span id="connectionText">
          Comprobando API...
        </span>

      </div>

    </header>


    <!-- CONTENT -->

    <div class="content">


      <!-- =========================
           DASHBOARD
      ========================== -->

      <section
        class="admin-section active"
        id="section-dashboard"
      >

        <div class="page-heading">

          <div>
            <h1>Dashboard</h1>

            <p>
              Resumen general de tu tienda.
            </p>
          </div>

          <button
            class="btn primary"
            id="refreshDashboard"
            type="button"
          >
            ↻ Actualizar
          </button>

        </div>


        <!-- STATS -->

        <div class="stats-grid">

          <div class="stat-card">

            <div class="stat-icon blue">
              ▦
            </div>

            <div>
              <span>Categorías</span>
              <strong id="dashboardCategories">
                0
              </strong>
            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon cyan">
              🎮
            </div>

            <div>
              <span>Juegos</span>
              <strong id="dashboardGames">
                0
              </strong>
            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon green">
              💰
            </div>

            <div>
              <span>Ofertas</span>
              <strong id="dashboardOffers">
                0
              </strong>
            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon purple">
              🛒
            </div>

            <div>
              <span>Pedidos</span>
              <strong id="dashboardOrders">
                0
              </strong>
            </div>

          </div>

        </div>


        <!-- QUICK ACTIONS -->

        <div class="panel">

          <div class="panel-title">
            Acciones rápidas
          </div>

          <div class="quick-actions">

            <button
              class="quick-action"
              data-section="categories"
              type="button"
            >
              <span>＋</span>
              <strong>Nueva categoría</strong>
              <small>Agregar categoría</small>
            </button>


            <button
              class="quick-action"
              data-section="games"
              type="button"
            >
              <span>＋</span>
              <strong>Nuevo juego</strong>
              <small>Agregar juego</small>
            </button>


            <button
              class="quick-action"
              data-section="offers"
              type="button"
            >
              <span>＋</span>
              <strong>Nueva oferta</strong>
              <small>Agregar precio</small>
            </button>

          </div>

        </div>


        <!-- API INFO -->

        <div class="panel">

          <div class="panel-title">
            Estado del sistema
          </div>

          <div class="system-info">

            <div>
              <span>Frontend</span>
              <strong>GitHub Pages</strong>
            </div>

            <div>
              <span>Backend</span>
              <strong>Render</strong>
            </div>

            <div>
              <span>Base de datos</span>
              <strong>PostgreSQL</strong>
            </div>

            <div>
              <span>API</span>
              <strong id="apiUrlDisplay">
                https://refills-shop.onrender.com
              </strong>
            </div>

          </div>

        </div>

      </section>



      <!-- =========================
           CATEGORÍAS
      ========================== -->

      <section
        class="admin-section"
        id="section-categories"
      >

        <div class="page-heading">

          <div>
            <h1>Categorías</h1>

            <p>
              Administra las categorías de productos.
            </p>
          </div>

          <button
            class="btn primary"
            id="newCategoryBtn"
            type="button"
          >
            ＋ Nueva categoría
          </button>

        </div>


        <div class="panel">

          <div class="table-header">

            <strong>
              Lista de categorías
            </strong>

            <button
              class="btn small"
              id="refreshCategories"
              type="button"
            >
              ↻
            </button>

          </div>


          <div
            class="table-container"
            id="categoriesTable"
          >

            <div class="loading">
              Cargando categorías...
            </div>

          </div>

        </div>

      </section>



      <!-- =========================
           JUEGOS
      ========================== -->

      <section
        class="admin-section"
        id="section-games"
      >

        <div class="page-heading">

          <div>
            <h1>Juegos</h1>

            <p>
              Administra los juegos disponibles.
            </p>
          </div>

          <button
            class="btn primary"
            id="newGameBtn"
            type="button"
          >
            ＋ Nuevo juego
          </button>

        </div>


        <div class="panel">

          <div class="table-header">

            <strong>
              Lista de juegos
            </strong>

            <button
              class="btn small"
              id="refreshGames"
              type="button"
            >
              ↻
            </button>

          </div>


          <div
            class="table-container"
            id="gamesTable"
          >

            <div class="loading">
              Cargando juegos...
            </div>

          </div>

        </div>

      </section>



      <!-- =========================
           OFERTAS
      ========================== -->

      <section
        class="admin-section"
        id="section-offers"
      >

        <div class="page-heading">

          <div>
            <h1>Ofertas</h1>

            <p>
              Administra precios y paquetes.
            </p>
          </div>

          <button
            class="btn primary"
            id="newOfferBtn"
            type="button"
          >
            ＋ Nueva oferta
          </button>

        </div>


        <div class="panel">

          <div class="table-header">

            <strong>
              Lista de ofertas
            </strong>

            <button
              class="btn small"
              id="refreshOffers"
              type="button"
            >
              ↻
            </button>

          </div>


          <div
            class="table-container"
            id="offersTable"
          >

            <div class="loading">
              Cargando ofertas...
            </div>

          </div>

        </div>

      </section>



      <!-- =========================
           PEDIDOS
      ========================== -->

      <section
        class="admin-section"
        id="section-orders"
      >

        <div class="page-heading">

          <div>

            <h1>Pedidos</h1>

            <p>
              Próximamente: gestión de pedidos y pagos.
            </p>

          </div>

        </div>


        <div class="empty-panel">

          <div class="empty-icon">
            🛒
          </div>

          <h2>
            Gestión de pedidos
          </h2>

          <p>
            Esta sección se conectará con el sistema
            de pedidos cuando terminemos el módulo.
          </p>

        </div>

      </section>

    </div>

  </main>



  <!-- =========================
       MODAL
  ========================== -->

  <div
    class="modal-overlay"
    id="modalOverlay"
  >

    <div
      class="modal"
      id="modal"
    >

      <button
        class="modal-close"
        id="modalClose"
        type="button"
      >
        ×
      </button>

      <div id="modalContent"></div>

    </div>

  </div>



  <!-- =========================
       TOAST
  ========================== -->

  <div
    class="toast"
    id="toast"
  >
    <span id="toastMessage"></span>
  </div>



  <script src="admin.js"></script>

</body>
</html>
