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


  // Mostrar cargando

  const aiMessage =
    document.createElement("div");

  aiMessage.className =
    "ai-message";

  aiMessage.textContent =
    "🤖 NEXA está pensando...";

  chat.appendChild(aiMessage);


  chat.scrollTop =
    chat.scrollHeight;


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
    // MOSTRAR RESPUESTA
    // ======================================

    if (!data.respuesta) {

      throw new Error(
        "Groq no devolvió texto."
      );

    }


    aiMessage.textContent =
      "🤖 " + data.respuesta;


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