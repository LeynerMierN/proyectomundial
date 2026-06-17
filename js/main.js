/**
 * main.js
 * -----------------------------------------------------------------------------
 * Punto de entrada y "director de orquesta" del juego. No contiene física ni
 * dibujo: solo COORDINA las pantallas y conecta los botones con las acciones.
 *
 * Flujo de pantallas:
 *   inicio -> seleccion -> juego -> fin -> (reintentar / cambiar avatar)
 *
 * Mantiene el mínimo de estado: qué jugador se eligió.
 */

// Jugador actualmente seleccionado (objeto de JUGADORES). null = ninguno aún.
let jugadorSeleccionado = null;

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
 * Marca visualmente la tarjeta elegida y habilita el botón de jugar.
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
 * Arranca una partida con el jugador seleccionado y pasa a la pantalla de juego.
 */
function comenzarPartida() {
  if (!jugadorSeleccionado) return;
  mostrarPantalla("pantalla-juego");
  Juego.iniciar(jugadorSeleccionado, mostrarResultado);
}

/**
 * Se ejecuta cuando termina la partida. Muestra el puntaje y el récord.
 * @param {number} puntaje - dominadas conseguidas.
 * @param {boolean} esRecord - true si se batió el récord.
 */
function mostrarResultado(puntaje, esRecord) {
  buscar("#puntaje-final").textContent = puntaje;
  buscar("#mensaje-record").classList.toggle("oculto", !esRecord);
  mostrarPantalla("pantalla-fin");
}

/**
 * Actualiza el récord mostrado en la pantalla de inicio.
 */
function refrescarRecordInicio() {
  buscar("#record-inicio").textContent = leerRecord();
}

/**
 * Conecta todos los botones y eventos de la interfaz una sola vez.
 */
function conectarEventos() {
  buscar("#btn-empezar").addEventListener("click", () => {
    mostrarPantalla("pantalla-seleccion");
  });

  buscar("#grid-avatares").addEventListener("click", (evento) => {
    const tarjeta = evento.target.closest(".tarjeta-avatar");
    if (tarjeta) seleccionarTarjeta(tarjeta);
  });

  buscar("#btn-jugar").addEventListener("click", comenzarPartida);
  buscar("#btn-reintentar").addEventListener("click", comenzarPartida);

  buscar("#btn-cambiar-avatar").addEventListener("click", () => {
    mostrarPantalla("pantalla-seleccion");
  });
}

/**
 * Inicializa la aplicación cuando el HTML está listo.
 */
function iniciarApp() {
  construirPantallaSeleccion();
  refrescarRecordInicio();
  conectarEventos();
}

document.addEventListener("DOMContentLoaded", iniciarApp);
