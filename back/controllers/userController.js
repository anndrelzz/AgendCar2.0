const User = require('../models/user');

// @desc    Obter todos os usuários (clientes)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'client' }).select('-password'); // Exclui a senha e busca apenas clientes
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao buscar usuários.' });
    }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Private/Admin ou Usuário Logado (se for seu próprio ID)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            // Permite que o próprio usuário acesse seu perfil ou admin acesse qualquer perfil
            if (req.user.role === 'admin' || req.user.id === user._id.toString()) {
                res.json(user);
            } else {
                res.status(403).json({ message: 'Você não tem permissão para acessar este perfil.' });
            }
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao buscar usuário.' });
    }
};

// @desc    Atualizar informações do usuário
// @route   PUT /api/users/:id
// @access  Private/Admin ou Usuário Logado (para seu próprio perfil)
const updateUser = async (req, res) => {
    const { name, email, phone, role } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Verificar permissão: admin pode editar qualquer um, usuário pode editar a si mesmo
            if (req.user.role === 'admin' || req.user.id === user._id.toString()) {
                user.name = name || user.name;
                user.email = email || user.email;
                user.phone = phone || user.phone;
                // Apenas admin pode mudar o papel do usuário
                if (req.user.role === 'admin' && role) {
                    user.role = role;
                }

                const updatedUser = await user.save();
                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role,
                });
            } else {
                res.status(403).json({ message: 'Você não tem permissão para atualizar este perfil.' });
            }
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar usuário.' });
    }
};

// @desc    Deletar um usuário
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Evitar que um admin se delete
            if (user.role === 'admin' && req.user.id === user._id.toString()) {
                return res.status(400).json({ message: 'Administrador não pode deletar a si mesmo através desta rota.' });
            }
            await User.deleteOne({ _id: req.params.id });
            res.json({ message: 'Usuário removido com sucesso.' });
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao deletar usuário.' });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};