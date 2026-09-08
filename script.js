// ==========================================
// NEXA - GROQ
// ==========================================


// ==========================================
// CONFIGURACIÓN
// ==========================================

const GROQ_URL = "/api/chat";


// ==========================================
// PANTALLA DE INICIO
// ==========================================

window.addEventListener("load", () => {

  setTimeout(() => {

    const splash =
      document.getElementById("splash");

    const main =
      document.getElementById("main");

    if (splash) {
      splash.classList.add("hidden");
    }

    if (main) {
      main.classList.remove("hidden");
    }

  }, 2000);

});


// ==========================================
// CHAT CON GROQ
// ==========================================

const PREFIJO_IMAGEN = "quiero crear una imagen de";

async function sendMessage() {

  const input =
    document.getElementById("user-input");

  const chat =
    document.getElementById("chat-history");

  const message =
    input.value.trim();


  if (!message) {
    return;
  }


  const esImagen =
    message.toLowerCase().startsWith(PREFIJO_IMAGEN);


  // Mostrar mensaje del usuario

  const userMessage =
    document.createElement("div");

  userMessage.className =
    "user-message";

  userMessage.textContent =
    "👤 " + message;

  chat.appendChild(userMessage);


  // Limpiar caja

  input.value = "";


  // Burbuja de respuesta (vacía por ahora)

  const aiMessage =
    document.createElement("div");

  aiMessage.className =
    "ai-message";

  chat.appendChild(aiMessage);

  chat.scrollTop =
    chat.scrollHeight;


  // ======================================
  // PEDIDO DE IMAGEN
  // ======================================

  if (esImagen) {

    const descripcion =
      message.slice(PREFIJO_IMAGEN.length).trim();

    if (!descripcion) {
      aiMessage.textContent =
        'Cuéntame qué imagen quieres, por ejemplo: "quiero crear una imagen de un gato astronauta".';
      return;
    }

    generarImagenIA(aiMessage, descripcion);
    return;

  }


  // Mostrar cargando

  aiMessage.textContent =
    "🤖 NEXA está pensando...";


  try {

    const response =
      await fetch(GROQ_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          mensaje: message
        })

      });


    const data =
      await response.json();


    console.log(
      "Respuesta de Groq:",
      data
    );


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Error desconocido de Groq"
      );

    }


    // ======================================
    // MOSTRAR RESPUESTA (con formato)
    // ======================================

    if (!data.respuesta) {

      throw new Error(
        "Groq no devolvió texto."
      );

    }


    mostrarRespuestaFormateada(
      aiMessage,
      data.respuesta
    );


  } catch (error) {

    console.error(
      "Error NEXA:",
      error
    );

    aiMessage.textContent =
      "⚠️ " + error.message;

  }


  chat.scrollTop =
    chat.scrollHeight;

}


// ==========================================
// FORMATO DE TEXTO (negritas, títulos, tablas)
// ==========================================

function mostrarRespuestaFormateada(elemento, texto) {

  if (window.marked && window.DOMPurify) {

    const html =
      DOMPurify.sanitize(marked.parse(texto));

    elemento.innerHTML =
      '<span class="emoji-nexa">🤖</span> ' + html;

  } else {

    // Si las librerías no cargaron, mostrar texto plano
    elemento.textContent =
      "🤖 " + texto;

  }

}


// ==========================================
// CREAR IMAGEN CON IA (Pollinations, sin API key)
// ==========================================

function generarImagenIA(elemento, descripcion) {

  elemento.textContent =
    "🎨 Generando tu imagen, esto puede tardar unos segundos...";

  const semilla =
    Math.floor(Math.random() * 999999999);

  const url =
    "https://image.pollinations.ai/prompt/" +
    encodeURIComponent(descripcion) +
    "?width=1024&height=1024&nologo=true&seed=" +
    semilla;

  const img =
    document.createElement("img");

  img.className =
    "imagen-generada";

  img.alt =
    descripcion;

  img.onload = () => {

    elemento.textContent = "";
    elemento.appendChild(img);

    const chat =
      document.getElementById("chat-history");

    chat.scrollTop =
      chat.scrollHeight;

  };

  img.onerror = () => {

    elemento.textContent =
      "⚠️ No pude generar la imagen. Intenta de nuevo con otra descripción.";

  };

  img.src = url;

}


// ==========================================
// ENTER PARA ENVIAR
// ==========================================

const input =
  document.getElementById("user-input");


if (input) {

  input.addEventListener(
    "keydown",
    function(event) {

      if (event.key === "Enter") {

        sendMessage();

      }

    }
  );

}


// ==========================================
// CONSEJOS
// ==========================================

function darConsejo() {

  const input =
    document.getElementById("user-input");

  input.value =
    "Dame un consejo sobre ";

  input.focus();

}


// ==========================================
// RESUMIR TEXTO
// ==========================================

function resumirTexto() {

  const input =
    document.getElementById("user-input");

  input.value =
    "Resume el siguiente texto: ";

  input.focus();

}


// ==========================================
// CREAR IMAGEN
// ==========================================

function generarImagen() {

  const input =
    document.getElementById("user-input");

  input.value =
    "Quiero crear una imagen de ";

  input.focus();

}


// ==========================================
// LIMPIAR CHAT
// ==========================================

function limpiarChat() {

  const chat =
    document.getElementById("chat-history");

  chat.innerHTML = "";

}


// ==========================================
// HISTORIAL
// ==========================================

function mostrarHistorial() {

  alert(
    "El historial estará disponible próximamente."
  );

}


// ==========================================
// RECONOCIMIENTO DE VOZ
// ==========================================

function startVoiceInput() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    alert(
      "Tu navegador no admite reconocimiento de voz."
    );

    return;

  }


  const recognition =
    new SpeechRecognition();


  recognition.lang =
    "es-PE";

  recognition.continuous =
    false;

  recognition.interimResults =
    false;


  recognition.onstart = () => {

    console.log(
      "🎤 NEXA está escuchando..."
    );

  };


  recognition.onresult =
    (event) => {

      const text =
        event.results[0][0]
          .transcript;


      document
        .getElementById("user-input")
        .value = text;

    };


  recognition.onerror =
    (event) => {

      console.error(
        "Error de voz:",
        event.error
      );

    };


  recognition.start();

}