const  jwt = require('jsonwebtoken');

//Esta función es para validar el token en el back
const validarJWT = (req, res, next) => {
    // Leer el token
    const token = req.header('x-token');
    //Para ver la lista de headers


    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }
    try {
        const { uid, name } = jwt.verify(
            token,
            process.env.SECRETORPRIVATEKEY
        );
        req.uid = uid;
        req.name = name;
    }
    catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }

    next();
}

//Esta función es para validar el token en el front
// EJEMPLO DE USO:
// app.get('/api/posts', authenticateToken, (req, res) => {
//     res.json(posts.filter(post => post.username === req.user.name));
// });
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
}
function verifyTokenOwner(req, res, next) {
    const token = req.headers['x-token'];
    console.log((token == null) ? "Token es nulo" : "");
    if (token == null) return res.sendStatus(401); // Unauthorized

    const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    if (decoded.id !== req.body.userId) {
        return res.status(403).json({
            ok: false,
            msg: 'No tienes permiso para realizar esta acción'
        });
    }
    next();

}
module.exports = {
    validarJWT, authenticateToken, verifyTokenOwner
}