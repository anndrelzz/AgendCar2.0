const express = require('express');
const router = express.Router();
const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin'), createService) // Apenas admin pode criar
    .get(getServices); // Todos podem ver os serviços disponíveis

router.route('/:id')
    .get(getServiceById)
    .put(protect, authorize('admin'), updateService)
    .delete(protect, authorize('admin'), deleteService);

module.exports = router;