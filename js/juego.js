/**
 * juego.js
 * -----------------------------------------------------------------------------
 * Motor del juego de dominadas. Contiene:
 *
 *   1) crearPartida(lienzo, jugador, dificultad, opciones)
 *      Una "fábrica" que devuelve UNA partida independiente: tiene su propio
 *      balón, puntaje, física y dibujo sobre su propio canvas. Se reutiliza
 *      tanto en 1 jugador como en cada mitad del modo de 2 jugadores (DRY).
 *
 *      `opciones.alAnotar(info)` es un gancho OPCIONAL que se llama cada vez
 *      que se acierta un toque. juego.js no sabe nada de "personalidad" o
 *      mensajes de hinchada — eso vive en sazon.js. Aquí solo se REPORTA lo
 *      que pasó (puntaje, jugador, si fue un toque "raspando" el borde, y una
 *      función `pausar` para congelar la física unos milisegundos); quien
 *      escucha decide qué hacer con esa información. Así el motor se queda
 *      neutral y la "sazón" del juego (chiste, mensajes, hitos) se puede
 *      cambiar sin tocar la física.
 *
 *   2) Juego  -> controlador del modo de 1 JUGADOR (usa una sola partida).
 *      Juego.iniciar(jugador, dificultad, alTerminar)
 *      Juego.detener()
 *
 * El modo de 2 jugadores vive en dosjugadores.js y también usa crearPartida().
 */

const RADIO_BALON = 22;
const TOLERANCIA_BASE = 10;
// Tamaño del avatar (piernas, cuerpo y cabeza) respecto al diseño original.
// Subir este número agranda al jugador SIN desproporcionarlo, porque todas
// las partes se dibujan como múltiplos de esta misma escala, ancladas a los
// pies (que siempre quedan fijos justo encima del césped).
const ESCALA_AVATAR = 1.35;

// Caché de fotos reales por id de jugador (ver `foto` en data/jugadores.js).
// Es a nivel de módulo (no dentro de crearPartida) para que la imagen se
// cargue UNA sola vez aunque el jugador juegue varias partidas seguidas.
// Cada imagen se carga una sola vez aunque el jugador juegue varias partidas.
const cacheFotosJugadores = {};

/**
 * Devuelve el <img> de la foto de un jugador, cargándola la primera vez que
 * se pide. La ruta es la del campo `foto` si existe, o por defecto
 * `assets/<id>.png` — la MISMA convención que usan las cartas de selección
 * (ver avatares.js). Así todos los jugadores muestran su foto real también
 * dentro del juego, sin tener que listarla uno por uno.
 *
 * Mientras la imagen no haya terminado de cargar (es asíncrono), o si el
 * archivo no existe, dibujarAvatar() sigue usando el muñeco vectorial de
 * respaldo sin que se note ningún error ni un parpadeo en blanco.
 * @param {Object} jugador
 * @returns {HTMLImageElement} la imagen (puede no estar lista aún).
 */
function obtenerFotoJugador(jugador) {
  if (!cacheFotosJugadores[jugador.id]) {
    const imagen = new Image();
    imagen.src = jugador.foto || `assets/${jugador.id}.png`;
    cacheFotosJugadores[jugador.id] = imagen;
  }
  return cacheFotosJugadores[jugador.id];
}

/**
 * Crea una partida independiente sobre un canvas dado.
 * @param {HTMLCanvasElement} lienzo - el canvas donde se dibuja.
 * @param {Object} jugador - avatar (de JUGADORES).
 * @param {Object} dificultad - nivel (de DIFICULTADES).
 * @param {Object} [opciones] - ganchos opcionales; ver `alAnotar` arriba.
 * @returns {Object} API de la partida (ver el return al final).
 */
