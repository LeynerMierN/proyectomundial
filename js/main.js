/**
 * main.js
 * -----------------------------------------------------------------------------
 * Punto de entrada y "director de orquesta" del juego. No contiene física ni
 * dibujo: solo COORDINA las pantallas y conecta los botones con las acciones.
 *
 * Flujo de pantallas:
 *   inicio -> seleccion (avatar + dificultad) -> juego -> fin
 *
 * Estado mínimo: qué jugador y qué dificultad se eligieron.
 */

// Jugador actualmente seleccionado (objeto de JUGADORES). null = ninguno aún.
let jugadorSeleccionado = null;

// Dificultad seleccionada. Por defecto: "normal".
let dificultadSeleccionada = buscarDificultadPorId("normal");

/**
 * Muestra una pantalla y oculta todas las demás.
 * @param {string} idPantalla - id de la <section> a mostrar.
 */
function mostrarPantalla(idPantalla) {
  document.querySelectorAll(".pantalla").forEach((seccion) => {
    seccion.classList.remove("pantalla--activa");
  });
  buscar("#" + idPantalla).classList.add("pantalla--activa");
}

/**
 * Marca visualmente la tarjeta de avatar elegida y guarda la selección.
 * @param {HTMLElement} tarjeta - la tarjeta sobre la que se hizo clic.
 */
function seleccionarTarjeta(tarjeta) {
  document.querySelectorAll(".tarjeta-avatar").forEach((t) => {
    t.classList.remove("tarjeta-avatar--activa");
  });
  tarjeta.classList.add("tarjeta-avatar--activa");
  jugadorSeleccionado = buscarJugadorPorId(tarjeta.dataset.id);
  buscar("#btn-jugar").disabled = false;
}

/**
 * Crea los botones de dificultad a partir de DIFICULTADES y marca "normal".
 */
function construirSelectorDificultad() {
  const contenedor = buscar("#selector-dificultad");
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
 * Marca visualmente el nivel de dificultad elegido y lo guarda.
 * @param {HTMLElement} boton - el botón de dificultad pulsado.
 */
function seleccionarDificultad(boton) {
  document.querySelectorAll(".boton-dificultad").forEach((b) => {
    b.classList.remove("boton-dificultad--activa");
  });
  boton.classList.add("boton-dificultad--activa");
  dificultadSeleccionada = buscarDificultadPorId(boton.dataset.id);
}

/**
 * Arranca una partida con el jugador y la dificultad seleccionados.
 */
function comenzarPartida() {
  if (!jugadorSeleccionado) return;
  mostrarPantalla("pantalla-juego");
  Juego.iniciar(jugadorSeleccionado, dificultadSeleccionada, mostrarResultado);
}

/**
 * Se ejecuta cuando termina la partida. Muestra el puntaje y el récord.
 * @param {number} puntaje - dominadas conseguidas.
 * @param {boolean} esRecord - true si se batió el récord.
 */
function mostrarResultado(puntaje, esRecord) {
  buscar("#puntaje-final").textContent = puntaje;
  buscar("#mensaje-record").classList.toggle("oculto", !esRecord || puntaje === 0);
  mostrarPantalla("pantalla-fin");
}

/**
 * Actualiza el récord mostrado en la pantalla de inicio.
 */
function refrescarRecordInicio() {
  buscar("#record-inicio").textContent = leerRecord();
}

/**
 * Alterna el sonido global y actualiza el icono del botón.
 */
function alternarSonido() {
  const silenciado = Sonidos.alternarMute();
  buscar("#btn-sonido").textContent = silenciado ? "🔇" : "🔊";
  if (!silenciado) Sonidos.boton(); // confirma que volvió a sonar.
}

/**
 * Conecta todos los botones y eventos de la interfaz una sola vez.
 */
function conectarEventos() {
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

  buscar("#selector-dificultad").addEventListener("click", (evento) => {
    const boton = evento.target.closest(".boton-dificultad");
    if (boton) {
      Sonidos.boton();
      seleccionarDificultad(boton);
    }
  });

  buscar("#btn-jugar").addEventListener("click", comenzarPartida);
  buscar("#btn-reintentar").addEventListener("click", comenzarPartida);

  buscar("#btn-cambiar-avatar").addEventListener("click", () => {
    Sonidos.boton();
    mostrarPantalla("pantalla-seleccion");
  });

  buscar("#btn-sonido").addEventListener("click", alternarSonido);
}

/**
 * Inicializa la aplicación cuando el HTML está listo.
 */
function iniciarApp() {
  construirPantallaSeleccion();
  construirSelectorDificultad();
  refrescarRecordInicio();
  conectarEventos();
}

document.addEventListener("DOMContentLoaded", iniciarApp);
