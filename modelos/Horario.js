// Modelo Horario
const Usuario = require("./Usuario");
const { Schema, model } = require('mongoose');

const horarioSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        validate: {
            validator: async function (v) {
                const user = await Usuario.findOne({_id: v}); // busca en la colección de usuarios si el correo existe
                return !!user; // devuelve un booleano que indica si el correo existe o no
            },
            message: 'El usuario no existe en la base de datos'
        }
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del horario es obligatorio']
    },
    dias: [{
        type: Schema.Types.ObjectId,
        ref: 'DiaHorario',
        required: true
    }],
    tramoHorario: {
        inicio: {
            type: Date,
            required: true
        },
        fin: {
            type: Date,
            required: true
        }
    }
});

// Agregar middleware para eliminar los días correspondientes al horario antes de que se elimine el horario
horarioSchema.pre('remove', async function(next) {
    try {
        await this.model('DiaHorario').deleteMany({ _id: { $in: this.dias } });
        next();
    } catch (error) {
        next(error);
    }
});

const Horario = model('Horario', horarioSchema);

// Modelo DiaHorario
const diaHorarioSchema = new Schema({
    diaSemana: {
        type: String,
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        required: true
    },
    activo: {
        type: Boolean,
        required: true
    },
    tramoHorario: {
        inicio: {
            type: Date,
            required: true
        },
        fin: {
            type: Date,
            required: true
        }
    },
    // horario OPCIONAL
    horario: {
        type: Schema.Types.ObjectId,
        ref: 'Horario',
        required: false
    }
});

const DiaHorario = model('DiaHorario', diaHorarioSchema);

module.exports = {
    Horario,
    DiaHorario
};