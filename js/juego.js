/**
 * juego.js
 * -----------------------------------------------------------------------------
 * Motor del juego de dominadas con apartado visual Premium Cyberpunk Arcade
 * y soporte para renderizado de sprites reales desde la carpeta assets/.
 * * Correcciones aplicadas:
 * - Solucionado exploit de barra espaciadora (Hitbox vertical obligatoria).
 * - Ajuste de proporciones y escala para imágenes reales (.png).
 */

// Constantes globales de la física del balón
const RADIO_BALON = 22;
const TOLERANCIA_BASE = 10;

/**
 * Crea una partida independiente sobre un canvas dado con renderizado avanzado.
 * @param {HTMLCanvasElement} lienzo - el canvas donde se dibuja.
 * @param {Object} jugador - avatar (de JUGADORES).
 * @param {Object} dificultad - nivel (de DIFICULTADES).
 * @returns {Object} API de la partida.
 */
function crearPartida(lienzo, jugador, dificultad) {
  const contexto = lienzo.getContext("2d");

  // Estado propio de esta partida.
  let balon;
  let puntaje = 0;
  let gravedad = dificultad.gravedadInicial;
  let animacionToque = 0;
  let viva = true;

  // ============================================================================
  // 📸 CONFIGURACIÓN Y CARGA DE SPRITES DESDE LA CARPETA ASSETS
  // ============================================================================
  const spriteJugador = new Image();
  
  let nombreArchivo = "mbappe"; 
  if (typeof jugador !== "undefined" && jugador) {
    if (jugador.id) {
      nombreArchivo = String(jugador.id).toLowerCase();
    } else if (jugador.nombre) {
      nombreArchivo = String(jugador.nombre).toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");
    }
  }
  
  spriteJugador.src = `assets/${nombreArchivo}.png`;

  /** Ajusta el tamaño interno del canvas al tamaño que ocupa en pantalla. */
  function configurar() {
    lienzo.width = lienzo.clientWidth || 360;
    lienzo.height = lienzo.clientHeight || 480;
    reiniciarBalon();
  }

  /** Coloca el balón arriba con un leve desvío horizontal. */
  function reiniciarBalon() {
    balon = {
      x: lienzo.width / 2,
      y: RADIO_BALON + 10,
      vx: (Math.random() - 0.5) * 3,
      vy: 0,
    };
  }

  /** Coordenada Y del suelo (inicio del césped). */
  function obtenerSuelo() {
    return lienzo.height * 0.58;
  }

  /** Impulsa el balón hacia arriba (una dominada). */
  function patear(offsetX) {
    balon.vy = dificultad.fuerzaToque;
    balon.vx = limitar(balon.vx - offsetX * 0.08, -7, 7);
    puntaje++;
    animacionToque = 12;
    if (typeof Sonidos !== 'undefined' && Sonidos.toque) {
      Sonidos.toque(puntaje);
    }
    aumentarDificultad();
  }

  /** Sube la gravedad cada 8 dominadas sin pasar del tope. */
  function aumentarDificultad() {
    if (puntaje % 8 === 0) {
      gravedad = limitar(
        gravedad + dificultad.incremento,
        dificultad.gravedadInicial,
        dificultad.gravedadMaxima
      );
    }
  }

  /** Margen de toque según el control del jugador y la dificultad. */
  function tolerancia() {
    return TOLERANCIA_BASE + jugador.control * 1.5 + dificultad.toleranciaExtra;
  }

  /** Intenta tocar en una coordenada del canvas; patea si acierta el balón. */
  function tocarEn(x, y) {
    if (!viva) return;
    if (distancia(x, y, balon.x, balon.y) <= RADIO_BALON + tolerancia()) {
      patear(x - balon.x);
    }
  }

  /** 🛡️ CORREGIDO: Toca el centro del balón mediante teclado (Barra Espaciadora) */
  function tocarCentro() {
    if (!viva || !balon) return;
    
    // Definimos la altura ideal de los pies (justo encima del suelo)
    const alturaPies = obtenerSuelo() - 25;
    
    // El jugador solo puede golpear si el balón está en la zona baja de la pantalla
    // Esto destruye el exploit de puntos infinitos en el aire.
    if (balon.y >= alturaPies - 80 && balon.y <= alturaPies + 20) {
      patear(0); // Ejecuta una patada limpia hacia arriba
    }
  }

  /** Avanza la física un fotograma. */
  function actualizar() {
    if (!viva) return false;
    balon.vy += gravedad;
    balon.x += balon.vx;
    balon.y += balon.vy;

    if (balon.x - RADIO_BALON < 0 || balon.x + RADIO_BALON > lienzo.width) {
      balon.vx *= -1;
      balon.x = limitar(balon.x, RADIO_BALON, lienzo.width - RADIO_BALON);
    }

    if (balon.y + RADIO_BALON >= obtenerSuelo()) {
      viva = false;
    }
    return viva;
  }

  // ============================================================================
  // 🎨 BLOQUE DE RENDERIZADO: Gráficos del Estadio Neón Cyberpunk
  // ============================================================================

  function dibujarCielo() {
    const cielo = contexto.createLinearGradient(0, 0, 0, obtenerSuelo());
    cielo.addColorStop(0, "#0f172a"); 
    cielo.addColorStop(0.6, "#1e1b4b"); 
    cielo.addColorStop(1, "#311042"); 
    contexto.fillStyle = cielo;
    contexto.fillRect(0, 0, lienzo.width, obtenerSuelo());

    contexto.save();
    contexto.fillStyle = "rgba(0, 240, 255, 0.03)";
    for (let i = 1; i <= 3; i++) {
      const posX = (lienzo.width / 4) * i;
      contexto.beginPath();
      contexto.moveTo(posX, 0);
      contexto.lineTo(posX - 50, obtenerSuelo());
      contexto.lineTo(posX + 50, obtenerSuelo());
      contexto.closePath();
      contexto.fill();
    }
    contexto.restore();
  }

  function dibujarGradas() {
    const yGrada = obtenerSuelo() - 46;
    contexto.fillStyle = "#0f111a";
    contexto.fillRect(0, yGrada, lienzo.width, 46);
    
    contexto.strokeStyle = "#ff007f";
    contexto.lineWidth = 1.5;
    contexto.beginPath();
    contexto.moveTo(0, yGrada);
    contexto.lineTo(lienzo.width, yGrada);
    contexto.stroke();

    const colores = ["#ff5252", "#ffd54f", "#00f0ff", "#ffffff", "#81c784"];
    contexto.save();
    for (let fila = 0; fila < 3; fila++) {
      for (let x = 6; x < lienzo.width; x += 12) {
        const desvioY = Math.sin((Date.now() * 0.004) + x) * 1.2;
        contexto.fillStyle = colores[(x + fila) % colores.length];
        contexto.beginPath();
        contexto.arc(x, yGrada + 10 + fila * 12 + desvioY, 1.8, 0, Math.PI * 2);
        contexto.fill();
      }
    }
    contexto.restore();
  }

  function dibujarCesped() {
    const inicio = obtenerSuelo();
    const alto = lienzo.height - inicio;
    
    const gradienteCesped = contexto.createLinearGradient(0, inicio, 0, lienzo.height);
    gradienteCesped.addColorStop(0, "#064e3b"); 
    gradienteCesped.addColorStop(1, "#022c22");
    contexto.fillStyle = gradienteCesped;
    contexto.fillRect(0, inicio, lienzo.width, alto);

    contexto.fillStyle = "rgba(0, 240, 255, 0.015)";
    const ancho = lienzo.width / 6;
    for (let i = 0; i < 6; i += 2) {
      contexto.fillRect(i * ancho, inicio, ancho, alto);
    }

    contexto.strokeStyle = "rgba(255, 255, 255, 0.2)";
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.moveTo(0, inicio + 2);
    contexto.lineTo(lienzo.width, inicio + 2);
    contexto.stroke();
  }

  function dibujarContador() {
    contexto.save();
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = `bold ${Math.round(lienzo.height * 0.22)}px 'Segoe UI', Arial, sans-serif`;
    
    contexto.shadowBlur = 15;
    contexto.shadowColor = "rgba(0, 240, 255, 0.5)";
    contexto.strokeStyle = "rgba(0, 240, 255, 0.1)";
    contexto.lineWidth = 6;
    contexto.strokeText(puntaje, lienzo.width / 2, lienzo.height * 0.26);
    
    contexto.fillStyle = "rgba(255, 255, 255, 0.07)";
    contexto.fillText(puntaje, lienzo.width / 2, lienzo.height * 0.26);
    contexto.restore();
  }

  function dibujarBalon() {
    if (!balon) return;
    contexto.save();
    
    contexto.shadowBlur = Math.min(10 + puntaje, 25);
    contexto.shadowColor = "#00f0ff";

    contexto.beginPath();
    contexto.arc(balon.x, balon.y, RADIO_BALON, 0, Math.PI * 2);
    contexto.fillStyle = "#ffffff";
    contexto.fill();
    contexto.lineWidth = 2.5;
    contexto.strokeStyle = "#1a1a1a";
    contexto.stroke();

    contexto.shadowBlur = 0; 
    contexto.strokeStyle = "rgba(26, 26, 26, 0.6)";
    contexto.lineWidth = 1.2;
    
    contexto.fillStyle = "#1a1a1a";
    contexto.beginPath();
    contexto.arc(balon.x, balon.y, RADIO_BALON * 0.35, 0, Math.PI * 2);
    contexto.fill();

    for (let i = 0; i < 5; i++) {
      const angulo = (i * Math.PI * 2) / 5;
      contexto.beginPath();
      contexto.moveTo(
        balon.x + Math.cos(angulo) * (RADIO_BALON * 0.35), 
        balon.y + Math.sin(angulo) * (RADIO_BALON * 0.35)
      );
      contexto.lineTo(
        balon.x + Math.cos(angulo) * RADIO_BALON, 
        balon.y + Math.sin(angulo) * RADIO_BALON
      );
      contexto.stroke();
    }
    contexto.restore();
  }

  function dibujarAvatar() {
    if (!balon) return;

    const baseX = balon.x;
    // Bajamos la base un poco más hacia el fondo del lienzo para asentar imágenes grandes
    const baseY = lienzo.height; 
    const inclina = animacionToque > 0 ? -0.12 : 0; 
    if (animacionToque > 0) animacionToque--;

    contexto.save();

    // 🌟 RENDERIZADO CORREGIDO: Proporciones HD para imágenes reales (.png)
    if (spriteJugador && spriteJugador.complete && spriteJugador.naturalWidth > 0) {
      contexto.save();
      contexto.translate(baseX, baseY);
      
      if (inclina !== 0) {
        contexto.rotate(inclina);
      }
      
      // Aumentamos dimensiones globales para que no se vea minúsculo en el split screen
      const anchoSprite = 110;
      const altoSprite = 140;
      
      // Renderizamos la imagen ajustando el desfase vertical para que pise el suelo de forma natural
      contexto.drawImage(spriteJugador, -anchoSprite / 2, -altoSprite + 10, anchoSprite, altoSprite);
      contexto.restore();
    } else {
      // 📐 RESPALDO GEOMÉTRICO MODERNO
      const sueloPalito = lienzo.height - 8;
      contexto.strokeStyle = "#1a1a1a";
      contexto.lineWidth = 5;
      contexto.lineCap = "round";
      contexto.beginPath();
      contexto.moveTo(baseX, sueloPalito - 30);
      contexto.lineTo(baseX - 8, sueloPalito);
      contexto.moveTo(baseX, sueloPalito - 30);
      contexto.lineTo(baseX + 8 + (inclina * 50), sueloPalito + (inclina * 50));
      contexto.stroke();

      contexto.fillStyle = (jugador && jugador.colorPrimario) ? jugador.colorPrimario : "#333";
      contexto.fillRect(baseX - 13, sueloPalito - 55, 26, 26);
      
      contexto.fillStyle = "#fff";
      contexto.beginPath();
      contexto.moveTo(baseX - 5, sueloPalito - 55);
      contexto.lineTo(baseX + 5, sueloPalito - 55);
      contexto.lineTo(baseX, sueloPalito - 49);
      contexto.closePath();
      contexto.fill();

      contexto.beginPath();
      contexto.arc(baseX, sueloPalito - 66, 11, 0, Math.PI * 2);
      contexto.fillStyle = (jugador && jugador.colorPiel) ? jugador.colorPiel : "#f39c12";
      contexto.fill();
      contexto.lineWidth = 1.5;
      contexto.strokeStyle = "#1a1a1a";
      contexto.stroke();

      contexto.fillStyle = "#1a1a1a";
      contexto.beginPath();
      contexto.arc(baseX - 3.5, sueloPalito - 67, 1.5, 0, Math.PI * 2);
      contexto.arc(baseX + 3.5, sueloPalito - 67, 1.5, 0, Math.PI * 2);
      contexto.fill();
    }
    
    contexto.restore();
  }

  function dibujarFueraDeJuego() {
    contexto.save();
    contexto.fillStyle = "rgba(15, 23, 42, 0.65)";
    contexto.fillRect(0, 0, lienzo.width, lienzo.height);
    
    contexto.fillStyle = "#ffffff";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = "bold 28px 'Segoe UI', Arial";
    contexto.shadowBlur = 10;
    contexto.shadowColor = "#ff007f";
    contexto.fillText("¡FUERA! 😵", lienzo.width / 2, lienzo.height / 2);
    contexto.restore();
  }

  function dibujar() {
    dibujarCielo();
    dibujarGradas();
    dibujarCesped();
    dibujarContador();
    dibujarBalon();
    dibujarAvatar();
    if (!viva) dibujarFueraDeJuego();
  }

  return {
    configurar,
    tocarEn,
    tocarCentro,
    actualizar,
    dibujar,
    get puntaje() { return puntaje; },
    get viva() { return viva; },
  };
}

