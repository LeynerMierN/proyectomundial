/**
 * avatares.js
 * -----------------------------------------------------------------------------
 * Todo lo relacionado con DIBUJAR los avatares y construir la pantalla de
 * selección. Los avatares son SVG generados con código a partir de los colores
 * de cada jugador (definidos en data/jugadores.js). No usamos fotos reales para
 * evitar problemas de derechos de imagen y funcionar 100% offline.
 *
 * Funciones principales:
 *   crearSvgAvatar(jugador)      -> devuelve el SVG (texto) de un jugador.
 *   construirTarjeta(jugador)    -> crea la tarjeta clicable de un jugador.
 *   construirPantallaSeleccion() -> rellena el grid con las 10 tarjetas.
 */

/**
 * Genera el SVG de un futbolista usando sus colores de camiseta.
 * Es un avatar estilizado: cabeza, camiseta a dos colores, dorsal y bandera.
 * @param {Object} jugador - un elemento del arreglo JUGADORES.
 * @returns {string} marcado SVG listo para insertar en el HTML.
 */
function crearSvgAvatar(jugador) {
  return `
    <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" role="img"
         aria-label="Avatar de ${jugador.nombre}">
      <!-- Camiseta: dos franjas con los colores de la nación -->
      <path d="M20 70 L20 110 L80 110 L80 70 L70 55 L30 55 Z"
            fill="${jugador.colorPrimario}" />
      <rect x="48" y="55" width="4" height="55" fill="${jugador.colorSecundario}" />
      <!-- Hombros -->
      <path d="M30 55 L18 62 L24 72 L30 64 Z" fill="${jugador.colorPrimario}" />
      <path d="M70 55 L82 62 L76 72 L70 64 Z" fill="${jugador.colorPrimario}" />
      <!-- Cuello -->
      <rect x="44" y="48" width="12" height="12" fill="${jugador.colorPiel}" />
      <!-- Cabeza -->
      <circle cx="50" cy="34" r="18" fill="${jugador.colorPiel}" />
      <!-- Pelo -->
      <path d="M32 30 Q50 8 68 30 Q60 20 50 20 Q40 20 32 30 Z" fill="#2b1d12" />
      <!-- Dorsal en la camiseta -->
      <text x="50" y="95" text-anchor="middle" font-size="18"
            font-weight="bold" fill="${jugador.colorSecundario}"
            font-family="Arial">${jugador.dorsal}</text>
    </svg>
  `;
}

/**
 * Construye la tarjeta HTML clicable de un jugador (avatar + datos).
 * Le añade un atributo data-id para identificarlo al hacer clic.
 * @param {Object} jugador
 * @returns {HTMLElement} el elemento <div> de la tarjeta.
 */
function construirTarjeta(jugador) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta-avatar";
  tarjeta.dataset.id = jugador.id;
  tarjeta.innerHTML = `
    ${crearSvgAvatar(jugador)}
    <span class="tarjeta-avatar__nombre">${jugador.bandera} ${jugador.nombre}</span>
    <span class="tarjeta-avatar__pais">${jugador.pais}</span>
    <span class="tarjeta-avatar__control">Control: ${jugador.control}/10</span>
  `;
  return tarjeta;
}

/**
 * Rellena el contenedor del grid con las 10 tarjetas de avatar.
 * Se llama una sola vez al iniciar la app.
 */
function construirPantallaSeleccion() {
  const grid = buscar("#grid-avatares");
  JUGADORES.forEach((jugador) => {
    grid.appendChild(construirTarjeta(jugador));
  });
}

/**
 * Busca un jugador por su id dentro del catálogo.
 * @param {string} id
 * @returns {Object|undefined} el jugador, o undefined si no existe.
 */
function buscarJugadorPorId(id) {
  return JUGADORES.find((jugador) => jugador.id === id);
}
