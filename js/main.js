/**
 * main.js
 * -----------------------------------------------------------------------------
 * Punto de entrada y "director de orquesta". Coordina las pantallas y conecta
 * los botones, tanto del modo de 1 jugador como del de 2 jugadores.
 *
 * Flujos:
 *   1 jugador:  inicio -> seleccion -> juego -> fin
 *   2 jugadores: inicio -> 2p-setup -> 2p-juego -> 2p-fin
 *
 * No contiene física ni dibujo: eso vive en juego.js y dosjugadores.js.
 */

// ----- Estado de selección -----
let jugadorSeleccionado = null;                       // avatar de 1 jugador.
let dificultadSeleccionada = buscarDificultadPorId("normal"); // nivel compartido.
let ultimosJugadores2P = null;                        // {j1, j2} para la revancha.

/**
 * Muestra una pantalla y oculta las demás.
 * @param {string} idPantalla
 */
function mostrarPantalla(idPantalla) {
  document.querySelectorAll(".pantalla").forEach((seccion) => {
    seccion.classList.remove("pantalla--activa");
  });
  buscar("#" + idPantalla).classList.add("pantalla--activa");
}

/**
 * Activa/desactiva el formato ancho (apaisado) usado por el modo 2 jugadores.
 * @param {boolean} activo
 */
function modoAncho(activo) {
  document.body.classList.toggle("modo-dos", activo);
}

// ============================================================================
//  Selector de dificultad (reutilizable en 1 y 2 jugadores)
// ============================================================================

/**
 * Crea los botones de dificultad dentro de un contenedor y marca el activo.
 * @param {HTMLElement} contenedor
 */
function construirSelectorDificultad(contenedor) {
  DIFICULTADES.forEach((nivel) => {
    const boton = document.createElement("button");
    boton.className = "boton-dificultad";
    boton.dataset.id = nivel.id;
    boton.textContent = `${nivel.icono} ${nivel.nombre}`;
    if (nivel.id === dificultadSeleccionada.id) {
      boton.classList.add("boton-dificultad--activa");
    }
    contenedor.appendChild(boton);
  });
}

/**
 * Marca el nivel elegido dentro de su contenedor y lo guarda como activo.
 * @param {HTMLElement} boton
 * @param {HTMLElement} contenedor
 */
function seleccionarDificultad(boton, contenedor) {
  contenedor.querySelectorAll(".boton-dificultad").forEach((b) => {
    b.classList.remove("boton-dificultad--activa");
  });
  boton.classList.add("boton-dificultad--activa");
  dificultadSeleccionada = buscarDificultadPorId(boton.dataset.id);
}

// ============================================================================
//  Modo de 1 JUGADOR
// ============================================================================

/**
 * Marca la tarjeta de avatar elegida y la guarda.
 * @param {HTMLElement} tarjeta
 */
function seleccionarTarjeta(tarjeta) {
  document.querySelectorAll(".tarjeta-avatar").forEach((t) => {
    t.classList.remove("tarjeta-avatar--activa");
  });
  tarjeta.classList.add("tarjeta-avatar--activa");
  jugadorSeleccionado = buscarJugadorPorId(tarjeta.dataset.id);
  buscar("#btn-jugar").disabled = false;
}

/** Arranca una partida de 1 jugador. */
function comenzarPartida() {
  if (!jugadorSeleccionado) return;
  mostrarPantalla("pantalla-juego");
  Juego.iniciar(jugadorSeleccionado, dificultadSeleccionada, mostrarResultado);
}

/**
 * Muestra el resultado de 1 jugador.
 * @param {number} puntaje
 * @param {boolean} esRecord
 */
function mostrarResultado(puntaje, esRecord) {
  buscar("#puntaje-final").textContent = puntaje;
  buscar("#mensaje-record").classList.toggle("oculto", !esRecord || puntaje === 0);
  mostrarPantalla("pantalla-fin");
}

/** Actualiza el récord mostrado en la pantalla de inicio. */
function refrescarRecordInicio() {
  buscar("#record-inicio").textContent = leerRecord();
}

// ============================================================================
//  Modo de 2 JUGADORES
// ============================================================================

/** Llena un <select> con las opciones de avatares. */
function llenarSelectAvatares(select, idPorDefecto) {
  JUGADORES.forEach((jugador) => {
    const opcion = document.createElement("option");
    opcion.value = jugador.id;
    opcion.textContent = `${jugador.bandera} ${jugador.nombre} (${jugador.pais})`;
    select.appendChild(opcion);
  });
  select.value = idPorDefecto;
}

/** Entra a la pantalla de configuración de 2 jugadores. */
function abrirSetup2P() {
  modoAncho(true);
  mostrarPantalla("pantalla-2p-setup");
}

/** Arranca una ronda de 2 jugadores con los avatares elegidos en los selects. */
function comenzarRonda2P() {
  const j1 = buscarJugadorPorId(buscar("#select-p1").value);
  const j2 = buscarJugadorPorId(buscar("#select-p2").value);
  ultimosJugadores2P = { j1, j2 };
  iniciarRonda2P(j1, j2);
}

