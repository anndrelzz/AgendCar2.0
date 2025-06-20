const Vehicle = require('../models/vehicle');

// @desc    Criar um novo veículo
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res) => {
    const { plate, brand, model, type, color } = req.body;
    const userId = req.user._id; // O ID do usuário logado (do token)

    if (!plate || !brand || !model || !type || !color) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos do veículo.' });
    }

    try {
        // Verificar se a placa já existe para o mesmo usuário
        const vehicleExists = await Vehicle.findOne({ userId, plate: plate.toUpperCase() });
        if (vehicleExists) {
            return res.status(400).json({ message: 'Esta placa já está cadastrada para um de seus veículos.' });
        }

        const vehicle = await Vehicle.create({
            userId,
            plate: plate.toUpperCase(),
            brand,
            model,
            type,
            color,
        });

        res.status(201).json({ message: 'Veículo adicionado com sucesso!', vehicle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao criar veículo.' });
    }
};

// @desc    Obter todos os veículos (admin) ou veículos do usuário logado (cliente)
// @route   GET /api/vehicles
// @route   GET /api/vehicles/user/:userId (para cliente específico)
// @access  Private (admin pode ver todos, cliente só os seus)
const getVehicles = async (req, res) => {
    try {
        let vehicles;
        if (req.user.role === 'admin') {
            vehicles = await Vehicle.find({}).populate('userId', 'name email'); // Popula com info do usuário
        } else {
            vehicles = await Vehicle.find({ userId: req.user._id });
        }
        res.json(vehicles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao buscar veículos.' });
    }
};

// @desc    Obter veículos por ID do usuário
// @route   GET /api/vehicles/user/:userId
// @access  Private (usuário só pode ver os seus)
const getVehiclesByUserId = async (req, res) => {
    try {
        // Assegurar que o usuário só pode ver seus próprios veículos, a menos que seja admin
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado a acessar veículos de outro usuário.' });
        }
        const vehicles = await Vehicle.find({ userId: req.params.userId });
        res.json(vehicles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao buscar veículos do usuário.' });
    }
};


// @desc    Atualizar veículo
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
    const { plate, brand, model, type, color } = req.body;

    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (vehicle) {
            // Verificar se o veículo pertence ao usuário logado (ou se o usuário é admin)
            if (vehicle.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Não autorizado a atualizar este veículo.' });
            }

            // Verificar se a nova placa já existe para outro veículo do mesmo usuário
            if (plate && plate.toUpperCase() !== vehicle.plate) {
                const plateExists = await Vehicle.findOne({ userId: vehicle.userId, plate: plate.toUpperCase() });
                if (plateExists && plateExists._id.toString() !== vehicle._id.toString()) {
                    return res.status(400).json({ message: 'Esta placa já está cadastrada para outro veículo seu.' });
                }
            }

            vehicle.plate = plate ? plate.toUpperCase() : vehicle.plate;
            vehicle.brand = brand || vehicle.brand;
            vehicle.model = model || vehicle.model;
            vehicle.type = type || vehicle.type;
            vehicle.color = color || vehicle.color;

            const updatedVehicle = await vehicle.save();
            res.json({ message: 'Veículo atualizado com sucesso!', vehicle: updatedVehicle });
        } else {
            res.status(404).json({ message: 'Veículo não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar veículo.' });
    }
};

// @desc    Deletar veículo
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (vehicle) {
            // Verificar se o veículo pertence ao usuário logado (ou se o usuário é admin)
            if (vehicle.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Não autorizado a deletar este veículo.' });
            }

            // Opcional: antes de deletar o veículo, você pode querer verificar se há agendamentos futuros
            // associados a ele e talvez impedi-lo ou cancelar os agendamentos.
            // Por enquanto, vamos apenas deletar o veículo.
            await Vehicle.deleteOne({ _id: req.params.id });
            res.json({ message: 'Veículo removido com sucesso.' });
        } else {
            res.status(404).json({ message: 'Veículo não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao deletar veículo.' });
    }
};

module.exports = {
    createVehicle,
    getVehicles,
    getVehiclesByUserId,
    updateVehicle,
    deleteVehicle,
};