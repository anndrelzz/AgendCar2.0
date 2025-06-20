const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Referência ao modelo User
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId, // MUDAR DE NUMBER PARA OBJECTID!
            required: true,
            ref: 'Service', // ADICIONAR ESTA REFERÊNCIA
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Vehicle', // Referência ao modelo Vehicle
        },
        date: {
            type: String, // 'YYYY-MM-DD'
            required: true,
        },
        time: {
            type: String, // 'HH:MM'
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
            default: 'scheduled',
        },
    },
    {
        timestamps: true,
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;