let body = document.body;
let portada = document.getElementById("portada");
let santuario = document.getElementById("santuario");

// para layer 1
let abrirLibro = document.getElementById("abrirLibro");
let activarAudio = document.getElementById("activarAudio");

// cada reliquia
let reliquiaBrujula = document.getElementById("reliquiaBrujula");
let reliquiaVela = document.getElementById("reliquiaVela");
let reliquiaAlas = document.getElementById("reliquiaAlas");
let reliquiaMuneco = document.getElementById("reliquiaMuneco");

// cada bestia con su minijuego
let panelBestia = document.getElementById("panelBestia");
let imagenBestia = document.getElementById("imagenBestia");
let tituloBestia = document.getElementById("tituloBestia");
let textoBestia = document.getElementById("textoBestia");
let zonaJuego = document.getElementById("zonaJuego");
let mensajeJuego = document.getElementById("mensajeJuego");
let textoEstado = document.getElementById("textoEstado");

// palabra final
let letra1 = document.getElementById("letra1");
let letra2 = document.getElementById("letra2");
let letra3 = document.getElementById("letra3");
let letra4 = document.getElementById("letra4");

// final
let zonaFinal = document.getElementById("zonaFinal");
let inputPalabra = document.getElementById("inputPalabra");
let abrirCofre = document.getElementById("abrirCofre");
let cartaFinal = document.getElementById("cartaFinal");
let brillos = document.getElementById("brillos");

// iniciar sin audio
let audioActivo = false;
// y audios
let musicaPortada = new Audio("assets/audio/medieval.mp3");
let musicaAmbiente = new Audio();
let sonidoAbrir = new Audio("assets/audio/book-opening-myinstants.mp3");
let sonidoHover = new Audio("assets/audio/magic-wand-ping.mp3");
let sonidoRevelar = new Audio("assets/audio/magic-reveal2-sound-effect.mp3");
let sonidoPremio = new Audio("assets/audio/detect-magic.mp3");
let sonidoResolver = new Audio("assets/audio/detect-magic.mp3");
let sonidoError = new Audio("assets/audio/ElevenLabs_susurro_binaural_femenino,_murmullo_débil,_voz_desencarnada,_etérea,_espíritu,_psicosis,_esquizofren.mp3");

// música:
musicaPortada.loop = true;
musicaAmbiente.loop = true;
musicaPortada.volume = 0.05;
musicaAmbiente.volume = 0.07;
sonidoAbrir.volume = 0.18;
sonidoHover.volume = 0.08;
sonidoRevelar.volume = 0.16;
sonidoPremio.volume = 0.20;
sonidoResolver.volume = 0.20;
sonidoError.volume = 0.18;

let progreso = {
  brujula: false,
  vela: false,
  alas: false,
  muneco: false
};

let letras = {
  brujula: "",
  vela: "",
  alas: "",
  muneco: ""
};

let reliquias = {
  brujula: {
    titulo: "La Sombra Marina",
    texto: "Nació entre brújulas rotas y mareas sin regreso. La arrastró el santuario cuando su rumbo fue quebrado, y ahora espera que alguien le devuelva una dirección verdadera.",
    imagen: "assets/img/pirata-bestia.png",
    clase: "ambiente-brujula",
    musica: "assets/audio/medieval-waltz.mp3",
    letra: "L"
  },
  vela: {
    titulo: "El Esqueleto de la Vela Negra",
    texto: "Guardó una llama para no desaparecer. Lleva siglos ardiendo en un rincón del libro, con huesos de ceniza y una paciencia que da miedo y ternura a la vez.",
    imagen: "assets/img/esqueleto-bestia.png",
    clase: "ambiente-vela",
    musica: "assets/audio/horror-atmosphere.mp3",
    letra: "U"
  },
  alas: {
    titulo: "El Cuervo del Umbral",
    texto: "Fue atado con cadenas invisibles por cruzar puertas que no debía. Sus alas todavía recuerdan el cielo, pero necesita que alguien rompa su prisión.",
    imagen: "assets/img/cuervo-bestia.jpg",
    clase: "ambiente-alas",
    musica: "assets/audio/magico.mp3",
    letra: "N"
  },
  muneco: {
    titulo: "La Muñeca del Hilo Silente",
    texto: "Cosida con recuerdos ajenos y un corazón quieto, llegó al santuario buscando una llave que le devolviera su nombre. Es hermosa, triste y peligrosa si se la deja sola demasiado tiempo.",
    imagen: "assets/img/serpiente-bestiaa.png",
    clase: "ambiente-muneco",
    musica: "assets/audio/mvnocopyrightmusic-game-of-shadows-414905.mp3",
    letra: "A"
  }
};

