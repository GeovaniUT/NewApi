import express from 'express';
import mysql from 'mysql2';

const app = express();


// Crear conexión con la base de datos
const dbConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_current_password",
    database: "sm52_arduino"
});


dbConnection.connect((err) => {
    if (err) {
        console.error("Error en la conexión:", err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

app.use(express.json());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}}`);
});

// Función para manejar errores de base de datos
function handleDatabaseError(res, error) {
    console.error("Error en la base de datos:", error);
    res.status(500).json({ error: "Error en la base de datos" });
}

// Ruta para obtener datos en un rango de distancia
app.get('/datos-rango/min=:distanciaInicio&max=:distanciaFin', (req, res) => {
    const { distanciaInicio, distanciaFin } = req.params;
    const query = "SELECT * FROM tb_sensores WHERE Dato_sensor BETWEEN ? AND ?";
    dbConnection.query(query, [distanciaInicio, distanciaFin], (error, results) => {
        if (error) {
            handleDatabaseError(res, error);
        } else {
            res.json(results);
        }
    });
});

// Ruta para obtener todos los registros
app.get('/sensor-leds', (req, res) => {
    const query = 'SELECT * FROM tb_sensores';
    dbConnection.query(query, (err, results) => {
        if (err) {
            handleDatabaseError(res, err);
        } else {
            res.json(results);
        }
    });
});

app.get('/sensor/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM tb_sensores WHERE id_tabla = ?';
    dbConnection.query(query, [id], (err, results) => {
        if (err) {
            handleDatabaseError(res, err);
        } else {
            if (results.length === 0) {
                res.status(404).send('Dato no encontrado');
            } else {
                res.json(results[0]);
            }
        }
    });
});

// Ruta para crear un nuevo registro
app.post('/sensor', (req, res) => {
    const { Mensaje, Dato_sensor } = req.body;
    const query = 'INSERT INTO tb_sensores (Mensaje, Dato_sensor) VALUES (?, ?)';
    dbConnection.query(query, [Mensaje, Dato_sensor], (err, result) => {
        if (err) {
            handleDatabaseError(res, err);
        } else {
            res.json({ id: result.insertId, Mensaje, Dato_sensor });
        }
    });
});

// Ruta para actualizar un registro por su ID
app.put('/sensor/:id', (req, res) => {
    const id = req.params.id;
    const { Mensaje, Dato_sensor } = req.body;
    const query = 'UPDATE tb_sensores SET Mensaje = ?, Dato_sensor = ? WHERE id_tabla = ?';
    dbConnection.query(query, [Mensaje, Dato_sensor, id], (err, result) => {
        if (err) {
            handleDatabaseError(res, err);
        } else {
            res.json({ id, Mensaje, Dato_sensor });
        }
    });
});

app.delete('/sensor/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM tb_sensores WHERE id_tabla = ?';
    dbConnection.query(query, [id], (err, result) => {
        if (err) {
            handleDatabaseError(res, err);
        } else {
            res.json({ message: 'Registro eliminado correctamente' });
        }
    });
});