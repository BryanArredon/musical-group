const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'musical_group.db');

// Middleware para decodificar JSON y cuerpos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend desde la carpeta actual
app.use(express.static(__dirname));

// Inicializar la base de datos SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos local SQLite en:', DB_PATH);
        
        // Crear tabla de usuarios/integrantes si no existe
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT,
                rol TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error al crear la tabla "usuarios":', err.message);
            } else {
                console.log('Tabla "usuarios" verificada/creada con éxito.');
            }
        });
    }
});

// Ruta raíz que sirve la interfaz de registro directamente
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'registro.html'));
});

// Ruta POST para recibir el formulario y guardarlo en la base de datos
app.post('/submit', (req, res) => {
    const { user_name, user_email, user_message, user_rol } = req.body;

    // Validación básica del lado del servidor
    if (!user_name || user_name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: 'El nombre debe tener al menos 3 caracteres.'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user_email || !emailRegex.test(user_email.trim())) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, proporciona un correo electrónico válido.'
        });
    }

    if (!user_rol || user_rol.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'El rol debe tener al menos 2 caracteres.'
        });
    }

    // Consulta SQL segura con placeholders para prevenir inyección SQL
    const sql = `INSERT INTO usuarios (name, email, message, rol) VALUES (?, ?, ?, ?)`;
    const params = [
        user_name.trim(),
        user_email.trim(),
        user_message ? user_message.trim() : '',
        user_rol.trim()
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error al guardar en la base de datos:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Ocurrió un error al guardar tu registro en el servidor.'
            });
        }
        
        console.log(`Registro guardado exitosamente. ID: ${this.lastID}`);
        res.status(200).json({
            success: true,
            message: '¡Registro guardado con éxito en la base de datos local!'
        });
    });
});

// Controlar el cierre de la conexión a la base de datos al detener el servidor
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos SQLite:', err.message);
        } else {
            console.log('Conexión a la base de datos SQLite cerrada con éxito.');
        }
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Servidor local backend corriendo en:`);
    console.log(` http://localhost:${PORT}`);
    console.log(` Accede directamente a: http://localhost:${PORT}/registro.html`);
    console.log(`==================================================`);
});
