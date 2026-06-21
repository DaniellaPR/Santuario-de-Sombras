/* ARQUITECTURA (patrón: Datos → Pantalla → Eventos)
   QUÉ existe (datos),
   QUÉ hace cada cosa (funciones)
   cuándo se activa (eventos al final).

   SECCIONES:
   1. DATOS — todo lo que puede cambiar está aquí arriba
   2. ESTADO — qué está pasando en este momento
   3. AUDIO  — funciones de sonido
   4. PORTADA — abrir libro, activar sonido
   5. GRIMORIO — seleccionar reliquias, cambiar ambiente
   6. MINIJUEGOS — uno por bestia (brujula, vela, alas, muneco)
   7. PROGRESO — guardar letras, verificar si se completó todo
   8. ZONA FINAL — cofre y carta final
   9. DECORACIÓN — brillos, niebla
   10. INICIO — conectar eventos con funciones (al final del todo)
================================================================ */


/* 1. DATOS info de las bestias */

// Cada bestia tiene: título, historia, imagen, fondo, música y letra
const BESTIAS = {
  brujula: {
    titulo:  "La Sombra Marina",
    texto:   "Nació entre brújulas rotas y mareas sin regreso. La arrastró el santuario cuando su rumbo fue quebrado, y ahora espera que alguien le devuelva una dirección verdadera.",
    imagen:  "assets/img/pirata-bestia.png",
    fondo:   "fondo-brujula",
    musica:  "assets/audio/medieval-waltz.mp3",
    letra:   "L"
  },
  vela: {
    titulo:  "El Esqueleto de la Vela Negra",
    texto:   "Guardó una llama para no desaparecer. Lleva siglos ardiendo en un rincón del libro, con huesos de ceniza y una paciencia que da miedo y ternura a la vez.",
    imagen:  "assets/img/esqueleto-bestia.png",
    fondo:   "fondo-vela",
    musica:  "assets/audio/horror-atmosphere.mp3",
    letra:   "U"
  },
  alas: {
    titulo:  "El Cuervo del Umbral",
    texto:   "Fue atado con cadenas invisibles por cruzar puertas que no debía. Sus alas todavía recuerdan el cielo, pero necesita que alguien rompa su prisión.",
    imagen:  "assets/img/cuervo-bestiaa.png",
    fondo:   "fondo-alas",
    musica:  "assets/audio/magico.mp3",
    letra:   "N"
  },
  muneco: {
    titulo:  "La Muñeca del Hilo Silente",
    texto:   "Cosida con recuerdos ajenos y un corazón quieto, llegó al santuario buscando una llave que le devolviera su nombre. Es hermosa, triste y peligrosa si se la deja sola demasiado tiempo.",
    imagen:  "assets/img/serpiente-bestiaa.png",
    fondo:   "fondo-muneco",
    musica:  "assets/audio/mvnocopyrightmusic-game-of-shadows-414905.mp3",
    letra:   "A"
  }
};

// El orden en que aparecen las letras en el panel (mismo orden que el HTML)
const ORDEN_LETRAS = ["brujula", "vela", "alas", "muneco"];

// La palabra secreta (en mayúsculas para comparar)
const PALABRA_SECRETA = "LUNA";


/* 2. ESTADO Variables que cambian mientras la persona juega */

let estado = {
  audioActivo:     false,   // si la persona activó el sonido
  bestiaActual:    null,    // cuál bestia está abierta ahora
  botonActual:     null,    // el botón de reliquia que se tocó
  completadas:     {        // cuáles bestias ya se resolvieron
    brujula: false,
    vela:    false,
    alas:    false,
    muneco:  false
  }
};


/* 3. AUDIO */

