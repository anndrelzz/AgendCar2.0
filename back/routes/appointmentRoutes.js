const express = require('express');
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentsByUserId,
    updateAppointment,
    deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createAppointment)
    .get(protect, getAppointments); // Clientes veem os seus, admins veem todos

router.route('/user/:userId') // Rota para buscar agendamentos por ID de usuário
    .get(protect, getAppointmentsByUserId);

router.route('/:id')
    .put(protect, updateAppointment) // Cliente pode mudar status para 'cancelled', admin pode tudo
    .delete(protect, authorize('admin'), deleteAppointment); // Apenas admin pode deletar completamente

module.exports = router;