const express = require("express");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("."));

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post("/api/chat", async (req, res) => {

    try {

        const mensaje = req.body.mensaje;

        const completion = await groq.chat.completions.create({
    model: "groq/compound-mini",

    messages: [
        {
    role: "user",
    content: `La fecha actual en Perú es 24 de agosto de 2026.
La zona horaria es America/Lima.
Si la pregunta necesita información actual, utiliza la búsqueda web.
Pregunta del usuario: ${mensaje}`
}
    ]
});

        const respuesta =
            completion.choices[0].message.content;

        res.json({
            respuesta: respuesta
        });

    } catch (error) {

        console.error("ERROR GROQ:", error);

        res.status(500).json({
            error: error.message
        });

    }

});

app.listen(3000, () => {

    console.log("🚀 NEXA funcionando en:");
    console.log("http://localhost:3000");

});