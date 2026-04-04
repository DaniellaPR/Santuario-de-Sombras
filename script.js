let abrirLibro = document.getElementById("abrirLibro");
let portada = document.getElementById("portada");
let santuario = document.getElementById("santuario");

let sello1 = document.getElementById("sello1");
let sello2 = document.getElementById("sello2");
let sello3 = document.getElementById("sello3");
let sello4 = document.getElementById("sello4");

let vision = document.getElementById("vision");



let imagenVision = document.getElementById("imagenVision");
let tituloVision = document.getElementById("tituloVision");
let textoVision = document.getElementById("textoVision");
let textoEstado = document.getElementById("textoEstado");
let reliquiaFinal = document.getElementById("reliquiaFinal");

let secretosAbiertos = 0;

let secretos = {
  sello1: {
    nombre: "La Gárgola de Plata",
    texto: "Guardiana de las torres olvidadas. Observa en silencio a quienes cargan una voluntad indomable.",
    imagen: "assets/img/gargola.png"
  },
  sello2: {
    nombre: "La Serpiente del Eclipse",
    texto: "Se desliza entre runas y promesas rotas. Su magia no pide permiso: reclama presencia.",
    imagen: "assets/img/serpiente-mistica.png"
  },
  sello3: {
    nombre: "El Cuervo del Umbral",
    texto: "Mensajero de la noche elegante. Cruza puertas invisibles y deja ecos en los vitrales.",
    imagen: "assets/img/cuervo.png"
  },
  sello4: {
    nombre: "El Lobo Fantasma",
    texto: "Bestia de humo, luna y acero. Avanza con una fuerza oscura y hermosa.",
    imagen: "assets/img/lobo-fantasma.png"
  }
};

abrirLibro.addEventListener("click", function() {
  portada.classList.add("oculto");
  santuario.classList.remove("oculto");
});

sello1.addEventListener("click", function() {
  abrirSecreto("sello1", sello1);
});

sello2.addEventListener("click", function() {
  abrirSecreto("sello2", sello2);
});

sello3.addEventListener("click", function() {
  abrirSecreto("sello3", sello3);
});

sello4.addEventListener("click", function() {
  abrirSecreto("sello4", sello4);
});

function abrirSecreto(nombreSello, boton) {
  let secreto = secretos[nombreSello];

  imagenVision.src = secreto.imagen;
  tituloVision.textContent = secreto.nombre;
  textoVision.textContent = secreto.texto;

  vision.classList.remove("oculto");

  if (boton.classList.contains("sello-abierto") == false) {
    boton.classList.add("sello-abierto");
    secretosAbiertos = secretosAbiertos + 1;
  }

  textoEstado.textContent = "Sellos abiertos: " + secretosAbiertos + " de 4";

  if (secretosAbiertos == 4) {
    reliquiaFinal.classList.remove("oculto");
    textoEstado.textContent = "Todos los secretos del grimorio han despertado.";
  }
}
