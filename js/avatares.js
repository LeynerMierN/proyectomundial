/**
 * avatares.js
 * -----------------------------------------------------------------------------
 * Controla el renderizado de las cartas estilo FIFA Ultimate Team (FUT).
 * Carga las imágenes reales (renders PNG transparentes) desde la carpeta assets/.
 */

/**
 * Genera el diseño de la carta FIFA cargando la foto real del jugador.
 * Coordenadas de texto corregidas para evitar solapamientos en la base.
 * @param {Object} jugador - Elemento del arreglo JUGADORES.
 * @returns {string} Marcado SVG con la imagen real integrada y textos ordenados.
 */
function crearFifaCardSvg(jugador) {
  // Cálculo de Media FIFA basada en el nivel de control
  const ratingFifa = Math.round(65 + (jugador.control * 3.2));
  const posicion = "DC";
  const apellido = jugador.nombre.split(" ").pop().toUpperCase();

  return `
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" role="img" style="width: 100%; height: 100%;"
         aria-label="Carta FIFA de ${jugador.nombre}">
      
      <defs>
        <!-- Gradiente Dorado Oficial de la Play -->
        <linearGradient id="goldGrad-${jugador.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fbc02d;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ffeb3b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f57f17;stop-opacity:1" />
        </linearGradient>
        
        <!-- Sombra para dar relieve a la tarjeta -->
        <filter id="shadow-${jugador.id}" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        
        <!-- Máscara de recorte para que la foto no se salga del escudo por abajo -->
        <clipPath id="cardClip-${jugador.id}">
          <path d="M 15 5 L 115 5 L 115 125 L 65 162 L 15 125 Z" />
        </clipPath>
      </defs>

      <!-- Fondo del Escudo Dorado -->
      <path d="M 15 5 L 115 5 L 115 125 L 65 162 L 15 125 Z"
            fill="url(#goldGrad-${jugador.id})"
            stroke="#fff176"
            stroke-width="1.8"
            filter="url(#shadow-${jugador.id})" />

      <!-- FOTO REAL DEL JUGADOR (Cargada desde assets/) -->
      <g clip-path="url(#cardClip-${jugador.id})">
        <image href="assets/${jugador.id}.png" 
               x="38" 
               y="18" 
               width="78" 
               height="98"
               style="filter: drop-shadow(2px 3px 4px rgba(0,0,0,0.4));" />
      </g>

      <!-- TEXTOS DE ESTADÍSTICAS SUPERIORES (Columna Izquierda) -->
      <g font-family="Impact, Arial Black, sans-serif" fill="#1a252f">
        <text x="34" y="32" font-size="21" text-anchor="middle" font-weight="900">${ratingFifa}</text>
        <text x="34" y="42" font-size="7.5" text-anchor="middle" fill="#566573" font-family="sans-serif" font-weight="bold">${posicion}</text>
        <text x="34" y="59" font-size="14" text-anchor="middle">${jugador.bandera}</text>
      </g>

      <!-- Cinta del Nombre del Crack (Ubicada perfectamente a altura Y=104) -->
      <rect x="22" y="104" width="86" height="13" fill="#111827" rx="2" stroke="#ffd54f" stroke-width="0.75" />
      <text x="65" y="113" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="7.5" font-weight="bold" fill="#ffd54f" letter-spacing="0.5">${apellido}</text>

      <!-- Panel de Detalles Inferiores (Desplazados hacia abajo a la zona del triángulo Y=132) -->
      <g font-family="system-ui, -apple-system, sans-serif" font-weight="bold">
        <!-- Estadísticas de Control y Pase -->
        <text x="65" y="132" text-anchor="middle" font-size="6.5" fill="#1a252f">
          CTL <tspan font-size="7.5" font-family="Impact" fill="#7b241c">${jugador.control * 10}</tspan>  |  PAS <tspan font-size="7.5" font-family="Impact" fill="#2c3e50">${ratingFifa - 8}</tspan>
        </text>
        <!-- Nombre del País -->
        <text x="65" y="143" text-anchor="middle" fill="#5d6d7e" font-size="5.5" letter-spacing="0.2">PAÍS: ${jugador.pais.toUpperCase()}</text>
      </g>
    </svg>
  `;
}

/**
 * Construye la tarjeta HTML contenedora enlazada a los eventos del juego.
 * Mantiene ambas clases para asegurar que el diseño y los clics funcionen en conjunto.
 */
function construirTarjeta(jugador) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta-avatar tarjeta-avatar-fifa";
  tarjeta.dataset.id = jugador.id;
  
  tarjeta.innerHTML = crearFifaCardSvg(jugador);
  return tarjeta;
}

/**
 * Inserta la colección completa de cartas en el contenedor del menú.
 */
function construirPantallaSeleccion() {
  const grid = buscar("#grid-avatares");
  if (grid) {
    grid.innerHTML = "";
    JUGADORES.forEach((jugador) => {
      grid.appendChild(construirTarjeta(jugador));
    });
  }
}

/**
 * Utilidad de búsqueda de datos de jugador.
 */
function buscarJugadorPorId(id) {
  return JUGADORES.find((jugador) => jugador.id === id);
}