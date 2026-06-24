/ --- NUEVAS VARIABLES DE ESTADO Y TEXTOS ---
const ELOGIOS_COSTENOS = ["¡Monstruo!", "¡Erda, perfecto!", "¡Lindooooooo!", "¡Puro crack!"];
const MENSAJES_AZARE = ["¡Uy, cuidado!", "¡Anda, casi la embarras!", "¡Ponte las pilas!"];

// Inyectar contenedor flotante en el HTML dinámicamente si no existe
function mostrarTextoFlotante(texto, esAlertaNegativa = false) {
    // Intentar buscar un contenedor de texto flotante existente o crearlo
    let contenedorText = document.getElementById("texto-retro-flotante");
    if (!contenedorText) {
        contenedorText = document.createElement("div");
        contenedorText.id = "texto-retro-flotante";
        // Estilos rápidos directo al DOM para mantener el look arcade
        contenedorText.style.position = "absolute";
        contenedorText.style.top = "40%";
        contenedorText.style.width = "100%";
        contenedorText.style.textAlign = "center";
        contenedorText.style.fontFamily = "'Press Start 2P', monospace";
        contenedorText.style.fontSize = "1.5rem";
        contenedorText.style.zIndex = "100";
        contenedorText.style.textShadow = "4px 4px #000";
        document.getElementById("arcade-container").appendChild(contenedorText);
    }
    
    contenedorText.innerText = texto;
    contenedorText.style.color = esAlertaNegativa ? "#ff4757" : "#f1c40f";
    contenedorText.classList.remove("hidden");

    // Desvanecer el texto después de 1.2 segundos
    setTimeout(() => {
        contenedorText.classList.add("hidden");
    }, 1200);
}

// --- MODIFICACIÓN DE LA REGLA DE NEGOCIO: VALIDACIÓN CON AZARE Y HITOS ---
function verificarToquePerfecto() {
    if (ballTop >= LIMITE_SUPERIOR_ZONA && ballTop <= LIMITE_INFERIOR_ZONA) {
        
        // 1. DETECTAR SI EL TOQUE FUE "RASPANDO" (Para azarar al jugador)
        // Si el balón se impactó en los extremos de la zona (Margen de 4px)
        if (ballTop <= LIMITE_SUPERIOR_ZONA + 4 || ballTop >= LIMITE_INFERIOR_ZONA - 4) {
            let azarRes = MENSAJES_AZARE[Math.floor(Math.random() * MENSAJES_AZARE.length)];
            mostrarTextoFlotante(azarRes, true); // Alerta roja de susto
        }