function crearPartida(lienzo, jugador, dificultad, opciones = {}) {
  const contexto = lienzo.getContext("2d");

  // Contenedor visual donde vive este canvas (la pantalla completa en 1
  // jugador, o solo la mitad de esta persona en 2 jugadores). Se calcula una
  // sola vez aquí porque cada quien que escuche `alAnotar` (p. ej. sazon.js)
  // necesita saber EN QUÉ MITAD de la pantalla mostrar su mensaje, sin tener
  // que adivinar la estructura del HTML por su cuenta.
  const contenedor = lienzo.closest(".campo-2p, .pantalla") || lienzo.parentElement;

  // Estado propio de esta partida.
  let balon;
  let puntaje = 0;
  let gravedad = dificultad.gravedadInicial;
  let animacionToque = 0;
  let viva = true;
  // Por qué terminó la partida: "suelo" (el balón cayó solo) o "falla" (el
  // jugador tocó/presionó fuera de la zona válida). Se usa para mostrar un
  // mensaje distinto y para no celebrar como si el balón hubiera caído solo.
  let motivoDerrota = "suelo";
  // Pausa temporal (distinta de "viva"): permite congelar la física unos
  // milisegundos sin terminar la partida, p. ej. para la mecánica de
  // distracción de sazon.js. Mientras está en true, ningún clic/tecla cuenta
  // (ni a favor ni en contra) y el balón no se mueve.
  let pausado = false;

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
      // Ángulo de giro (en radianes). Hace que los paneles del balón roten
      // según hacia dónde se mueve, como un balón real que rueda en el aire.
      angulo: Math.random() * Math.PI * 2,
    };
  }

  /** Coordenada Y del suelo (inicio del césped). */
  function obtenerSuelo() {
    return lienzo.height * 0.58;
  }

  /**
   * Impulsa el balón hacia arriba (una dominada).
   * @param {number} offsetX - desfase horizontal del toque para dar efecto.
   * @param {boolean} fueRasguno - true si el toque acertó pero raspando el
   *   borde de la zona válida (casi se le escapa). Es solo informativo: no
   *   cambia la física, únicamente se reporta a quien escuche `alAnotar`.
   */
  function patear(offsetX, fueRasguno = false) {
    balon.vy = dificultad.fuerzaToque;
    balon.vx = limitar(balon.vx - offsetX * 0.08, -7, 7);
    puntaje++;
    animacionToque = 12;
    if (typeof Sonidos !== "undefined" && Sonidos.toque) {
      Sonidos.toque(puntaje);
    }
    aumentarDificultad();
    if (typeof opciones.alAnotar === "function") {
      opciones.alAnotar({ puntaje, jugador, fueRasguno, contenedor, pausar });
    }
  }

  /**
   * Congela esta partida por `duracionMs` sin terminarla, y al reanudar le
   * aplica un impulso vertical. Pensado para que sazon.js pueda "despistar"
   * al jugador en un hito (p. ej. al llegar a 10 dominadas) sin acoplar esa
   * idea a la física del juego.
   * @param {number} duracionMs
   * @param {number} [impulsoAlReanudar] - nueva velocidad vertical al volver.
   */
  function pausar(duracionMs, impulsoAlReanudar) {
    if (!viva) return;
    pausado = true;
    setTimeout(() => {
      if (!viva) return; // la partida pudo terminar mientras estaba en pausa.
      pausado = false;
      if (typeof impulsoAlReanudar === "number") balon.vy = impulsoAlReanudar;
    }, duracionMs);
  }

  /** Sube la gravedad cada 8 dominadas (8, 16, 24...), sin pasar del tope. */
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

  /**
   * Banda vertical "alcanzable" para el toque por teclado. La barra
   * espaciadora no tiene una posición de clic, así que en su lugar exige
   * TIEMPO: solo cuenta si el balón ya está cerca del avatar (abajo), igual
   * que en la vida real solo puedes golpear el balón cuando te llega al pie.
   * Usa el mismo margen que el clic, así que la misma dificultad/control que
   * agranda o achica la zona del clic también agranda o achica esta banda.
   */
  function zonaAlcance() {
    const alto = (RADIO_BALON + tolerancia()) * 2;
    const hasta = obtenerSuelo() - 4; // justo antes del límite que es derrota.
    return { desde: hasta - alto, hasta };
  }

  /**
   * Marca la partida como perdida por un toque fallido (clic fuera del balón
   * o espacio fuera de tiempo). A diferencia de que el balón caiga solo, este
   * es un error del jugador: por eso el balón "sale disparado" con fuerza,
   * como castigo visual claro, y se guarda el motivo para mostrar un mensaje
   * distinto al final.
   */
  function fallar() {
    if (!viva) return;
    viva = false;
    motivoDerrota = "falla";
    balon.vy = Math.max(12, Math.abs(dificultad.fuerzaToque) * 1.4);
  }

  /**
   * Intenta tocar en una coordenada del canvas. Es estricto: si el clic/tap
   * no cae sobre el balón (dentro de la tolerancia), la partida termina ahí
   * mismo. Así ya no se puede "spamear clics" sin riesgo: cada intento cuenta.
   * Mientras la partida está en pausa (ver `pausar`), se ignora el toque por
   * completo: no debe contar ni a favor ni en contra.
   */
  function tocarEn(x, y) {
    if (!viva || pausado) return;
    const distanciaAlCentro = distancia(x, y, balon.x, balon.y);
    const limite = RADIO_BALON + tolerancia();
    if (distanciaAlCentro <= limite) {
      // "Raspó" el borde de la zona si quedó en el 20% más externo del
      // margen permitido: acertó, pero por poco (para el aviso de susto).
      const fueRasguno = distanciaAlCentro >= limite * 0.8;
      patear(x - balon.x, fueRasguno);
    } else {
      fallar();
    }
  }

  /**
   * Toca el balón por teclado. Solo acierta si el balón está dentro de la
   * zona de alcance (ver zonaAlcance); fuera de tiempo, es una falta y
   * termina la partida igual que un clic errado. Mismo criterio de pausa
   * que `tocarEn`.
   */
  function tocarCentro() {
    if (!viva || pausado) return;
    const zona = zonaAlcance();
    if (balon.y >= zona.desde && balon.y <= zona.hasta) {
      // "Raspó" si el balón está en el 20% más cercano al límite REAL que
      // termina la partida (obtenerSuelo() - RADIO_BALON, ver actualizar()),
      // el mismo criterio proporcional que usa el clic. No se usa un margen
      // fijo en píxeles porque, al caer, el balón avanza cada vez más rápido
      // por fotograma: un margen fijo pequeño podría "saltarse" entre un
      // fotograma y el siguiente y nunca detectarse.
      const limiteReal = obtenerSuelo() - RADIO_BALON;
      const margenRasguno = (limiteReal - zona.desde) * 0.2;
      const fueRasguno = limiteReal - balon.y <= margenRasguno;
      patear(0, fueRasguno);
    } else {
      fallar();
    }
  }

  /**
   * Avanza la física un fotograma.
   * @returns {boolean} si la partida sigue viva.
   */
  function actualizar() {
    if (!viva) return false;
    if (pausado) return true; // congelado: no hay gravedad ni movimiento.
    balon.vy += gravedad;
    balon.x += balon.vx;
    balon.y += balon.vy;
    // El giro depende de la velocidad horizontal (rueda hacia donde va) y un
    // poco de la vertical, para que se note que el balón gira al subir y caer.
    balon.angulo += balon.vx * 0.05 + balon.vy * 0.004;

    if (balon.x - RADIO_BALON < 0 || balon.x + RADIO_BALON > lienzo.width) {
      balon.vx *= -1;
      balon.x = limitar(balon.x, RADIO_BALON, lienzo.width - RADIO_BALON);
    }

    if (balon.y + RADIO_BALON >= obtenerSuelo()) {
      viva = false;
      // Si ya estaba marcada como "falla" (un fallar() reciente la tumbó),
      // se respeta ese motivo; si no, fue el balón cayendo solo.
      if (motivoDerrota !== "falla") motivoDerrota = "suelo";
    }
    return viva;
  }

  // -------- Dibujo del estadio (estilo neón cyberpunk) --------

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
        const desvioY = Math.sin(Date.now() * 0.004 + x) * 1.2;
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

  /** Contador grande centrado; su tamaño se adapta a la altura del canvas. */
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

  /**
   * Sombra elíptica del balón en el césped. Se encoge y se aclara cuanto más
   * alto está el balón, lo que da una fuerte sensación de profundidad (se
   * "lee" a qué altura va sin mirar el balón).
   */
  function dibujarSombraBalon() {
    const suelo = obtenerSuelo();
    const distanciaAlSuelo = suelo - (balon.y + RADIO_BALON);
    // factor 1 = pegado al suelo (sombra grande y oscura); ~0.2 = bien arriba.
    const factor = limitar(1 - distanciaAlSuelo / (lienzo.height * 0.55), 0.2, 1);
    contexto.save();
    contexto.beginPath();
    contexto.ellipse(
      balon.x,
      suelo + 8,
      RADIO_BALON * factor,
      RADIO_BALON * 0.32 * factor,
      0,
      0,
      Math.PI * 2
    );
    contexto.fillStyle = `rgba(0, 0, 0, ${0.22 * factor})`;
    contexto.fill();
    contexto.restore();
  }

  /** Traza (sin pintar) un pentágono centrado en (cx, cy). */
  function trazarPentagono(cx, cy, radio, rotacion) {
    contexto.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = rotacion + i * ((Math.PI * 2) / 5) - Math.PI / 2;
      const px = cx + Math.cos(a) * radio;
      const py = cy + Math.sin(a) * radio;
      if (i === 0) contexto.moveTo(px, py);
      else contexto.lineTo(px, py);
    }
    contexto.closePath();
  }

  /**
   * Paneles negros del balón (estilo clásico "Telstar"): un pentágono central
   * y cinco alrededor, más las costuras que los unen. Se dibuja ya rotado por
   * el ángulo del balón, así que parece girar de verdad.
   */
  function dibujarPanelesBalon(r) {
    contexto.fillStyle = "#1c1c1c";

    const radioCentral = r * 0.4;
    trazarPentagono(0, 0, radioCentral, 0);
    contexto.fill();

    const radioExterno = r * 0.32;
    const distancia = r * 0.95;
    for (let i = 0; i < 5; i++) {
      const a = i * ((Math.PI * 2) / 5) - Math.PI / 2 + Math.PI / 5;
      const cx = Math.cos(a) * distancia;
      const cy = Math.sin(a) * distancia;
      trazarPentagono(cx, cy, radioExterno, a + Math.PI);
      contexto.fill();
    }

    // Costuras: líneas desde los vértices del pentágono central hacia el borde.
    contexto.strokeStyle = "rgba(30, 30, 30, 0.5)";
    contexto.lineWidth = Math.max(1, r * 0.06);
    contexto.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const a = i * ((Math.PI * 2) / 5) - Math.PI / 2;
      contexto.beginPath();
      contexto.moveTo(Math.cos(a) * radioCentral, Math.sin(a) * radioCentral);
      contexto.lineTo(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98);
      contexto.stroke();
    }
  }

  /**
   * Dibuja un balón de fútbol realista con brillo neón: base con sombreado 3D,
   * paneles que GIRAN con el balón, y resplandor cian según el puntaje.
   */
  function dibujarBalon() {
    const r = RADIO_BALON;
    contexto.save();
    contexto.shadowBlur = Math.min(10 + puntaje, 25);
    contexto.shadowColor = "#00f0ff";
    contexto.translate(balon.x, balon.y);

    // Recorte circular: todo lo de abajo se queda dentro del balón.
    contexto.beginPath();
    contexto.arc(0, 0, r, 0, Math.PI * 2);
    contexto.clip();

    // Base blanca con sombreado para que se vea esférico, no plano.
    const base = contexto.createRadialGradient(
      -r * 0.35,
      -r * 0.4,
      r * 0.15,
      0,
      0,
      r * 1.2
    );
    base.addColorStop(0, "#ffffff");
    base.addColorStop(0.7, "#ededed");
    base.addColorStop(1, "#b4b4b4");
    contexto.fillStyle = base;
    contexto.fillRect(-r, -r, r * 2, r * 2);

    // Paneles que giran con el balón.
    contexto.save();
    contexto.rotate(balon.angulo);
    dibujarPanelesBalon(r);
    contexto.restore();

    // Brillo especular (la fuente de luz es fija arriba-izquierda, NO gira).
    const brillo = contexto.createRadialGradient(
      -r * 0.4,
      -r * 0.45,
      0,
      -r * 0.4,
      -r * 0.45,
      r * 0.95
    );
    brillo.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    brillo.addColorStop(0.45, "rgba(255, 255, 255, 0)");
    contexto.fillStyle = brillo;
    contexto.fillRect(-r, -r, r * 2, r * 2);

    contexto.restore();

    // Contorno (fuera del clip para que se vea nítido y completo).
    contexto.save();
    contexto.beginPath();
    contexto.arc(balon.x, balon.y, r, 0, Math.PI * 2);
    contexto.lineWidth = 1.5;
    contexto.strokeStyle = "rgba(0, 0, 0, 0.4)";
    contexto.stroke();
    contexto.restore();
  }

  /**
   * Dibuja al jugador. Si tiene una foto real definida (`jugador.foto`) y ya
   * terminó de cargar, usa la foto; si no, dibuja el muñeco vectorial de
   * siempre. Así un jugador puede tener foto real mientras los demás siguen
   * con el dibujo por código, sin que ninguno de los dos casos se rompa.
   */
  function dibujarAvatar() {
    const baseX = balon.x;
    // El avatar se apoya de los pies hacia ARRIBA (cabeza/cuerpo quedan por
    // encima de "baseY"). Para que la SILUETA completa quede centrada en el
    // césped —y no solo los pies, que la dejaría viendo hacia la mitad
    // superior— se le suma la mitad de su alto total de diseño (64+10
    // unidades, ver dibujarAvatarVectorial).
    const inicioCesped = obtenerSuelo();
    const centroCesped = inicioCesped + (lienzo.height - inicioCesped) / 2;
    const mitadAltoAvatar = ((64 + 10) * ESCALA_AVATAR) / 2;
    const baseY = centroCesped + mitadAltoAvatar;
    const inclina = (animacionToque > 0 ? -6 : 0) * ESCALA_AVATAR;
    if (animacionToque > 0) animacionToque--;

    const foto = obtenerFotoJugador(jugador);
    const fotoLista = foto && foto.complete && foto.naturalWidth > 0;
    if (fotoLista) {
      dibujarAvatarConFoto(foto, baseX, baseY, inclina);
    } else {
      dibujarAvatarVectorial(baseX, baseY, inclina);
    }
  }

  /**
   * Dibuja la foto real del jugador, del mismo alto aproximado que el muñeco
   * vectorial (para que no se vea ni gigante ni diminuto al cambiar de
   * avatar) y con los pies alineados en `baseY`, igual que la versión
   * vectorial.
   * @param {HTMLImageElement} foto
   * @param {number} baseX
   * @param {number} baseY
   * @param {number} inclina - pequeño desfase horizontal al patear.
   */
  function dibujarAvatarConFoto(foto, baseX, baseY, inclina) {
    const alto = 95 * ESCALA_AVATAR;
    const ancho = alto * (foto.naturalWidth / foto.naturalHeight);
    contexto.save();
    contexto.drawImage(
      foto,
      baseX - ancho / 2 + inclina * 0.4,
      baseY - alto,
      ancho,
      alto
    );
    contexto.restore();
  }

  /** El muñeco dibujado por código (piernas, camiseta y cabeza de color). */
  function dibujarAvatarVectorial(baseX, baseY, inclina) {
    contexto.save();
    contexto.strokeStyle = "#1a1a1a";
    contexto.lineWidth = 6 * ESCALA_AVATAR;
    contexto.beginPath();
    contexto.moveTo(baseX, baseY - 30 * ESCALA_AVATAR);
    contexto.lineTo(baseX - 8 * ESCALA_AVATAR, baseY);
    contexto.moveTo(baseX, baseY - 30 * ESCALA_AVATAR);
    contexto.lineTo(baseX + 8 * ESCALA_AVATAR + inclina, baseY + inclina);
    contexto.stroke();
    contexto.fillStyle = jugador.colorPrimario;
    contexto.fillRect(
      baseX - 12 * ESCALA_AVATAR,
      baseY - 55 * ESCALA_AVATAR,
      24 * ESCALA_AVATAR,
      28 * ESCALA_AVATAR
    );
    contexto.beginPath();
    contexto.arc(baseX, baseY - 64 * ESCALA_AVATAR, 10 * ESCALA_AVATAR, 0, Math.PI * 2);
    contexto.fillStyle = jugador.colorPiel;
    contexto.fill();
    contexto.restore();
  }

  /** Si la partida murió, oscurece el campo y muestra el motivo. */
  function dibujarFueraDeJuego() {
    const esFalla = motivoDerrota === "falla";
    contexto.save();
    contexto.fillStyle = esFalla ? "rgba(130, 10, 10, 0.55)" : "rgba(15, 23, 42, 0.65)";
    contexto.fillRect(0, 0, lienzo.width, lienzo.height);
    contexto.fillStyle = "#ffffff";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.font = "bold 28px 'Segoe UI', Arial";
    contexto.shadowBlur = 10;
    contexto.shadowColor = esFalla ? "#ff007f" : "#00f0ff";
    contexto.fillText(
      esFalla ? "¡FALTA! ❌" : "¡FUERA! 😵",
      lienzo.width / 2,
      lienzo.height / 2
    );
    contexto.restore();
  }

  /** Pinta una escena completa. */
  function dibujar() {
    dibujarCielo();
    dibujarGradas();
    dibujarCesped();
    dibujarContador();
    dibujarSombraBalon();
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
    get puntaje() {
      return puntaje;
    },
    get viva() {
      return viva;
    },
    get motivoDerrota() {
      return motivoDerrota;
    },
  };
}

