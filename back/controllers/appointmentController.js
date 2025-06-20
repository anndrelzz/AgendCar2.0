const Appointment = require('../models/appointment');
const Service = require('../models/service');
const User = require('../models/user');
const Vehicle = require('../models/vehicle');


// @desc    Criar um novo agendamento
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
    const { serviceId, vehicleId, date, time, value } = req.body;
    const clientId = req.user._id; // O ID do cliente logado

    if (!serviceId || !vehicleId || !date || !time || !value) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios para o agendamento.' });
    }

    try {
        // Verificar se o veículo realmente pertence ao cliente que está agendando
        const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: clientId });
        if (!vehicle) {
            return res.status(403).json({ message: 'Veículo não encontrado ou não pertence a este usuário.' });
        }

        // Verificar se o slot de tempo já está ocupado
        const existingAppointment = await Appointment.findOne({ date, time });
        if (existingAppointment) {
            return res.status(400).json({ message: 'Este horário já está ocupado. Por favor, escolha outro.' });
        }

        const appointment = await Appointment.create({
            clientId,
            serviceId,
            vehicleId,
            date,
            time,
            value,
            status: 'scheduled', // Status inicial
        });

        // Popula o agendamento com as informações do veículo e do cliente para retorno
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('clientId', 'name email phone')
            .populate('vehicleId'); // Popula o objeto do veículo

        // Adapta o objeto para o formato esperado pelo frontend (se necessário)
        const frontendAppointment = {
            ...populatedAppointment.toObject(),
            vehicle: populatedAppointment.vehicleId, // Renomeia vehicleId para vehicle para o frontend
            client: populatedAppointment.clientId // Renomeia clientId para client
        };
        delete frontendAppointment.vehicleId;
        delete frontendAppointment.clientId;


        res.status(201).json({ message: 'Agendamento realizado com sucesso!', appointment: frontendAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao criar agendamento.' });
    }
};

// @desc    Obter todos os agendamentos (admin) ou agendamentos do usuário logado (cliente)
// @route   GET /api/appointments
// @route   GET /api/appointments/user/:userId
// @access  Private
const getAppointments = async (req, res) => {
    try {
        let appointments;
        if (req.user.role === 'admin') {
            appointments = await Appointment.find({})
                .populate('clientId', 'name email phone') // Popula com info do cliente
                .populate('vehicleId'); // Popula com info do veículo
        } else {
            appointments = await Appointment.find({ clientId: req.user._id })
                .populate('clientId', 'name email phone')
                .populate('vehicleId');
        }

        // Mapeia para o formato do frontend, se necessário
        const formattedAppointments = appointments.map(app => ({
            ...app.toObject(),
            vehicle: app.vehicleId, // Renomeia vehicleId para vehicle
            client: app.clientId // Renomeia clientId para client
        }));

        res.json(formattedAppointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao buscar agendamentos.' });
    }
};

// @desc    Obter agendamentos por ID do usuário
// @route   GET /api/appointments/user/:userId
// @access  Private (usuário só pode ver os seus)
const getAppointmentsByUserId = async (req, res) => {
    try {
        // Assegurar que o usuário só pode ver seus próprios agendamentos, a menos que seja admin
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Não autorizado a acessar agendamentos de outro usuário.' });
        }
        
        const appointments = await Appointment.find({ clientId: req.params.userId })
            .populate('clientId', 'name email phone')
            .populate('vehicleId');
        
        const formattedAppointments = appointments.map(app => ({
            ...app.toObject(),
            vehicle: app.vehicleId,
            client: app.clientId
        }));

        res.json(formattedAppointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao buscar agendamentos do usuário.' });
    }
};


// @desc    Atualizar agendamento
// @route   PUT /api/appointments/:id
// @access  Private (admin ou o próprio cliente)
const updateAppointment = async (req, res) => {
    const { serviceId, vehicleId, date, time, value, status } = req.body;

    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            // Verificar se o agendamento pertence ao usuário logado (ou se é admin)
            if (appointment.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Não autorizado a atualizar este agendamento.' });
            }

            // Se o cliente tentar mudar o status para algo diferente de 'cancelled'
            if (req.user.role === 'client' && status && status !== 'cancelled' && status !== appointment.status) {
                return res.status(403).json({ message: 'Clientes só podem cancelar seus próprios agendamentos.' });
            }

            // Verificar disponibilidade se a data/hora mudar
            if ((date && date !== appointment.date) || (time && time !== appointment.time)) {
                const existingAppointment = await Appointment.findOne({ date: date || appointment.date, time: time || appointment.time });
                if (existingAppointment && existingAppointment._id.toString() !== appointment._id.toString()) {
                    return res.status(400).json({ message: 'Este horário já está ocupado. Por favor, escolha outro.' });
                }
            }

            // Atualizar campos
            appointment.serviceId = serviceId || appointment.serviceId;
            appointment.vehicleId = vehicleId || appointment.vehicleId;
            appointment.date = date || appointment.date;
            appointment.time = time || appointment.time;
            appointment.value = value || appointment.value;
            appointment.status = status || appointment.status; // Admin pode mudar o status livremente

            const updatedAppointment = await appointment.save();

             const populatedUpdatedAppointment = await Appointment.findById(updatedAppointment._id)
                .populate('clientId', 'name email phone')
                .populate('vehicleId');

            const frontendUpdatedAppointment = {
                ...populatedUpdatedAppointment.toObject(),
                vehicle: populatedUpdatedAppointment.vehicleId,
                client: populatedUpdatedAppointment.clientId
            };
            delete frontendUpdatedAppointment.vehicleId;
            delete frontendUpdatedAppointment.clientId;

            res.json({ message: 'Agendamento atualizado com sucesso!', appointment: frontendUpdatedAppointment });
        } else {
            res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar agendamento.' });
    }
};

// @desc    Deletar agendamento
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            // Apenas admin pode deletar (clientes só podem 'cancelar' status)
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Não autorizado a deletar agendamentos. Clientes só podem cancelar.' });
            }
            await Appointment.deleteOne({ _id: req.params.id });
            res.json({ message: 'Agendamento removido com sucesso.' });
        } else {
            res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao deletar agendamento.' });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentsByUserId,
    updateAppointment,
    deleteAppointment,
};