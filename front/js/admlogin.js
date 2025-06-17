 function showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('d-none');
            document.body.style.overflow = 'hidden'; // Impede o scroll durante o carregamento
        }
    }

    // Função para esconder o overlay de loading
    function hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('d-none');
            document.body.style.overflow = ''; // Restaura o scroll
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Esconde o loading assim que o DOM desta página estiver completamente carregado
        hideLoading(); 

        const loginForm = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('errorMessage');
        const clientLoginLink = document.getElementById('clientLoginLink'); // Pega o link para clientes

        // Credenciais de teste simples
        const validEmail = 'admin@agendcar.com';
        const validPassword = '123'; // Senha simples para fins de demonstração

        // Evento para o formulário de login
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const email = emailInput.value;
            const password = passwordInput.value;

            // Simula a validação de credenciais
            if (email === validEmail && password === validPassword) {
                errorMessage.classList.add('d-none'); // Esconde mensagem de erro, se visível
                showLoading(); // MOSTRA O LOADING
                setTimeout(() => {
                    window.location.href = 'admin.html'; // Redireciona para admin.html
                }, 1500); // Pequeno atraso para o loading aparecer
            } else {
                errorMessage.classList.remove('d-none'); // Mostra mensagem de erro
                console.log('Tentativa de login falhou: Email ou senha incorretos.');
            }
        });

        // Evento para o link de login/cadastro de clientes
        if (clientLoginLink) {
            clientLoginLink.addEventListener('click', function(event) {
                event.preventDefault(); // Impede o comportamento padrão do link
                showLoading(); // MOSTRA O LOADING
                setTimeout(() => {
                    window.location.href = 'register.html'; // Redireciona para register.html
                }, 1550); // Pequeno atraso para o loading aparecer
            });
        }
    });