// Crear los objetos de audio una sola vez
const AUDIO = {
  portada:   crearAudio("assets/audio/medieval.mp3",           0.05, true),
  ambiente:  crearAudio("",                                    0.07, true),  // cambia según bestia
  abrir:     crearAudio("assets/audio/book-opening-myinstants.mp3", 0.18),
  hover:     crearAudio("assets/audio/magic-wand-ping.mp3",    0.08),
  revelar:   crearAudio("assets/audio/magic-reveal2-sound-effect.mp3", 0.16),
  resolver:  crearAudio("assets/audio/magic-wand-ping.mp3",    0.20),
  // BUG CORREGIDO: la ruta original no tenía "assets/audio/"
  premio:    crearAudio("assets/audio/book-opening-myinstants.mp3", 0.20),
  error:     crearAudio("assets/audio/detect-magic.mp3",       0.15),
  detectar:  crearAudio("assets/audio/detect-magic.mp3",       0.12)
};

// Crea y configura un objeto Audio
function crearAudio(ruta, volumen, repetir = false) {
  const audio = new Audio(ruta);
  audio.volume = volumen;
  audio.loop   = repetir;
  return audio;
}

// Reproduce un audio desde el principio (si el sonido está activo)
function reproducir(audio) {
  if (!estado.audioActivo) return;
  audio.currentTime = 0;
  audio.play().catch(() => {}); // .catch evita error en consola si el navegador bloquea
}

// Para todos los audios que están sonando
function detenerTodo() {
  Object.values(AUDIO).forEach(function(audio) {
    audio.pause();
    audio.currentTime = 0;
  });
}

// Cambia la música de ambiente según la bestia
function cambiarMusica(rutaMusica) {
  AUDIO.ambiente.pause();
  AUDIO.ambiente.src        = rutaMusica;
  AUDIO.ambiente.currentTime = 0;
  reproducir(AUDIO.ambiente);
}


/* 4. PORTADA */

// Activa el sonido (el navegador requiere que sea por acción del usuario)
function activarSonido() {
  estado.audioActivo = true;

  const btn = document.getElementById("btn-activar-sonido");
  btn.textContent = "🔊 Sonido activado";
  btn.disabled    = true;

  AUDIO.portada.currentTime = 0;
  AUDIO.portada.play().catch(() => {});
}

// Abre el grimorio: oculta la portada y muestra la sección principal
function abrirGrimorio() {
  document.getElementById("pantalla-portada").classList.add("oculto");
  document.getElementById("pantalla-grimorio").classList.remove("oculto");

  document.body.classList.remove("fondo-portada");
  document.body.classList.add("fondo-portada"); // refuerza el fondo

  reproducir(AUDIO.abrir);
  AUDIO.portada.pause(); // detiene la música de portada
}


/* 5. GRIMORIO — selección de reliquias y ambiente */

