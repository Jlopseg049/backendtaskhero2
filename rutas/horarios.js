const router = require('express').Router();
const {postHorario,
       postDiaHorario,
       deleteHorarioById,
       deleteDiaHorarioById,
       getDiasHorarioByUserId,
       getDiaHorarioById,
       editarDiaHorario,
       editarHorario} = require('../controladores/horarios');

router.get('/', (req, res) => {
    res.send('Hello World')
}
);
/*<---Create--->*/
router.post('/postHorario', postHorario);//Mirar tokenOwner
router.post('/postDiaHorario', postDiaHorario);//Mirar tokenOwner
/*<---Read--->*/
router.get('/getDiasHorarioByUserId/:id', getDiasHorarioByUserId);//Mirar tokenOwner
router.get('/getDiaHorarioById/:id', getDiaHorarioById);//Mirar tokenOwner
/*<---Update--->*/
router.put('/editarDiaHorario/:id', editarDiaHorario);//Mirar tokenOwner
router.put('/editarHorario/:id', editarHorario);//Mirar tokenOwner
/*<---Delete--->*/
router.delete('/deleteHorarioById/:id', deleteHorarioById);//Mirar tokenOwner
router.delete('/deleteDiaHorarioById/:id', deleteDiaHorarioById);//Mirar tokenOwner

module.exports = router;

