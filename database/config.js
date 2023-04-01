const mongoose = require('mongoose');
const conexionDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('DB Online');
    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la BD ver logs');
    }
}
module.exports ={ conexionDB };