/** Inicia (o reinicia) la ronda con dos jugadores dados. */
function iniciarRonda2P(j1, j2) {
  buscar("#nombre-p1").textContent = `🔵 ${j1.bandera} ${j1.nombre}`;
  buscar("#nombre-p2").textContent = `🔴 ${j2.bandera} ${j2.nombre}`;
  mostrarPantalla("pantalla-2p-juego");
  Juego2P.iniciar(j1, j2, dificultadSeleccionada, mostrarResultado2P);
}

/**
 * Muestra el resultado de la ronda de 2 jugadores y declara ganador.
 * @param {number} p1 - dominadas del jugador 1.
 * @param {number} p2 - dominadas del jugador 2.
 */
function mostrarResultado2P(p1, p2) {
  buscar("#resumen-p1").textContent = `🔵 ${ultimosJugadores2P.j1.nombre}: ${p1}`;
  buscar("#resumen-p2").textContent = `🔴 ${ultimosJugadores2P.j2.nombre}: ${p2}`;

  let titulo;
  if (p1 > p2) titulo = `🏆 ¡Ganó ${ultimosJugadores2P.j1.nombre}!`;
  else if (p2 > p1) titulo = `🏆 ¡Ganó ${ultimosJugadores2P.j2.nombre}!`;
  else titulo = "🤝 ¡Empate!";
  buscar("#titulo-ganador").textContent = titulo;

  if (p1 !== p2) Sonidos.record();
  mostrarPantalla("pantalla-2p-fin");
}

/** Sale del modo 2 jugadores y vuelve al menú principal. */
function volverAlMenu() {
  Juego2P.detener();
  modoAncho(false);
  mostrarPantalla("pantalla-inicio");
  refrescarRecordInicio();
}

// ============================================================================
//  Sonido y conexión de eventos
// ============================================================================

/** Alterna el sonido global y actualiza el icono del botón. */
function alternarSonido() {
  const silenciado = Sonidos.alternarMute();
  buscar("#btn-sonido").textContent = silenciado ? "🔇" : "🔊";
  if (!silenciado) Sonidos.boton();
}

/** Conecta todos los botones y eventos de la interfaz una sola vez. */
function conectarEventos() {
  // --- 1 jugador ---
  buscar("#btn-empezar").addEventListener("click", () => {
    Sonidos.boton();
    mostrarPantalla("pantalla-seleccion");
  });

  buscar("#grid-avatares").addEventListener("click", (evento) => {
    const tarjeta = evento.target.closest(".tarjeta-avatar");
    if (tarjeta) {
      Sonidos.boton();
      seleccionarTarjeta(tarjeta);
    }
  });

  const selectorDif = buscar("#selector-dificultad");
  selectorDif.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".boton-dificultad");
    if (boton) {
      Sonidos.boton();
      seleccionarDificultad(boton, selectorDif);
    }
  });

  buscar("#btn-jugar").addEventListener("click", comenzarPartida);
  buscar("#btn-reintentar").addEventListener("click", comenzarPartida);
  buscar("#btn-cambiar-avatar").addEventListener("click", () => {
    Sonidos.boton();
    mostrarPantalla("pantalla-seleccion");
  });

  // --- 2 jugadores ---
  buscar("#btn-dos-jugadores").addEventListener("click", () => {
    Sonidos.boton();
    abrirSetup2P();
  });

  const selectorDif2P = buscar("#selector-dificultad-2p");
  selectorDif2P.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".boton-dificultad");
    if (boton) {
      Sonidos.boton();
      seleccionarDificultad(boton, selectorDif2P);
    }
  });

  buscar("#btn-2p-jugar").addEventListener("click", comenzarRonda2P);
  buscar("#btn-2p-volver").addEventListener("click", () => {
    Sonidos.boton();
    modoAncho(false);
    mostrarPantalla("pantalla-inicio");
  });
  buscar("#btn-2p-revancha").addEventListener("click", () => {
    if (ultimosJugadores2P) {
      iniciarRonda2P(ultimosJugadores2P.j1, ultimosJugadores2P.j2);
    }
  });
  buscar("#btn-2p-menu").addEventListener("click", volverAlMenu);

  // --- Sonido ---
  buscar("#btn-sonido").addEventListener("click", alternarSonido);
}

/** Inicializa la aplicación cuando el HTML está listo. */
function iniciarApp() {
  construirPantallaSeleccion();
  construirSelectorDificultad(buscar("#selector-dificultad"));
  construirSelectorDificultad(buscar("#selector-dificultad-2p"));
  llenarSelectAvatares(buscar("#select-p1"), "messi");
  llenarSelectAvatares(buscar("#select-p2"), "cristiano");
  refrescarRecordInicio();
  conectarEventos();
}

document.addEventListener("DOMContentLoaded", iniciarApp);
