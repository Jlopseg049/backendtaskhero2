//console.log('Api REST');

const express = require('express');
require('dotenv').config();
const auth = require ('./rutas/auth');
const horarios = require ('./rutas/horarios');
const{ conexionDB}= require('./database/config');
const cors = require('cors');
conexionDB();
//creación del servidor
const app = express();

//permitir escritura y lectura en json
app.use(express.json());
//Control de acceso HTTP (CORS)
app.use(cors());
//ruta autenticación
app.use('/api/user', auth);
app.use('/api/horarios', horarios);


const PORT = process.env.PORT || 3000

//Para evitar el warning comma expression
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});