crearBrillos();

activarAudio.addEventListener("click", function() {
  audioActivo = true;
  activarAudio.textContent = "Sonido activado";

  musicaPortada.currentTime = 0;
  musicaPortada.play();
});

abrirLibro.addEventListener("click", function() {
  portada.classList.add("oculto");
  santuario.classList.remove("oculto");

  if (audioActivo) {
    sonidoAbrir.currentTime = 0;
    sonidoAbrir.play();
  }
});

reliquiaBrujula.addEventListener("click", function() {
  abrirReliquia("brujula", reliquiaBrujula);
});

reliquiaVela.addEventListener("click", function() {
  abrirReliquia("vela", reliquiaVela);
});

reliquiaAlas.addEventListener("click", function() {
  abrirReliquia("alas", reliquiaAlas);
});

reliquiaMuneco.addEventListener("click", function() {
  abrirReliquia("muneco", reliquiaMuneco);
});

agregarHoverSonido(reliquiaBrujula);
agregarHoverSonido(reliquiaVela);
agregarHoverSonido(reliquiaAlas);
agregarHoverSonido(reliquiaMuneco);

abrirCofre.addEventListener("click", function() {
  let palabra = inputPalabra.value.toUpperCase();

  if (palabra == "LUNA") {
    cartaFinal.classList.remove("oculto");

    if (audioActivo) {
      sonidoPremio.currentTime = 0;
      sonidoPremio.play();
    }
  } else {
    alert("La palabra todavía no es correcta.");
  }
});

function abrirReliquia(nombre, boton) {
  let datos = reliquias[nombre];

  body.className = "";
  body.classList.add(datos.clase);

  imagenBestia.src = datos.imagen;
  tituloBestia.textContent = datos.titulo;
  textoBestia.textContent = datos.texto;
  mensajeJuego.textContent = "";
  panelBestia.classList.remove("oculto");

  if (audioActivo) {
    sonidoRevelar.currentTime = 0;
    sonidoRevelar.play();

    detenerMusicas();
    musicaAmbiente.src = datos.musica;
    musicaAmbiente.currentTime = 0;
    musicaAmbiente.play();
  }

  crearMinijuego(nombre, boton);
}

function crearMinijuego(nombre, boton) {
  zonaJuego.innerHTML = "";

  if (nombre == "brujula") {
    zonaJuego.innerHTML = `
      <p>Ayúdala a recuperar el rumbo. Elige la dirección correcta.</p>
      <div class="opciones-direccion">
        <button onclick="resolverDireccion('Sur', 'brujula')">Sur</button>
        <button onclick="resolverDireccion('Norte', 'brujula')">Norte</button>
        <button onclick="resolverDireccion('Oeste', 'brujula')">Oeste</button>
      </div>
    `;
  }

  if (nombre == "vela") {
    zonaJuego.innerHTML = `
      <p>Enciende las tres velas en el orden correcto: centro, izquierda, derecha.</p>
      <div class="velas">
        <button onclick="agregarVela(1)">Izquierda</button>
        <button onclick="agregarVela(2)">Centro</button>
        <button onclick="agregarVela(3)">Derecha</button>
      </div>
    `;
    ordenVelas = [];
  }

  if (nombre == "alas") {
    zonaJuego.innerHTML = `
      <p>Rompe la prisión. Haz clic varias veces sobre la cadena.</p>
      <div class="cadena-juego">
        <img src="assets/img/cadena.png" alt="Cadena" id="cadenaRomper">
        <br>
        <button onclick="romperCadena()">Romper cadena</button>
      </div>
    `;
    clicsCadena = 0;
  }

  if (nombre == "muneco") {
    zonaJuego.innerHTML = `
      <p>Encuentra el símbolo que guarda su nombre verdadero.</p>
      <div class="opciones-simbolo">
        <button onclick="resolverSimbolo('ojo')">Ojo</button>
        <button onclick="resolverSimbolo('llave')">Llave</button>
        <button onclick="resolverSimbolo('luna')">Luna</button>
      </div>
    `;
  }

  reliquiaActual = nombre;
  botonActual = boton;
}

