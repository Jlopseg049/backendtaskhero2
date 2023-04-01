const  jwt  =  require ( 'jsonwebtoken' ) ;

const generarJWT = (id, nombre) => {
    return new Promise((resolve, reject) => {
        //definir id y nombre
        const payload = {
            id,
            nombre
        }
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY,{ expiresIn: '2h'}, (err, token) =>
        {
            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            } else {
                resolve(token);
            }
        }

        )
    })




}
module.exports = { generarJWT }