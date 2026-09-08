const express = require("express");
const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static("."));


// ========================================
// GROQ
// ========================================

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,

    defaultHeaders: {
        "Groq-Model-Version": "latest"
    }
});


// ========================================
// GOOGLE GEMINI
// ========================================

const googleAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ========================================
// CHAT DE NEXA CON GROQ
// ========================================

app.post("/api/chat", async (req, res) => {

    try {

        const mensaje = req.body.mensaje;

        const fechaHoy = new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "America/Lima"
        });

        console.log("\n==============================");
        console.log("👤 PREGUNTA:");
        console.log(mensaje);
        console.log("==============================");

        const completion =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-20b",

                reasoning_effort: "low",

                max_completion_tokens: 1024,

                tools: [
                    {
                        type: "browser_search"
                    }
                ],

                messages: [
                    {
                        role: "system",
                        content: `Hoy es ${fechaHoy} (hora de Perú). Usa siempre esta fecha como la fecha real y actual; no la calcules ni la asumas de otra forma.`
                    },
                    {
                        role: "user",
                        content: mensaje
                    }
                ]

            });

        const message =
            completion.choices[0].message;

        console.log("🤖 RESPUESTA:");
        console.log(message.content);

        console.log("\n🌐 HERRAMIENTAS:");
        console.log(message.executed_tools || "Ninguna");

        console.log("==============================\n");

        res.json({
            respuesta: message.content,
            web_used: !!message.executed_tools
        });

    } catch (error) {

        console.error("\n❌ ERROR DE GROQ:");
        console.error("Status:", error.status);
        console.error("Mensaje:", error.message);

        if (error.error) {
            console.error(
                "Detalle:",
                JSON.stringify(error.error, null, 2)
            );
        }

        let mensajeError = error.message;

        if (error.status === 413) {

            mensajeError =
                "La búsqueda trajo demasiada información esta vez. Intenta preguntar de otra forma o vuelve a intentarlo en un momento.";

        } else if (error.status === 429) {

            mensajeError =
                "Se acabó la cuota gratis de hoy por unos minutos. Espera un ratito y vuelve a preguntar.";
        }

        res.status(error.status || 500).json({
            error: mensajeError
        });

    }

});


// ========================================
// GENERAR IMÁGENES CON GEMINI
// ========================================

app.post("/api/generate-image", async (req, res) => {

    try {

        const prompt = req.body.prompt;

        if (!prompt || !prompt.trim()) {

            return res.status(400).json({
                error: "Escribe una descripción para generar la imagen."
            });

        }

        console.log("\n==============================");
        console.log("🎨 GENERANDO IMAGEN");
        console.log("📝 PROMPT:");
        console.log(prompt);
        console.log("==============================");

        const interaction =
            await googleAI.interactions.create({

                model: "gemini-3.1-flash-image",

                input: prompt,

                response_format: {
                    type: "image",
                    aspect_ratio: "1:1",
                    image_size: "1K"
                }

            });


        const generatedImage =
            interaction.output_image;


        if (!generatedImage) {

            throw new Error(
                "Gemini no devolvió una imagen."
            );

        }


        console.log("✅ IMAGEN GENERADA CORRECTAMENTE");


        res.json({

            success: true,

            imagen: generatedImage.data,

            mime_type:
                generatedImage.mime_type || "image/png"

        });


    } catch (error) {

        console.error("\n❌ ERROR DE GEMINI:");
        console.error("Mensaje:", error.message);

        if (error.status) {
            console.error("Status:", error.status);
        }

        if (error.error) {
            console.error(
                "Detalle:",
                JSON.stringify(error.error, null, 2)
            );
        }

        res.status(error.status || 500).json({

            success: false,

            error:
                error.message ||
                "No se pudo generar la imagen con Gemini."

        });

    }

});


// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(3000, () => {

    console.log("================================");
    console.log("🚀 NEXA funcionando");
    console.log("💬 Groq: conectado");
    console.log("🎨 Gemini: configurado");
    console.log("🌐 http://localhost:3000");
    console.log("================================");

});