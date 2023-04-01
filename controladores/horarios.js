//Controlador para las peticiónes de horario y diaHorario
const {Horario} = require('../modelos/Horario');
const {DiaHorario} = require('../modelos/Horario');

//Crear horario
const postHorario = async (req, res) => {
    try {
        const { user_id, nombre, dias, tramoHorario } = req.body;

        // Crea el horario
        const horario = await Horario.create({
            user_id,
            nombre,
            dias: [],
            tramoHorario
        });

        // Agrega los días al horario
        const diasHorario = await Promise.all(
            dias.map(async (dia) => {
                const { diaSemana, activo, tramoHorario } = dia;
                const nuevoDia = await DiaHorario.create({
                    diaSemana,
                    activo,
                    tramoHorario,
                    horario: horario._id
                });
                // Agrega el día al horario
                horario.dias.push(nuevoDia._id);
                return nuevoDia;
            })
        );

        // Guarda el horario con los días
        await horario.save();

        res.status(201).json({
            success: true,
            horario,
            diasHorario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el horario y sus días correspondientes'
        });
    }
};
//Crear diaHorario

const postDiaHorario = async (req, res) => {
    const { diaSemana, activo, tramoHorario } = req.body;
    const userId = req.headers['user-id']; // obtenemos el user_id de la cabecera
    console.log("--------------------------------------------")
    console.log(req.headers)
    try {
        const nuevoDiaHorario = new DiaHorario({
            diaSemana,
            activo,
            tramoHorario,
            userId // incluimos el user_id en el objeto a guardar
        });

        await nuevoDiaHorario.save();

        res.status(201).json({ mensaje: 'Registro de día y horario creado con éxito.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Hubo un error al crear el registro de día y horario.' });
    }
};

// Delete Horario
const deleteHorarioById = async (req, res) => {
    const horarioId = req.params.id;

    try {
        // Busca el horario a eliminar
        const horario = await Horario.findById(horarioId);

        if (!horario) {
            return res.status(404).json({ mensaje: 'Horario no encontrado' });
        }

        // Elimina los días de horario asociados
        await DiaHorario.deleteMany({ horario: horarioId });

        // Elimina el horario
        await horario.remove();

        res.status(200).json({ mensaje: 'Horario eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el horario' });
    }
};

// Delete DiaHorario
const deleteDiaHorarioById = async (req, res) => {
    const diaHorarioId = req.params.id;

    try {
        // Busca el día de horario a eliminar
        const diaHorario = await DiaHorario.findById(diaHorarioId);

        if (!diaHorario) {
            return res.status(404).json({ mensaje: 'Día y horario no encontrado' });
        }

        // Elimina el día de horario
        await diaHorario.remove();

        res.status(200).json({ mensaje: 'Día y horario eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el día y horario' });
    }
}

// Get Dias Horario By User Id
const getDiasHorarioByUserId = async (req, res) => {
    const usuarioId = req.params.id; // asumiendo que el id del usuario se recibe como parámetro en la ruta
    try {
        const horarios = await Horario.find({ usuario: usuarioId }); // obtener los horarios del usuario
        let diasHorario = []; // arreglo donde se guardarán los días de horario

        // para cada horario encontrado, buscar sus días de horario y agregarlos al arreglo
        for (let horario of horarios) {
            const dias = await DiaHorario.find({ horario: horario._id });
            diasHorario.push({
                horario: horario,
                dias: dias,
            });
        }

        // buscar los días de horario que no pertenecen a ningún horario y agregarlos al arreglo
        const diasSinHorario = await DiaHorario.find({ horario: null });
        diasHorario.push({

            diasSueltos: diasSinHorario,
        });

        res.status(200).json({
            ok: true,
            diasHorario: diasHorario,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los días de horario del usuario",
        });
    }
};

//Get Dia Horario By Id
const getDiaHorarioById = async (req, res) => {
    const diaHorarioId = req.params.id;
    try {
        const diaHorario = await DiaHorario.findById(diaHorarioId);
        if (!diaHorario) {
            return res.status(404).json({ mensaje: 'Día y horario no encontrado' });
        }
        res.status(200).json({ diaHorario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el día y horario' });
    }
}

const editarDiaHorario = async (req, res) => {
    const { diaSemana, activo, tramoHorario } = req.body;
    const diaHorarioId = req.params.id;
    try {
        const diaHorario = await DiaHorario.findById(diaHorarioId);
        if (!diaHorario) {
            return res.status(404).json({ mensaje: 'Día y horario no encontrado' });
        }
        diaHorario.diaSemana = diaSemana;
        diaHorario.activo = activo;
        diaHorario.tramoHorario = tramoHorario;

        await diaHorario.save();

        res.status(200).json({ mensaje: 'Día y horario actualizado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el día y horario' });
    }
}
//Al editar un horario, se debe editar el horario y los días de horario asociados
//Ademas si algún dia del antiguo horario no se encuentra en el nuevo horario, se debe eliminar
//Si algún dia del nuevo horario no se encuentra en el antiguo horario, se debe crear
const editarHorario = async (req, res) => {
    const { nombre, dias, tramoHorario } = req.body;
    const horarioId = req.params.id;
    try {
        const horario = await Horario.findById(horarioId);
        if (!horario) {
            return res.status(404).json({ mensaje: 'Horario no encontrado' });
        }
        horario.nombre = nombre;
        horario.tramoHorario = tramoHorario;

        // Buscar los días de horario que pertenecen al horario
        const diasHorario = await DiaHorario.find({ horario: horarioId });

        // Para cada día de horario, si no se encuentra en el nuevo horario, eliminarlo
        for (let diaHorario of diasHorario) {
            const diaEncontrado = dias.find((dia) => dia._id === diaHorario._id);
            if (!diaEncontrado) {
                await diaHorario.remove();
            }
        }

        // Para cada día del nuevo horario, si no se encuentra en el antiguo horario, crearlo
        for (let dia of dias) {
            const diaEncontrado = diasHorario.find((diaHorario) => diaHorario._id === dia._id);
            if (!diaEncontrado) {
                const nuevoDiaHorario = new DiaHorario({
                    diaSemana: dia.diaSemana,
                    activo: dia.activo,
                    tramoHorario: dia.tramoHorario,
                    horario: horario._id
                });
                await nuevoDiaHorario.save();
            }
        }

        await horario.save();

        res.status(200).json({ mensaje: 'Horario actualizado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el horario' });
    }
}
//exportamos las funciones
module.exports = {
    postHorario,
    postDiaHorario,
    deleteHorarioById,
    deleteDiaHorarioById,
    getDiasHorarioByUserId,
    getDiaHorarioById,
    editarDiaHorario,
    editarHorario
}


