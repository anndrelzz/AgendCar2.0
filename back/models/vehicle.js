const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema(
    {
        userId: { // Referência ao ID do usuário (cliente)
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        plate: {
            type: String,
            required: true,
            unique: true, // A placa deve ser única no sistema
        },
        brand: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        type: { // Hatch, Sedan, SUV, etc.
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;