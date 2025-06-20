const Service = require('../models/service');

// @desc    Criar um novo serviço
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
    const { name, description, price, duration /*, icon*/ } = req.body; // Remova 'icon' do destructuring

    if (!name || !description || !price || !duration) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios para o serviço.' });
    }

    try {
        const serviceExists = await Service.findOne({ name });
        if (serviceExists) {
            return res.status(400).json({ message: 'Já existe um serviço com este nome.' });
        }

        const service = await Service.create({
            name,
            description,
            price,
            duration,
            // icon: icon || 'fas fa-question-circle', // Remova ou comente esta linha
        });

        res.status(201).json({ message: 'Serviço adicionado com sucesso!', service });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao criar serviço.' });
    }
};

// @desc    Obter todos os serviços
// @route   GET /api/services
// @access  Public (qualquer um pode ver os serviços disponíveis)
const getServices = async (req, res) => {
    try {
        const services = await Service.find({});
        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao buscar serviços.' });
    }
};

// @desc    Obter serviço por ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Serviço não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao buscar serviço.' });
    }
};

// @desc    Atualizar serviço
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
    const { name, description, price, duration /*, icon*/ } = req.body; // Remova 'icon' do destructuring

    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            // Verificar se o novo nome já existe para outro serviço
            if (name && name !== service.name) {
                const nameExists = await Service.findOne({ name });
                if (nameExists && nameExists._id.toString() !== service._id.toString()) {
                    return res.status(400).json({ message: 'Já existe um serviço com este nome.' });
                }
            }
            
            service.name = name || service.name;
            service.description = description || service.description;
            service.price = price || service.price;
            service.duration = duration || service.duration;
            // service.icon = icon || service.icon; // Remova ou comente esta linha

            const updatedService = await service.save();
            res.json({ message: 'Serviço atualizado com sucesso!', service: updatedService });
        } else {
            res.status(404).json({ message: 'Serviço não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar serviço.' });
    }
};

// @desc    Deletar serviço
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            // Opcional: verificar se há agendamentos ativos para este serviço antes de deletar
            await Service.deleteOne({ _id: req.params.id });
            res.json({ message: 'Serviço removido com sucesso.' });
        } else {
            res.status(404).json({ message: 'Serviço não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao deletar serviço.' });
    }
};

module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
};