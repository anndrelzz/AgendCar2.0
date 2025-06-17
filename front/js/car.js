 document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('carForm');
            const placaInput = document.getElementById('placa');

        placaInput.addEventListener('blur', () => {
            const value = placaInput.value;
            const placaAntiga = /^[A-Z]{3}[0-9]{4}$/;
            const placaMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

            if (!placaAntiga.test(value) && !placaMercosul.test(value)) {
            alert('Placa inválida! Use o formato ABC1234 (Modelo Antigo) ou ABC1D23 (Mercosul).');
            }
        });

            // Formata a placa enquanto o usuário digita
            //placaInput.addEventListener('input', (e) => {
                //let value = e.target.value.toUpperCase();
                //value = value.replace(/[^A-Z0-9]/g, ''); // Remove caracteres especiais
                //e.target.value = value;
            //});

            // Validação e envio do formulário
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const formData = {
                    placa: placaInput.value,
                    tipo: document.getElementById('tipo').value,
                    marca: document.getElementById('marca').value,
                    modelo: document.getElementById('modelo').value,
                    cor: document.getElementById('cor').value
                };

                // Aqui você pode adicionar a lógica para enviar os dados para seu backend
                console.log('Dados do veículo:', formData);

                // Simula o salvamento e redireciona para a página de serviços
                alert('Veículo cadastrado com sucesso!');
                window.location.href = 'service.html';
            });

            // Validação em tempo real da placa
            placaInput.addEventListener('input', () => {
                const isValid = placaInput.checkValidity();
                if (isValid) {
                    placaInput.style.borderColor = '#4ade80';
                } else {
                    placaInput.style.borderColor = '#dc2626';
                }
            });
        });