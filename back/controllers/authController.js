const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Função auxiliar para gerar JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    // Validação básica
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    try {
        // Verificar se o usuário já existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }

        // Criar novo usuário
        const user = await User.create({
            name,
            email,
            password,
            phone: phone || '', // Telefone é opcional
            role: role || 'client', // Default para 'client'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Dados de usuário inválidos.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor durante o registro.' });
    }
};

// @desc    Autenticar usuário e obter token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar se o usuário existe
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor durante o login.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};