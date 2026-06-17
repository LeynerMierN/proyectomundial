/**
 * juego.js
 * -----------------------------------------------------------------------------
 * Lógica del juego de dominadas. Aquí vive la FÍSICA y el bucle principal.
 *
 * Idea del juego: un balón cae por gravedad. El jugador debe tocarlo (clic o
 * barra espaciadora) para impulsarlo hacia arriba. Cada toque suma una dominada.
 * Si el balón toca el suelo, la partida termina.
 *
 * Se expone un único objeto global `Juego` con dos métodos públicos:
 *   Juego.iniciar(jugador, alTerminar) -> arranca una partida.
 *   Juego.detener()                    -> detiene el bucle (al salir).
 *
 * El resto son funciones internas pequeñas, cada una con una responsabilidad.
 */

const Juego = (function () {
  // ----- Constantes de física (ajustadas para 60 fps) -----
  const GRAVEDAD_INICIAL = 0.25; // aceleración hacia abajo por fotograma.
  const GRAVEDAD_MAXIMA = 0.55; // tope para que no sea imposible.
  const FUERZA_TOQUE = -9.5; // impulso hacia arriba al tocar (negativo = sube).
  const RADIO_BALON = 24; // tamaño del balón en píxeles.
  const TOLERANCIA_BASE = 26; // margen extra de toque alrededor del balón.

  // ----- Estado de la partida (se reinicia en cada juego) -----
  let lienzo, contexto;
  let balon;
  let puntaje;
  let gravedad;
  let jugadorActual;
  let alTerminarCallback;
  let idAnimacion = null;
  let animacionToque = 0; // contador para la animación del avatar al patear.

  /**
   * Prepara el tamaño del lienzo según su contenedor.
   */
  function configurarLienzo() {
    lienzo = buscar("#lienzo-juego");
    contexto = lienzo.getContext("2d");
    lienzo.width = lienzo.clientWidth || 700;
    lienzo.height = lienzo.clientHeight || 420;
  }

  /**
   * Coloca el balón en su posición inicial con una velocidad suave.
   */
  function reiniciarBalon() {
    balon = {
      x: lienzo.width / 2,
      y: RADIO_BALON + 10,
      vx: (Math.random() - 0.5) * 3, // pequeño desvío horizontal aleatorio.
      vy: 0,
    };
  }

  /**
   * Devuelve la coordenada Y del suelo (donde empieza el césped).
   * Es el 55% de la altura, igual que el degradado del CSS.
   */
  function obtenerSuelo() {
    return lienzo.height * 0.55 + 40;
  }

  /**
   * Aplica un impulso hacia arriba al balón (una dominada exitosa).
   * @param {number} offsetX - distancia horizontal del toque al centro del
   *   balón; añade efecto lateral para que el juego sea más dinámico.
   */
  function patearBalon(offsetX) {
    balon.vy = FUERZA_TOQUE;
    balon.vx = limitar(balon.vx - offsetX * 0.08, -7, 7);
    puntaje++;
    animacionToque = 12;
    aumentarDificultad();
    actualizarMarcador();
  }

  /**
   * Sube la gravedad poco a poco cada 5 dominadas para que la dificultad
   * crezca de forma progresiva.
   */
  function aumentarDificultad() {
    if (puntaje % 5 === 0) {
      gravedad = limitar(gravedad + 0.03, GRAVEDAD_INICIAL, GRAVEDAD_MAXIMA);
    }
  }

  /**
   * Comprueba si un clic/tap tocó el balón y, si fue así, lo patea.
   * @param {number} x - coordenada X del toque dentro del lienzo.
   * @param {number} y - coordenada Y del toque dentro del lienzo.
   */
  function intentarToque(x, y) {
    // El control del jugador agranda la zona de toque (más control = más fácil).
    const tolerancia = TOLERANCIA_BASE + jugadorActual.control * 2;
    if (distancia(x, y, balon.x, balon.y) <= RADIO_BALON + tolerancia) {
      patearBalon(x - balon.x);
    }
  }

  /**
   * Actualiza la posición del balón según su velocidad y la gravedad.
   * También rebota el balón contra las paredes laterales.
   * @returns {boolean} true si el balón sigue en juego; false si tocó el suelo.
   */
  function actualizarFisica() {
    balon.vy += gravedad;
    balon.x += balon.vx;
    balon.y += balon.vy;

    // Rebote en las paredes izquierda y derecha.
    if (balon.x - RADIO_BALON < 0 || balon.x + RADIO_BALON > lienzo.width) {
      balon.vx *= -1;
      balon.x = limitar(balon.x, RADIO_BALON, lienzo.width - RADIO_BALON);
    }

    // ¿Tocó el suelo? -> fin de la partida.
    return balon.y + RADIO_BALON < obtenerSuelo();
  }

  /**
   * Dibuja el balón de fútbol (círculo blanco con pentágonos negros).
   */
  function dibujarBalon() {
    contexto.save();
    contexto.beginPath();
    contexto.arc(balon.x, balon.y, RADIO_BALON, 0, Math.PI * 2);
    contexto.fillStyle = "#ffffff";
    contexto.fill();
    contexto.lineWidth = 2;
    contexto.strokeStyle = "#222";
    contexto.stroke();
    // Pentágono central que da el aspecto de balón.
    contexto.beginPath();
    contexto.arc(balon.x, balon.y, RADIO_BALON * 0.4, 0, Math.PI * 2);
    contexto.fillStyle = "#222";
    contexto.fill();
    contexto.restore();
  }

  /**
   * Dibuja al avatar del jugador en la parte inferior, con sus colores.
   * Hace una pequeña animación de "patada" cuando se toca el balón.
   */
  function dibujarAvatar() {
    const baseX = balon.x; // el jugador sigue al balón horizontalmente.
    const baseY = lienzo.height - 8;
    const inclina = animacionToque > 0 ? -6 : 0;
    if (animacionToque > 0) animacionToque--;

    contexto.save();
    // Piernas
    contexto.strokeStyle = "#1a1a1a";
    contexto.lineWidth = 6;
    contexto.beginPath();
    contexto.moveTo(baseX, baseY - 30);
    contexto.lineTo(baseX - 8, baseY);
    contexto.moveTo(baseX, baseY - 30);
    contexto.lineTo(baseX + 8 + inclina, baseY + inclina);
    contexto.stroke();
    // Cuerpo (camiseta)
    contexto.fillStyle = jugadorActual.colorPrimario;
    contexto.fillRect(baseX - 12, baseY - 55, 24, 28);
    // Cabeza
    contexto.beginPath();
    contexto.arc(baseX, baseY - 64, 10, 0, Math.PI * 2);
    contexto.fillStyle = jugadorActual.colorPiel;
    contexto.fill();
    contexto.restore();
  }

  /**
   * Refresca los números del marcador en pantalla.
   */
  function actualizarMarcador() {
    buscar("#marcador-puntaje").textContent = puntaje;
  }

  /**
   * Dibuja un fotograma completo: limpia, mueve, pinta. Si el balón cayó,
   * termina la partida.
   */
  function bucle() {
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);

    const sigueVivo = actualizarFisica();
    dibujarBalon();
    dibujarAvatar();

    if (!sigueVivo) {
      terminarPartida();
      return;
    }
    idAnimacion = requestAnimationFrame(bucle);
  }

  /**
   * Convierte las coordenadas de un evento del ratón/tacto a coordenadas
   * internas del lienzo y prueba el toque.
   * @param {MouseEvent|Touch} evento
   */
  function manejarToque(evento) {
    const rect = lienzo.getBoundingClientRect();
    const x = (evento.clientX - rect.left) * (lienzo.width / rect.width);
    const y = (evento.clientY - rect.top) * (lienzo.height / rect.height);
    intentarToque(x, y);
  }

  /** Maneja la barra espaciadora: patea el balón si está al alcance. */
  function manejarTecla(evento) {
    if (evento.code === "Space") {
      evento.preventDefault();
      intentarToque(balon.x, balon.y); // tocar el centro = siempre acierta.
    }
  }

  /** Conecta los eventos de entrada (ratón, tacto, teclado). */
  function activarControles() {
    lienzo.addEventListener("mousedown", manejarToque);
    lienzo.addEventListener("touchstart", (e) => {
      e.preventDefault();
      manejarToque(e.touches[0]);
    });
    document.addEventListener("keydown", manejarTecla);
  }

  /** Desconecta los eventos (al terminar o salir) para evitar duplicados. */
  function desactivarControles() {
    lienzo.removeEventListener("mousedown", manejarToque);
    document.removeEventListener("keydown", manejarTecla);
  }

  /**
   * Cierra la partida: detiene el bucle, libera controles y avisa a main.js
   * mediante el callback que recibió al iniciar.
   */
  function terminarPartida() {
    detener();
    const esRecord = guardarRecordSiEsMayor(puntaje);
    alTerminarCallback(puntaje, esRecord);
  }

  // ---------------- Métodos públicos ----------------

  /**
   * Arranca una partida nueva con el jugador elegido.
   * @param {Object} jugador - avatar seleccionado.
   * @param {Function} alTerminar - callback(puntaje, esRecord) al perder.
   */
  function iniciar(jugador, alTerminar) {
    jugadorActual = jugador;
    alTerminarCallback = alTerminar;
    puntaje = 0;
    gravedad = GRAVEDAD_INICIAL;

    configurarLienzo();
    reiniciarBalon();
    activarControles();

    buscar("#marcador-jugador").textContent = jugador.bandera;
    buscar("#marcador-record").textContent = leerRecord();
    actualizarMarcador();

    bucle();
  }

  /** Detiene el bucle y los controles sin terminar la partida formalmente. */
  function detener() {
    if (idAnimacion) cancelAnimationFrame(idAnimacion);
    idAnimacion = null;
    desactivarControles();
  }

  return { iniciar, detener };
})();
