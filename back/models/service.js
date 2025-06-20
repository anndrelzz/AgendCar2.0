const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // Nomes de serviço devem ser únicos
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        duration: { // Duração em minutos
            type: Number,
            required: true,
            min: 1,
        },
        // icon: { // ESTA LINHA FOI REMOVIDA
        //     type: String,
        //     default: 'fas fa-question-circle'
        // }
    },
    {
        timestamps: true,
    }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;