let ordenVelas = [];
let clicsCadena = 0;
let reliquiaActual = "";
let botonActual = null;

function resolverDireccion(direccion, nombre) {
  if (direccion == "Norte") {
    completarReliquia(nombre);
  } else {
    mensajeJuego.textContent = "Ese no era el rumbo correcto.";

    if (audioActivo) {
      sonidoError.currentTime = 0;
      sonidoError.play();
    }
  }
}

function agregarVela(numero) {
  ordenVelas.push(numero);

  if (ordenVelas.length == 3) {
    if (ordenVelas[0] == 2 && ordenVelas[1] == 1 && ordenVelas[2] == 3) {
      completarReliquia("vela");
    } else {
      mensajeJuego.textContent = "La llama se apagó. Intenta otra vez.";
      ordenVelas = [];
      
      if (audioActivo) {
        sonidoError.currentTime = 0;
        sonidoError.play();
      }
    }
  }
}

function romperCadena() {
  clicsCadena = clicsCadena + 1;

  let cadena = document.getElementById("cadenaRomper");

  if (cadena) {
    cadena.style.transform = "scale(" + (1 - clicsCadena * 0.05) + ")";
  }

  if (clicsCadena >= 4) {
    document.body.style.backgroundColor = "#000000";

    setTimeout(function() {
      document.body.style.backgroundColor = "";
      completarReliquia("alas");
    }, 400);
  } else {
    mensajeJuego.textContent = "La cadena se debilita...";
  }
}

function resolverSimbolo(simbolo) {
  if (simbolo == "llave") {
    completarReliquia("muneco");
  } else {
   mensajeJuego.textContent = "Ese símbolo no abre su memoria.";

  if (audioActivo) {
    sonidoError.currentTime = 0;
    sonidoError.play();
    }
  }
}

function completarReliquia(nombre) {
  if (progreso[nombre] == true) {
    mensajeJuego.textContent = "Esta bestia ya te entregó su letra.";
    return;
  }

  progreso[nombre] = true;
  letras[nombre] = reliquias[nombre].letra;

  if (nombre == "brujula") {
    letra1.textContent = letras[nombre];
  }

  if (nombre == "vela") {
    letra2.textContent = letras[nombre];
  }

  if (nombre == "alas") {
    letra3.textContent = letras[nombre];
  }

  if (nombre == "muneco") {
    letra4.textContent = letras[nombre];
  }

  if (botonActual) {
    botonActual.classList.add("reliquia-resuelta");
  }

  mensajeJuego.textContent = "La bestia te entregó la letra: " + reliquias[nombre].letra;
  textoEstado.textContent = "Reliquias resueltas: " + contarResueltas() + " de 4";

  if (audioActivo) {
    sonidoResolver.currentTime = 0;
    sonidoResolver.play();

    setTimeout(function() {
      sonidoPremio.currentTime = 0;
      sonidoPremio.play();
    }, 300);
  }

  if (contarResueltas() == 4) {
    zonaFinal.classList.remove("oculto");
    textoEstado.textContent = "Las cuatro letras han despertado el cofre.";
  }
}

function contarResueltas() {
  let total = 0;

  if (progreso.brujula) {
    total = total + 1;
  }

  if (progreso.vela) {
    total = total + 1;
  }

  if (progreso.alas) {
    total = total + 1;
  }

  if (progreso.muneco) {
    total = total + 1;
  }

  return total;
}

function detenerMusicas() {
  musicaPortada.pause();
  musicaPortada.currentTime = 0;

  musicaAmbiente.pause();
  musicaAmbiente.currentTime = 0;
}

function agregarHoverSonido(elemento) {
  elemento.addEventListener("mouseenter", function() {
    if (audioActivo) {
      sonidoHover.currentTime = 0;
      sonidoHover.play();
    }
  });
}

function crearBrillos() {
  for (let i = 0; i < 35; i++) {
    let brillo = document.createElement("div");
    brillo.className = "brillito";
    brillo.textContent = "✦";
    brillo.style.left = Math.random() * window.innerWidth + "px";
    brillo.style.top = Math.random() * window.innerHeight + "px";
    brillo.style.animationDuration = (Math.random() * 3 + 2) + "s";
    brillo.style.fontSize = (Math.random() * 10 + 8) + "px";

    brillos.appendChild(brillo);
  }
}
