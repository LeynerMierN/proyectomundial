/**
 * juego.js
 * -----------------------------------------------------------------------------
 * Lógica del juego de dominadas. Aquí vive la FÍSICA, el DIBUJO y el bucle
 * principal.
 *
 * Idea del juego: un balón cae por gravedad. El jugador debe tocarlo (clic o
 * barra espaciadora) para impulsarlo hacia arriba. Cada toque suma una dominada.
 * Si el balón toca el suelo, la partida termina.
 *
 * La dificultad (gravedad, fuerza, tolerancia) NO está fija: se recibe desde
 * data/dificultades.js al iniciar la partida.
 *
 * Se expone un único objeto global `Juego`:
 *   Juego.iniciar(jugador, dificultad, alTerminar) -> arranca una partida.
 *   Juego.detener()                                -> detiene el bucle.
 */

const Juego = (function () {
  // ----- Constantes que NO dependen de la dificultad -----
  const RADIO_BALON = 24; // tamaño del balón en píxeles.
  const TOLERANCIA_BASE = 22; // margen base de toque alrededor del balón.

  // ----- Estado de la partida (se reinicia en cada juego) -----
  let lienzo, contexto;
  let balon;
  let puntaje;
  let jugadorActual;
  let dificultadActual;
  let gravedad; // valor que crece durante la partida.
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
   * Es el 58% de la altura, igual que el degradado del fondo.
   */
  function obtenerSuelo() {
    return lienzo.height * 0.58;
  }

  /**
   * Aplica un impulso hacia arriba al balón (una dominada exitosa).
   * @param {number} offsetX - distancia horizontal del toque al centro del
   *   balón; añade efecto lateral para que el juego sea más dinámico.
   */
  function patearBalon(offsetX) {
    balon.vy = dificultadActual.fuerzaToque;
    balon.vx = limitar(balon.vx - offsetX * 0.08, -7, 7);
    puntaje++;
    animacionToque = 12;
    Sonidos.toque(puntaje);
    aumentarDificultad();
    actualizarMarcador();
  }

  /**
   * Sube la gravedad poco a poco cada 5 dominadas para que la dificultad
   * crezca de forma progresiva (sin pasar del tope del nivel).
   */
  function aumentarDificultad() {
    if (puntaje % 5 === 0) {
      gravedad = limitar(
        gravedad + dificultadActual.incremento,
        dificultadActual.gravedadInicial,
        dificultadActual.gravedadMaxima
      );
    }
  }

  /**
   * Comprueba si un clic/tap tocó el balón y, si fue así, lo patea.
   * La zona de toque depende del control del jugador y de la dificultad.
   * @param {number} x - coordenada X del toque dentro del lienzo.
   * @param {number} y - coordenada Y del toque dentro del lienzo.
   */
  function intentarToque(x, y) {
    const tolerancia =
      TOLERANCIA_BASE +
      jugadorActual.control * 2 +
      dificultadActual.toleranciaExtra;
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

  // ----------------------------------------------------------------------------
  //  DIBUJO (inspirado en el estadio del video de referencia)
  // ----------------------------------------------------------------------------

  /** Dibuja el cielo con un degradado y rayos de sol desde arriba. */
  function dibujarCielo() {
    const cielo = contexto.createLinearGradient(0, 0, 0, obtenerSuelo());
    cielo.addColorStop(0, "#7ec8f0");
    cielo.addColorStop(1, "#dff1ff");
    contexto.fillStyle = cielo;
    contexto.fillRect(0, 0, lienzo.width, obtenerSuelo());

    // Rayos de sol: triángulos claros que salen del centro superior.
    contexto.save();
    contexto.translate(lienzo.width / 2, -20);
    contexto.fillStyle = "rgba(255, 255, 200, 0.18)";
    for (let i = 0; i < 8; i++) {
      contexto.rotate((Math.PI * 2) / 8);
      contexto.beginPath();
      contexto.moveTo(0, 0);
      contexto.lineTo(-40, lienzo.height);
      contexto.lineTo(40, lienzo.height);
      contexto.closePath();
      contexto.fill();
    }
    contexto.restore();
  }

  /** Dibuja las gradas con público (puntos de colores). */
  function dibujarGradas() {
    const yGrada = obtenerSuelo() - 46;
    contexto.fillStyle = "#3a3f4b";
    contexto.fillRect(0, yGrada, lienzo.width, 46);

    // Público: filas de pequeños puntos de colores variados.
    const colores = ["#ff5252", "#ffd54f", "#4fc3f7", "#fff", "#81c784"];
    for (let fila = 0; fila < 3; fila++) {
      for (let x = 6; x < lienzo.width; x += 12) {
        contexto.fillStyle = colores[(x + fila) % colores.length];
        contexto.beginPath();
        contexto.arc(x, yGrada + 10 + fila * 12, 2.5, 0, Math.PI * 2);
        contexto.fill();
      }
    }
  }

  /** Dibuja el césped con franjas claras y oscuras. */
  function dibujarCesped() {
    const inicio = obtenerSuelo();
    const alto = lienzo.height - inicio;
    contexto.fillStyle = "#2e8b57";
    contexto.fillRect(0, inicio, lienzo.width, alto);

    contexto.fillStyle = "rgba(255, 255, 255, 0.06)";
    const numFranjas = 6;
    for (let i = 0; i < numFranjas; i += 2) {
      const ancho = lienzo.width / numFranjas;
      contexto.fillRect(i * ancho, inicio, ancho, alto);
    }
  }

  /** Dibuja el contador grande de dominadas, centrado en el cielo. */
  function dibujarContador() {
    contexto.save();
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = "bold 90px Segoe UI, Arial";
    contexto.lineWidth = 6;
    contexto.strokeStyle = "rgba(0, 0, 0, 0.25)";
    contexto.fillStyle = "rgba(255, 255, 255, 0.92)";
    const x = lienzo.width / 2;
    const y = lienzo.height * 0.26;
    contexto.strokeText(puntaje, x, y);
    contexto.fillText(puntaje, x, y);
    contexto.restore();
  }

  /**
   * Dibuja el balón de fútbol (círculo blanco con un centro oscuro).
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
    contexto.strokeStyle = "#1a1a1a";
    contexto.lineWidth = 6;
    contexto.beginPath();
    contexto.moveTo(baseX, baseY - 30);
    contexto.lineTo(baseX - 8, baseY);
    contexto.moveTo(baseX, baseY - 30);
    contexto.lineTo(baseX + 8 + inclina, baseY + inclina);
    contexto.stroke();
    contexto.fillStyle = jugadorActual.colorPrimario;
    contexto.fillRect(baseX - 12, baseY - 55, 24, 28);
    contexto.beginPath();
    contexto.arc(baseX, baseY - 64, 10, 0, Math.PI * 2);
    contexto.fillStyle = jugadorActual.colorPiel;
    contexto.fill();
    contexto.restore();
  }

  /** Pinta una escena completa del estadio en orden (fondo -> frente). */
  function dibujarEscena() {
    dibujarCielo();
    dibujarGradas();
    dibujarCesped();
    dibujarContador();
    dibujarBalon();
    dibujarAvatar();
  }

  /**
   * Refresca el número del marcador superior en pantalla.
   */
  function actualizarMarcador() {
    buscar("#marcador-puntaje").textContent = puntaje;
  }

  /**
   * Dibuja un fotograma completo: actualiza la física y repinta. Si el balón
   * cayó, termina la partida.
   */
  function bucle() {
    const sigueVivo = actualizarFisica();
    dibujarEscena();

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
    lienzo.addEventListener("touchstart", manejarTactil);
    document.addEventListener("keydown", manejarTecla);
  }

  /** Adaptador para eventos táctiles (toma el primer dedo). */
  function manejarTactil(evento) {
    evento.preventDefault();
    manejarToque(evento.touches[0]);
  }

  /** Desconecta los eventos (al terminar o salir) para evitar duplicados. */
  function desactivarControles() {
    lienzo.removeEventListener("mousedown", manejarToque);
    lienzo.removeEventListener("touchstart", manejarTactil);
    document.removeEventListener("keydown", manejarTecla);
  }

  /**
   * Cierra la partida: detiene el bucle, libera controles, suena el resultado
   * y avisa a main.js mediante el callback.
   */
  function terminarPartida() {
    detener();
    const esRecord = guardarRecordSiEsMayor(puntaje);
    if (esRecord && puntaje > 0) {
      Sonidos.record();
    } else {
      Sonidos.gameOver();
    }
    alTerminarCallback(puntaje, esRecord);
  }

  // ---------------- Métodos públicos ----------------

  /**
   * Arranca una partida nueva con el jugador y la dificultad elegidos.
   * @param {Object} jugador - avatar seleccionado.
   * @param {Object} dificultad - nivel elegido (de DIFICULTADES).
   * @param {Function} alTerminar - callback(puntaje, esRecord) al perder.
   */
  function iniciar(jugador, dificultad, alTerminar) {
    jugadorActual = jugador;
    dificultadActual = dificultad;
    alTerminarCallback = alTerminar;
    puntaje = 0;
    gravedad = dificultad.gravedadInicial;

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
