const bcrypt = require('bcryptjs');

async function generatePasswordHash(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(hash);
}

// Altere 'sua_senha_admin' para a senha que você quer usar para o admin
generatePasswordHash('3633282120andre');