function coordenadasEnLienzo(lienzo, evento) {
  const rect = lienzo.getBoundingClientRect();
  return {
    x: (evento.clientX - rect.left) * (lienzo.width / rect.width),
    y: (evento.clientY - rect.top) * (lienzo.height / rect.height),
  };
}

if (typeof limitar !== 'function') {
  function limitar(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }
}
if (typeof distancia !== 'function') {
  function distancia(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}

// ============================================================================
//  Controlador del modo de 1 JUGADOR
// ============================================================================
const Juego = (function () {
  let lienzo;
  let partida;
  let alTerminarCallback;
  let idAnimacion = null;

  function buscarElemento(selector) {
    if (typeof buscar === 'function') return buscar(selector);
    return document.querySelector(selector);
  }

  function manejarToque(evento) {
    const p = coordenadasEnLienzo(lienzo, evento);
    partida.tocarEn(p.x, p.y);
  }

  function manejarTactil(evento) {
    evento.preventDefault();
    if (evento.touches.length > 0) manejarToque(evento.touches[0]);
  }

  function manejarTecla(evento) {
    if (evento.code === "Space") {
      evento.preventDefault();
      partida.tocarCentro();
    }
  }

  function activarControles() {
    lienzo.addEventListener("mousedown", manejarToque);
    lienzo.addEventListener("touchstart", manejarTactil, { passive: false });
    document.addEventListener("keydown", manejarTecla);
  }

  function desactivarControles() {
    lienzo.removeEventListener("mousedown", manejarToque);
    lienzo.removeEventListener("touchstart", manejarTactil);
    document.removeEventListener("keydown", manejarTecla);
  }

  function bucle() {
    const viva = partida.actualizar();
    partida.partida ? null : partida.dibujar(); 
    
    const elPuntaje = buscarElemento("#marcador-puntaje");
    if (elPuntaje) elPuntaje.textContent = partida.puntaje;

    if (!viva) {
      terminarPartida();
      return;
    }
    idAnimacion = requestAnimationFrame(bucle);
  }

  function terminarPartida() {
    detener();
    let esRecord = false;
    if (typeof guardarRecordSiEsMayor === 'function') {
      esRecord = guardarRecordSiEsMayor(partida.puntaje);
    }
    
    if (typeof Sonidos !== 'undefined') {
      if (esRecord && partida.puntaje > 0 && Sonidos.record) Sonidos.record();
      else if (Sonidos.gameOver) Sonidos.gameOver();
    }
    
    if (alTerminarCallback) alTerminarCallback(partida.puntaje, esRecord);
  }

  function iniciar(jugador, dificultad, alTerminar) {
    lienzo = buscarElemento("#lienzo-juego");
    if (!lienzo) return;
    
    alTerminarCallback = alTerminar;
    partida = crearPartida(lienzo, jugador, dificultad);
    partida.configurar();
    activarControles();

    const mJugador = buscarElemento("#marcador-jugador");
    if (mJugador) mJugador.textContent = jugador.bandera || "";
    
    const mRecord = buscarElemento("#marcador-record");
    if (mRecord && typeof leerRecord === 'function') mRecord.textContent = leerRecord();
    
    const mPuntaje = buscarElemento("#marcador-puntaje");
    if (mPuntaje) mPuntaje.textContent = 0;

    bucle();
  }

  function detener() {
    if (idAnimacion) cancelAnimationFrame(idAnimacion);
    idAnimacion = null;
    if (lienzo) desactivarControles();
  }

  return { iniciar, detener };
})();