const {Router} = require('express');
const { registrar, loguear, revalidarToken, miraToken, logOut} = require('../controladores/auth');
const { check } = require('express-validator')
const validarCampos = require("../middleware/validator");
const {validarJWT } = require("../middleware/validar-token");
const router = Router();

//ruta raíz
router.post('/', (req, res) =>{
    res.send('Hello World')
});

router.post("/miraToken",  miraToken);
router.post("/registro", 
    [

        check('nombre', 'el nombre no puede estar vacío').notEmpty(),
        check('email', "El email tiene que ser válido").isEmail(),
        check('password', "El password debe tener al menos 8 caracteres").isLength({min:8}),
        validarCampos
    ], 
registrar);

router.post("/login",
        check('email', "El email tiene que ser válido").isEmail(),
        check('password', "El password debe tener al menos 8 caracteres").isLength({min:8}),
        validarCampos
    ,loguear);

router.post("/revalidar", validarJWT ,revalidarToken);


router.post("/logout",validarJWT, logOut);

module.exports = router