// Se llama cuando la persona toca una reliquia
function abrirReliquia(nombreBestia, botonReliquia) {
  const bestia = BESTIAS[nombreBestia];

  // Guarda cuál está abierta (para el sistema de progreso)
  estado.bestiaActual = nombreBestia;
  estado.botonActual  = botonReliquia;

  // Cambia el fondo según la bestia
  cambiarFondo(bestia.fondo);

  // Rellena el panel con los datos de esta bestia
  document.getElementById("imagen-bestia").src     = bestia.imagen;
  document.getElementById("titulo-bestia").textContent = bestia.titulo;
  document.getElementById("texto-bestia").textContent  = bestia.texto;
  document.getElementById("mensaje-juego").textContent  = "";
  document.getElementById("mensaje-juego").className    = "mensaje-juego";

  // Muestra el panel
  document.getElementById("panel-bestia").classList.remove("oculto");

  // Sonidos
  detenerTodo();
  reproducir(AUDIO.revelar);
  cambiarMusica(bestia.musica);

  // Construye el minijuego de esta bestia
  construirMinijuego(nombreBestia);

  // Hace scroll suave hasta el panel
  setTimeout(function() {
    document.getElementById("panel-bestia").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}

// Cambia el fondo del body (quita el anterior, pone el nuevo)
function cambiarFondo(claseFondo) {
  // Quita todas las clases de fondo
  ["fondo-portada", "fondo-brujula", "fondo-vela", "fondo-alas", "fondo-muneco"].forEach(function(clase) {
    document.body.classList.remove(clase);
  });
  // Agrega la nueva
  document.body.classList.add(claseFondo);
}


/* 6. MINIJUEGOS
     construir[Juego]()  → crea el HTML del juego
     resolver[Juego]()   → verifica si ganó y llama a completarBestia() */

// Decide qué juego construir según la bestia
function construirMinijuego(nombreBestia) {
  // Si ya está resuelta, no recrea el juego
  if (estado.completadas[nombreBestia]) {
    document.getElementById("zona-juego").innerHTML =
      `<p style="color: var(--color-exito); margin-top:14px;">✓ Ya liberaste a esta bestia.</p>`;
    return;
  }

  // Llama a la función constructora correcta
  if (nombreBestia === "brujula") construirJuegoCirculos();
  if (nombreBestia === "vela")    construirJuegoSwipe();
  if (nombreBestia === "alas")    construirJuegoMultitap();
  if (nombreBestia === "muneco")  construirJuegoSimon();
}


/* JUEGO 1: Círculos que desaparecen — BRÚJULA (La Sombra Marina)
   La persona debe tocar círculos antes de que se encojan.
   5 aciertos seguidos para ganar */
function construirJuegoCirculos() {
  const zona = document.getElementById("zona-juego");

  zona.innerHTML = `
    <div class="zona-juego-interior">
      <p class="instruccion">🎯 Toca los círculos antes de que desaparezcan.<br>Necesitas 5 aciertos seguidos.</p>
      <div class="arena-circulos" id="arena-circulos"></div>
      <p class="contador-racha">Racha: <span id="racha-actual">0</span> / 5</p>
    </div>
  `;

  // Variables internas del juego de círculos
  let racha         = 0;
  let totalNecesario = 5;
  let circuloActivo = null;
  let timerCirculo  = null;

  // Crea y muestra un nuevo círculo en posición aleatoria
  function mostrarCirculo() {
    const arena = document.getElementById("arena-circulos");
    if (!arena) return;

    // Elimina el círculo anterior si existe
    if (circuloActivo) circuloActivo.remove();

    const circulo = document.createElement("div");
    circulo.className = "circulo-objetivo";

    // Tamaño entre 55px y 85px (más pequeño si la racha es alta)
    const tamaño = Math.max(50, 85 - racha * 5);

    // Posición aleatoria dentro del área (con margen para no salir)
    const margen = tamaño / 2 + 5;
    const areaAncho = arena.offsetWidth  || 280;
    const areaAlto  = arena.offsetHeight || 240;
    const x = margen + Math.random() * (areaAncho - margen * 2);
    const y = margen + Math.random() * (areaAlto  - margen * 2);

    // Velocidad: empieza en 2.2s y baja 0.15s por cada acierto (mínimo 0.9s)
    const velocidad = Math.max(0.9, 2.2 - racha * 0.15);

    circulo.style.cssText = `
      width:  ${tamaño}px;
      height: ${tamaño}px;
      left:   ${x}px;
      top:    ${y}px;
      --duracion-circulo: ${velocidad}s;
    `;

    circuloActivo = circulo;
    arena.appendChild(circulo);

    // Cuando termina la animación (el círculo desapareció sin tocar) = fallo
    circulo.addEventListener("animationend", function() {
      if (!circulo.dataset.tocado) {
        racha = 0;
        document.getElementById("racha-actual").textContent = racha;
        mostrarMensaje("Se escapó... vuelve a intentarlo.", "error");
        reproducir(AUDIO.error);
        mostrarCirculo();
      }
    });

    // Cuando la persona toca el círculo = acierto
    function alTocar(evento) {
      evento.preventDefault(); // evita doble evento en táctil
      circulo.dataset.tocado = "si";
      circulo.style.animation = "none";
      circulo.style.opacity   = "0";

      racha++;
      document.getElementById("racha-actual").textContent = racha;
      reproducir(AUDIO.detectar);

      if (racha >= totalNecesario) {
        // ¡Ganó!
        mostrarMensaje("¡El rumbo ha sido encontrado!", "exito");
        completarBestia("brujula");
      } else {
        mostrarMensaje("¡Bien! Sigue.", "exito");
        setTimeout(mostrarCirculo, 400);
      }
    }

    circulo.addEventListener("click",      alTocar);
    circulo.addEventListener("touchstart", alTocar, { passive: false });
  }

  // Empieza mostrando el primer círculo
  mostrarCirculo();
}


/* -JUEGO 2: Swipe de secuencia — VELA (El Esqueleto de la Vela Negra)
   El juego muestra una secuencia de flechas → la persona la repite.
   3 rondas: 3 flechas → 4 → 5 */
function construirJuegoSwipe() {
  const zona = document.getElementById("zona-juego");

  // Los 4 símbolos posibles
  const FLECHAS = ["↑", "↓", "←", "→"];
  const CLAVES  = ["arriba", "abajo", "izq", "der"];

  let secuenciaActual = [];  // la secuencia que hay que repetir
  let indiceJugador   = 0;   // hasta dónde lleva la persona
  let rondaActual     = 1;
  let totalRondas     = 3;
  let juegoActivo     = false; // falso mientras se muestra la secuencia

  zona.innerHTML = `
    <div class="zona-juego-interior">
      <p class="instruccion">
        🕯️ Memoriza el camino de las llamas y repite la secuencia.<br>
        Ronda <span id="ronda-actual">1</span> de ${totalRondas}
      </p>
      <div class="pantalla-flechas" id="pantalla-flechas"></div>
      <div class="botones-direccion" id="botones-dir">
        <button class="btn-dir arriba" data-clave="arriba">↑</button>
        <button class="btn-dir izq"   data-clave="izq">←</button>
        <button class="btn-dir der"   data-clave="der">→</button>
        <button class="btn-dir abajo" data-clave="abajo">↓</button>
      </div>
      <p id="msg-swipe" style="font-size:13px; color: var(--color-texto-suave); margin-top:8px;"></p>
    </div>
  `;

  // Conecta los botones de dirección
  document.querySelectorAll(".btn-dir").forEach(function(btn) {
    btn.addEventListener("click",      function() { alPresionarDireccion(btn.dataset.clave); });
    btn.addEventListener("touchstart", function(e) { e.preventDefault(); alPresionarDireccion(btn.dataset.clave); }, { passive: false });
  });

  // También detecta swipe real en la zona de juego (para quien quiera deslizar)
  // (implementado con los botones para mayor claridad en móvil)

  // Inicia una ronda nueva
  function iniciarRonda() {
    juegoActivo = false;
    indiceJugador = 0;
    secuenciaActual = [];
    document.getElementById("ronda-actual").textContent = rondaActual;

    // La secuencia tiene 2+ronda elementos: ronda 1→3, ronda 2→4, ronda 3→5
    const cantidadFlechas = 2 + rondaActual;
    for (let i = 0; i < cantidadFlechas; i++) {
      secuenciaActual.push(Math.floor(Math.random() * 4)); // índice 0-3
    }

    // Construye los indicadores de flechas (vacíos al inicio)
    const panel = document.getElementById("pantalla-flechas");
    panel.innerHTML = "";
    secuenciaActual.forEach(function(_, i) {
      const span = document.createElement("span");
      span.className = "flecha-secuencia";
      span.id        = "flecha-" + i;
      span.textContent = FLECHAS[secuenciaActual[i]];
      panel.appendChild(span);
    });

    document.getElementById("msg-swipe").textContent = "Observa...";

    // Muestra la secuencia una a una
    mostrarSecuencia(0);
  }

  function mostrarSecuencia(indice) {
    if (indice >= secuenciaActual.length) {
      // Terminó de mostrar: ahora la persona juega
      setTimeout(function() {
        // Oculta las flechas para que la persona lo haga de memoria
        document.querySelectorAll(".flecha-secuencia").forEach(function(f) {
          f.classList.remove("visible", "activa");
        });
        document.getElementById("msg-swipe").textContent = "¡Tu turno!";
        juegoActivo = true;
      }, 500);
      return;
    }

    // Muestra la flecha actual iluminada
    const flechaEl = document.getElementById("flecha-" + indice);
    if (flechaEl) {
      flechaEl.classList.add("visible", "activa");
      reproducir(AUDIO.detectar);
    }

    setTimeout(function() {
      if (flechaEl) flechaEl.classList.remove("activa");
      setTimeout(function() {
        mostrarSecuencia(indice + 1);
      }, 200);
    }, 600);
  }

  function alPresionarDireccion(clavePresionada) {
    if (!juegoActivo) return;

    const claveEsperada = CLAVES[secuenciaActual[indiceJugador]];

    if (clavePresionada === claveEsperada) {
      // Acierto: ilumina esa flecha
      const flechaEl = document.getElementById("flecha-" + indiceJugador);
      if (flechaEl) flechaEl.classList.add("visible", "activa");
      reproducir(AUDIO.detectar);
      indiceJugador++;

      if (indiceJugador >= secuenciaActual.length) {
        // Completó la secuencia de esta ronda
        juegoActivo = false;
        reproducir(AUDIO.resolver);

        if (rondaActual >= totalRondas) {
          // ¡Ganó todas las rondas!
          mostrarMensaje("¡Las llamas conocen tu camino!", "exito");
          completarBestia("vela");
        } else {
          mostrarMensaje("¡Correcto! Siguiente ronda...", "exito");
          rondaActual++;
          setTimeout(iniciarRonda, 1200);
        }
      }

    } else {
      // Fallo: reinicia la ronda
      juegoActivo = false;
      reproducir(AUDIO.error);
      mostrarMensaje("La llama vaciló... repite el camino.", "error");
      setTimeout(function() {
        mostrarMensaje("", "");
        iniciarRonda();
      }, 1400);
    }
  }

  // Empieza
  iniciarRonda();
}


/* JUEGO 3: Multi-tap con fases — ALAS (El Cuervo del Umbral)
   La persona golpea el botón rápidamente para romper las cadenas.
   Hay 3 fases visuales. Tiempo límite de 20 segundos*/
function construirJuegoMultitap() {
  const zona = document.getElementById("zona-juego");

  const TOTAL_GOLPES = 40;  // cuántos taps hacen falta para liberar
  const TIEMPO_LIMITE = 20; // segundos que tiene la persona

  // Textos de las 3 fases (según el porcentaje de progreso)
  const FASES = [
    { limite: 0.33, texto: "Las cadenas se tensan... ¡golpea!" },
    { limite: 0.66, texto: "¡Se agrietan! ¡Más fuerte!" },
    { limite: 1.00, texto: "¡CASI! ¡No pares!" }
  ];

  let golpes      = 0;
  let timerJuego  = null;
  let tiempoRestante = TIEMPO_LIMITE;

  zona.innerHTML = `
    <div class="zona-juego-interior">
      <p class="instruccion">⛓️ ¡Rompe las cadenas del cuervo! Golpea rápido.<br>
        Tiempo: <span id="timer-golpes">${TIEMPO_LIMITE}</span>s
      </p>
      <div class="contenedor-multitap">
        <div class="barra-progreso-exterior">
          <div class="barra-progreso-interior" id="barra-progreso"></div>
        </div>
        <p class="texto-fase" id="texto-fase">Las cadenas se resisten...</p>
        <button class="btn-golpear" id="btn-golpear" aria-label="Golpear cadena">⛓️</button>
      </div>
    </div>
  `;

  // Inicia la cuenta regresiva
  timerJuego = setInterval(function() {
    tiempoRestante--;
    const timerEl = document.getElementById("timer-golpes");
    if (timerEl) timerEl.textContent = tiempoRestante;

    if (tiempoRestante <= 0) {
      clearInterval(timerJuego);
      mostrarMensaje("Las cadenas resistieron... inténtalo otra vez.", "error");
      reproducir(AUDIO.error);
      // Reconstruye el juego después de un momento
      setTimeout(function() {
        mostrarMensaje("", "");
        construirJuegoMultitap();
      }, 1600);
    }
  }, 1000);

  // Al tocar el botón de golpear
  function alGolpear(evento) {
    evento.preventDefault();
    golpes++;

    const porcentaje = golpes / TOTAL_GOLPES;
    const barra = document.getElementById("barra-progreso");
    const textoFase = document.getElementById("texto-fase");
    const btnGolpear = document.getElementById("btn-golpear");

    if (!barra) return;

    // Actualiza la barra de progreso
    barra.style.width = Math.min(porcentaje * 100, 100) + "%";

    // Cambia el emoji del botón según la fase
    if (porcentaje < 0.33) {
      if (btnGolpear) btnGolpear.textContent = "⛓️";
      if (textoFase)  textoFase.textContent  = FASES[0].texto;
    } else if (porcentaje < 0.66) {
      if (btnGolpear) btnGolpear.textContent = "💥";
      if (textoFase)  textoFase.textContent  = FASES[1].texto;
    } else {
      if (btnGolpear) btnGolpear.textContent = "🔥";
      if (textoFase)  textoFase.textContent  = FASES[2].texto;
    }

    reproducir(AUDIO.detectar);

    if (golpes >= TOTAL_GOLPES) {
      clearInterval(timerJuego);
      if (btnGolpear) btnGolpear.disabled = true;
      mostrarMensaje("¡El cuervo es libre! Sus alas se abren.", "exito");
      completarBestia("alas");
    }
  }

  const btn = document.getElementById("btn-golpear");
  if (btn) {
    btn.addEventListener("click",      alGolpear);
    btn.addEventListener("touchstart", alGolpear, { passive: false });
  }
}


/* JUEGO 4: Simon Says / cristales — MUÑECO (La Muñeca del Hilo Silente)
   El juego muestra una secuencia de cristales → la persona la repite.
   Hay que llegar a 6 rondas correctas */
function construirJuegoSimon() {
  const zona = document.getElementById("zona-juego");

  // Cada cristal tiene un emoji/símbolo para reconocerlo
  const CRISTALES_INFO = [
    { emoji: "🔮", nombre: "violeta" },
    { emoji: "🌹", nombre: "rojo"    },
    { emoji: "💎", nombre: "azul"    },
    { emoji: "🌿", nombre: "verde"   }
  ];

  const RONDAS_PARA_GANAR = 6;

  let secuencia       = [];    // la secuencia completa (crece cada ronda)
  let indiceJugador   = 0;
  let rondaActual     = 1;
  let juegoActivo     = false; // falso mientras el juego muestra la secuencia

  zona.innerHTML = `
    <div class="zona-juego-interior">
      <p class="instruccion">💎 Repite la secuencia de cristales.<br>
        Ronda <span id="ronda-simon">${rondaActual}</span> de ${RONDAS_PARA_GANAR}
      </p>
      <div class="contenedor-simon">
        <div class="grilla-cristales" id="grilla-cristales">
          <div class="cristal" data-id="0" role="button" aria-label="${CRISTALES_INFO[0].nombre}">${CRISTALES_INFO[0].emoji}</div>
          <div class="cristal" data-id="1" role="button" aria-label="${CRISTALES_INFO[1].nombre}">${CRISTALES_INFO[1].emoji}</div>
          <div class="cristal" data-id="2" role="button" aria-label="${CRISTALES_INFO[2].nombre}">${CRISTALES_INFO[2].emoji}</div>
          <div class="cristal" data-id="3" role="button" aria-label="${CRISTALES_INFO[3].nombre}">${CRISTALES_INFO[3].emoji}</div>
        </div>
        <p class="texto-ronda-simon" id="estado-simon">Observa la secuencia...</p>
      </div>
    </div>
  `;

  // Conecta los 4 cristales a la función de toque
  document.querySelectorAll(".cristal").forEach(function(cristal) {
    cristal.addEventListener("click",      function() { alTocarCristal(parseInt(cristal.dataset.id)); });
    cristal.addEventListener("touchstart", function(e) {
      e.preventDefault();
      alTocarCristal(parseInt(cristal.dataset.id));
    }, { passive: false });
  });

  // Ilumina un cristal por un momento
  function iluminarCristal(idCristal, duracionMs = 500) {
    return new Promise(function(resolve) {
      const el = document.querySelector(`.cristal[data-id="${idCristal}"]`);
      if (el) {
        el.classList.add("iluminado");
        reproducir(AUDIO.detectar);
        setTimeout(function() {
          el.classList.remove("iluminado");
          setTimeout(resolve, 100); // pequeña pausa entre cristales
        }, duracionMs);
      } else {
        resolve();
      }
    });
  }

  // Muestra la secuencia completa (espera entre cristal y cristal)
  async function mostrarSecuencia() {
    juegoActivo = false;
    const estado = document.getElementById("estado-simon");
    if (estado) estado.textContent = "Observa...";

    // Pausa antes de empezar a mostrar
    await new Promise(function(r) { setTimeout(r, 600); });

    for (let i = 0; i < secuencia.length; i++) {
      await iluminarCristal(secuencia[i]);
    }

    // Ahora le toca a la persona
    if (estado) estado.textContent = "¡Tu turno!";
    juegoActivo   = true;
    indiceJugador = 0;
  }

  // Inicia una ronda: agrega un cristal aleatorio a la secuencia
  function iniciarRonda() {
    secuencia.push(Math.floor(Math.random() * 4));
    document.getElementById("ronda-simon").textContent = rondaActual;
    mostrarSecuencia();
  }

  // Cuando la persona toca un cristal
  function alTocarCristal(idTocado) {
    if (!juegoActivo) return;

    const idEsperado = secuencia[indiceJugador];

    if (idTocado === idEsperado) {
      // Acierto
      iluminarCristal(idTocado, 300);
      indiceJugador++;

      if (indiceJugador >= secuencia.length) {
        // Completó la ronda
        juegoActivo = false;
        reproducir(AUDIO.resolver);

        if (rondaActual >= RONDAS_PARA_GANAR) {
          // ¡Ganó!
          mostrarMensaje("¡Los cristales revelan el nombre verdadero!", "exito");
          completarBestia("muneco");
        } else {
          mostrarMensaje("¡Bien! Siguiente cristal...", "exito");
          rondaActual++;
          setTimeout(function() {
            mostrarMensaje("", "");
            iniciarRonda();
          }, 1000);
        }
      }
    } else {
      // Fallo: reinicia la ronda (no la secuencia, solo el turno)
      juegoActivo = false;
      reproducir(AUDIO.error);
      mostrarMensaje("Un cristal equivocado... la secuencia se repite.", "error");

      // Efecto visual de error en toda la grilla
      const grilla = document.getElementById("grilla-cristales");
      if (grilla) {
        grilla.style.animation = "flash-error 0.4s ease";
        setTimeout(function() { grilla.style.animation = ""; }, 400);
      }

      setTimeout(function() {
        mostrarMensaje("", "");
        mostrarSecuencia(); // vuelve a mostrar la misma secuencia
      }, 1400);
    }
  }

  // Empieza la primera ronda
  iniciarRonda();
}


/* 7. PROGRESO — guardar letras y verificar si se completó todo */

// Se llama cuando el jugador gana el minijuego de una bestia
function completarBestia(nombreBestia) {
  // Si ya estaba completada, no hace nada (evita duplicados)
  if (estado.completadas[nombreBestia]) return;

  estado.completadas[nombreBestia] = true;

  // Pone la letra en el panel (el índice corresponde al orden del HTML)
  const indice = ORDEN_LETRAS.indexOf(nombreBestia) + 1;
  const cajaLetra = document.getElementById("letra-" + indice);
  if (cajaLetra) {
    cajaLetra.textContent = BESTIAS[nombreBestia].letra;
    cajaLetra.classList.add("activa");
  }

  // Marca el botón de reliquia como resuelto
  if (estado.botonActual) {
    estado.botonActual.classList.add("reliquia-resuelta");
  }

  // Actualiza el texto de estado
  const totalResueltas = ORDEN_LETRAS.filter(function(nombre) {
    return estado.completadas[nombre];
  }).length;

  const textoEstado = document.getElementById("texto-estado");
  if (textoEstado) {
    textoEstado.textContent = "Reliquias liberadas: " + totalResueltas + " de 4";
  }

  // Sonidos de victoria
  reproducir(AUDIO.resolver);
  setTimeout(function() { reproducir(AUDIO.premio); }, 350);

  // Si completó las 4, muestra la zona final
  if (totalResueltas === 4) {
    setTimeout(mostrarZonaFinal, 1200);
  }
}

// Muestra el cofre y el input de palabra final
function mostrarZonaFinal() {
  const zonaFinal = document.getElementById("zona-final");
  zonaFinal.classList.remove("oculto");

  const textoEstado = document.getElementById("texto-estado");
  if (textoEstado) {
    textoEstado.textContent = "Las cuatro letras han despertado el cofre.";
  }

  zonaFinal.scrollIntoView({ behavior: "smooth", block: "start" });
}


/* 8. ZONA FINAL — verificar la palabra y mostrar la carta*/

// Verifica si la persona escribió la palabra correcta
function verificarPalabra() {
  const input    = document.getElementById("input-palabra");
  const palabra  = input.value.trim().toUpperCase();

  if (palabra === PALABRA_SECRETA) {
    // ¡Correcto!
    document.getElementById("carta-final").classList.remove("oculto");
    reproducir(AUDIO.premio);
    document.getElementById("carta-final").scrollIntoView({ behavior: "smooth" });
  } else {
    // Incorrecto: feedback visual en el input
    input.style.borderColor = "rgba(255, 100, 100, 0.6)";
    mostrarMensaje("Esa palabra no rompe el sello.", "error");
    reproducir(AUDIO.error);

    setTimeout(function() {
      input.style.borderColor = "";
      mostrarMensaje("", "");
    }, 1500);
  }
}


/* =9. DECORACIÓN — partículas*/

// Crea pequeñas estrellas animadas repartidas por la pantalla
function crearBrillos() {
  const contenedor = document.getElementById("contenedor-brillos");
  if (!contenedor) return;

  const TOTAL_BRILLOS = 28;

  for (let i = 0; i < TOTAL_BRILLOS; i++) {
    const brillo = document.createElement("span");
    brillo.className   = "brillito";
    brillo.textContent = "✦";
    brillo.setAttribute("aria-hidden", "true");

    // Posición y duración aleatorias (usando porcentaje para no depender del tamaño de pantalla)
    brillo.style.left      = Math.random() * 98 + "%";
    brillo.style.top       = Math.random() * 98 + "%";
    brillo.style.fontSize  = (Math.random() * 8 + 6) + "px";
    brillo.style.setProperty("--duracion", (Math.random() * 3 + 2) + "s");
    brillo.style.animationDelay = (Math.random() * 3) + "s";

    contenedor.appendChild(brillo);
  }
}


/*  muestra mensajes de feedback en el juego*/
function mostrarMensaje(texto, tipo) {
  const el = document.getElementById("mensaje-juego");
  if (!el) return;
  el.textContent = texto;
  el.className   = "mensaje-juego" + (tipo ? " " + tipo : "");
}


/* 10. INICIO — eventos con funciones */

// Portada
document.getElementById("btn-activar-sonido").addEventListener("click", activarSonido);
document.getElementById("btn-abrir-grimorio").addEventListener("click", abrirGrimorio);

// eliquias del grimorio
document.getElementById("reliquia-brujula").addEventListener("click", function() {
  abrirReliquia("brujula", this);
});
document.getElementById("reliquia-vela").addEventListener("click", function() {
  abrirReliquia("vela", this);
});
document.getElementById("reliquia-alas").addEventListener("click", function() {
  abrirReliquia("alas", this);
});
document.getElementById("reliquia-muneco").addEventListener("click", function() {
  abrirReliquia("muneco", this);
});

// Cofre final
document.getElementById("btn-abrir-cofre").addEventListener("click", verificarPalabra);

// También permite presionar Enter en el input para abrir el cofre
document.getElementById("input-palabra").addEventListener("keydown", function(e) {
  if (e.key === "Enter") verificarPalabra();
});

// Fondo con brillitos
document.body.classList.add("fondo-portada");
crearBrillos();




