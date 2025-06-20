const express = require('express');
const router = express.Router();
const {
    createVehicle,
    getVehicles,
    getVehiclesByUserId,
    updateVehicle,
    deleteVehicle,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createVehicle) // Apenas usuários autenticados podem criar veículos
    .get(protect, getVehicles); // Clientes veem os seus, admins veem todos

router.route('/user/:userId') // Nova rota para buscar veículos por ID de usuário
    .get(protect, getVehiclesByUserId);

router.route('/:id')
    .put(protect, updateVehicle)
    .delete(protect, deleteVehicle);

module.exports = router;