const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('admin'), getUsers); // Apenas admin pode listar todos os usuários

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, authorize('admin', 'client'), updateUser) // Admin pode editar qualquer um, cliente pode editar a si mesmo
    .delete(protect, authorize('admin'), deleteUser); // Apenas admin pode deletar usuários

module.exports = router;