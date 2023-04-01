    const {response} = require('express');
    const Usuario = require('../modelos/Usuario');
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);

    const { generarJWT } = require('../helper/jwt');
    const jwt = require("jsonwebtoken");
    const registrar = async (req, res = response) => {
        const { email, password} = req.body
        let usuario = await Usuario.findOne({email});
        if (usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: "el usuario ya existe"
            })
        }
        try {
            usuario = new Usuario(req.body);
            usuario.password = bcrypt.hashSync(password,  salt);
            const token = await generarJWT(usuario._id, usuario.nombre);

            usuario.token = token;
            await usuario.save();
            return res.status(201).json({
                ok: true,
                mensaje: "registro",
                nombre: usuario.nombre,
                email: usuario.email,
                password: usuario.password,
                token
            })
        } catch (error) {

            console.log(error);
            return res.status(500).json({
                ok: false,
                mensaje: "error inesperado"
            })
        }
    }
    const loguear = async (req, res = response) => {
        const { email, password}= req.body;
        try {
            let usuario = await Usuario.findOne({email});
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "el usuario no existe"
                })
            }
            const validPassword = bcrypt.compareSync(password, usuario.password);
            if (!validPassword) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "el password o usuario no es válido"
                })
            }
            const token = await generarJWT(usuario._id, usuario.nombre);
            // Agregamos el token al objeto usuario
            usuario.token = token;

            res.json({
                ok:true,
                mensaje: "login",
                email,
                password,
                token
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                mensaje: "error inesperado"
            })
        }


    }
    const logOut = async (req, res = response) => {
        const usuarioId = req.usuario._id;

        try {
            // Eliminar el token de la propiedad 'token' del objeto usuario
            await Usuario.findByIdAndUpdate(usuarioId, { token: null });

            res.json({
                ok: true,
                mensaje: "logout"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                mensaje: "error inesperado"
            });
        }
    };
    const miraToken = async (req, res = response) => {
        try {
            const token = req.body.token;
            const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
            const usuario = await Usuario.findById(decoded.id);
            if (!usuario) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No se encontró el usuario correspondiente al token'
                });
            }
            return res.json({
                ok: true,
                msg: usuario.nombre,
                id: usuario._id
            });
        } catch (error) {
            console.log(error);
            return res.status(401).json({
                ok: false,
                msg: 'Token inválido'
            });
        }
    };
    const revalidarToken = async (req, res = response) => {
        let {uid, nombre} = req.body;
         // uid =new ObjectId(uid.toString());
        const token = await generarJWT(uid, nombre);
        // Actualizamos el token del usuario en la base de datos
        await Usuario.findByIdAndUpdate(uid, { token });
        res.json({
            ok: true,
            mensaje: "renew",
            uid,
            nombre,
            token
        })
    }



    module.exports = {
        registrar, loguear, revalidarToken, miraToken,logOut
    }