/**
 * Convierte las coordenadas de un evento (ratón o tacto) a coordenadas internas
 * del canvas indicado. Función compartida por ambos modos.
 * @param {HTMLCanvasElement} lienzo
 * @param {MouseEvent|Touch} evento
 * @returns {{x:number, y:number}}
 */
function coordenadasEnLienzo(lienzo, evento) {
  const rect = lienzo.getBoundingClientRect();
  return {
    x: (evento.clientX - rect.left) * (lienzo.width / rect.width),
    y: (evento.clientY - rect.top) * (lienzo.height / rect.height),
  };
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
    if (typeof buscar === "function") return buscar(selector);
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
    partida.dibujar();

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
    const esRecord = guardarRecordSiEsMayor(partida.puntaje);
    if (esRecord && partida.puntaje > 0) Sonidos.record();
    else if (partida.motivoDerrota === "falla") Sonidos.fallo();
    else Sonidos.gameOver();
    alTerminarCallback(partida.puntaje, esRecord, partida.motivoDerrota);
  }

  /**
   * Arranca una partida de 1 jugador.
   * @param {Object} jugador
   * @param {Object} dificultad
   * @param {Function} alTerminar - callback(puntaje, esRecord, motivo).
   */
  function iniciar(jugador, dificultad, alTerminar) {
    lienzo = buscarElemento("#lienzo-juego");
    if (!lienzo) return;

    alTerminarCallback = alTerminar;
    partida = crearPartida(lienzo, jugador, dificultad, { alAnotar: Sazon.alAnotar });
    partida.configurar();
    activarControles();

    const mJugador = buscarElemento("#marcador-jugador");
    if (mJugador) mJugador.textContent = jugador.bandera || "";

    const mRecord = buscarElemento("#marcador-record");
    if (mRecord) mRecord.textContent = leerRecord();

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
