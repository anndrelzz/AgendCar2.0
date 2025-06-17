// register.js

// --- Funções de Loading (reutilizadas de outras páginas) ---
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('d-none');
        overlay.classList.add('active'); // Garante que a classe 'active' também seja adicionada
        document.body.style.overflow = 'hidden'; // Impede o scroll durante o carregamento
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('d-none');
        loadingOverlay.classList.remove('active'); // Remove a classe 'active' também
        document.body.style.overflow = ''; // Restaura o scroll
    }
}

// --- Funções de Toast (para mensagens de feedback) ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: '10000',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)'; // Mostra o toast
    }, 100);

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)'; // Esconde o toast
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000); // Remove depois de 3 segundos
}


// --- Lógica Principal da Página (executada após o DOM carregar) ---
document.addEventListener('DOMContentLoaded', function() {
    hideLoading(); // Esconde o loading assim que o DOM desta página estiver completamente carregado

    // --- Elementos HTML ---
    var btnsignin = document.querySelector("#signin");
    var btnsignup = document.querySelector("#signup");
    var body = document.querySelector("body");
    var adminLoginLink = document.getElementById("adminLoginLink"); // Link para adm login

    // Formulários e campos de input
    const registerForm = document.getElementById('registerForm');
    const registerNameInput = document.getElementById('registerName');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerErrorMessageDiv = document.getElementById('registerErrorMessage');

    const loginForm = document.getElementById('loginForm');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginErrorMessageDiv = document.getElementById('loginErrorMessage');

    // --- Gerenciamento de Usuários (localStorage) ---
    // Carrega usuários existentes ou inicia uma array vazia
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    function saveUsersToLocalStorage() {
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    // --- Funções de Registro e Login ---

    // Função de Registro de Cliente
    function handleRegisterSubmit(event) { // Renomeado para evitar conflito com 'registerUser'
        event.preventDefault(); // Impede o envio padrão do formulário

        const name = registerNameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value.trim();

        registerErrorMessageDiv.classList.add('d-none'); // Esconde mensagens anteriores

        if (!name || !email || !password) {
            registerErrorMessageDiv.textContent = 'Por favor, preencha todos os campos.';
            registerErrorMessageDiv.classList.remove('d-none');
            registerErrorMessageDiv.classList.remove('success-message');
            registerErrorMessageDiv.classList.add('error-message');
            return;
        }

        if (password.length < 6) { // Exemplo de validação de senha
            registerErrorMessageDiv.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            registerErrorMessageDiv.classList.remove('d-none');
            registerErrorMessageDiv.classList.remove('success-message');
            registerErrorMessageDiv.classList.add('error-message');
            return;
        }

        // Verifica se o email já existe
        const userExists = registeredUsers.some(user => user.email === email);
        if (userExists) {
            registerErrorMessageDiv.textContent = 'Este e-mail já está cadastrado.';
            registerErrorMessageDiv.classList.remove('d-none');
            registerErrorMessageDiv.classList.remove('success-message');
            registerErrorMessageDiv.classList.add('error-message');
            return;
        }

        // Simular hash de senha (em um ambiente real, faria isso no backend)
        const hashedPassword = password; // Em um cenário real, usaria bcrypt.hash(password)

        const newUser = {
            id: Date.now(), // ID simples para localStorage, Supabase usaria UUID
            name: name,
            email: email,
            password: hashedPassword, // Armazenando em texto puro para teste frontend. MUDAR PARA HASH COM BACKEND!
            phone: '', // Pode adicionar um campo de telefone no registro
            role: 'client' 
        };

        registeredUsers.push(newUser);
        saveUsersToLocalStorage(); // Salva o novo usuário

        // Mensagem de sucesso
        registerErrorMessageDiv.textContent = 'Cadastro realizado com sucesso! Faça seu login agora.';
        registerErrorMessageDiv.classList.remove('d-none');
        registerErrorMessageDiv.classList.remove('error-message');
        registerErrorMessageDiv.classList.add('success-message');
        
        // Limpa os campos após o registro bem-sucedido
        registerNameInput.value = '';
        registerEmailInput.value = '';
        registerPasswordInput.value = '';

        // Opcional: Redirecionar para a aba de login após o registro
        body.className = "sign-in-js"; // Muda para a tela de login
        showToast('Cadastro realizado com sucesso!', 'success');
    }

    // Função de Login de Cliente
    function handleLoginSubmit(event) { // Renomeado para evitar conflito com 'loginUser'
        event.preventDefault(); // Impede o envio padrão do formulário

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        loginErrorMessageDiv.classList.add('d-none'); // Esconde mensagens anteriores

        if (!email || !password) {
            loginErrorMessageDiv.textContent = 'Por favor, insira seu e-mail e senha.';
            loginErrorMessageDiv.classList.remove('d-none');
            loginErrorMessageDiv.classList.remove('success-message');
            loginErrorMessageDiv.classList.add('error-message');
            return;
        }

        const foundUser = registeredUsers.find(user => user.email === email && user.password === password); // Em um ambiente real, usaria bcrypt.compare()

        if (foundUser) {
            // Login bem-sucedido: Salva as informações do usuário logado no localStorage
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userName', foundUser.name);
            localStorage.setItem('userEmail', foundUser.email);
            localStorage.setItem('userPhone', foundUser.phone || ''); // Telefone é opcional
            localStorage.setItem('currentUser', JSON.stringify(foundUser)); // Salva o objeto completo

            loginErrorMessageDiv.textContent = 'Login bem-sucedido! Redirecionando...';
            loginErrorMessageDiv.classList.remove('d-none');
            loginErrorMessageDiv.classList.remove('error-message');
            loginErrorMessageDiv.classList.add('success-message');

            showLoading(); // MOSTRA O LOADING
            setTimeout(() => {
                // Redireciona para a página de serviços (dashboard do cliente)
                window.location.href = "service.html"; 
            }, 1500); // Atraso para ver o loading

        } else {
            loginErrorMessageDiv.textContent = 'E-mail ou senha inválidos.';
            loginErrorMessageDiv.classList.remove('d-none');
            loginErrorMessageDiv.classList.remove('success-message');
            loginErrorMessageDiv.classList.add('error-message');
        }
    }

    // --- Associa os Event Listeners aos Formulários e Botões ---
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

    // Eventos para a transição entre painéis de Login/Registro
    btnsignin.addEventListener("click", function () {
        body.className = "sign-in-js"; // Mostra o painel de Login
        registerErrorMessageDiv.classList.add('d-none'); // Limpa msg do outro form
        loginErrorMessageDiv.classList.add('d-none'); // Limpa msg do próprio form
        loginForm.reset(); // Reseta form de login
    });

    btnsignup.addEventListener("click", function () {
        body.className = "sign-up-js" // Mostra o painel de Registro
        loginErrorMessageDiv.classList.add('d-none'); // Limpa msg do outro form
        registerErrorMessageDiv.classList.add('d-none'); // Limpa msg do próprio form
        registerForm.reset(); // Reseta form de registro
    });

    // Evento para o link "Acesso Administrativo"
    if (adminLoginLink) {
        adminLoginLink.addEventListener("click", function(event) {
            event.preventDefault(); // Evita o comportamento padrão do link
            showLoading(); // MOSTRA O LOADING
            setTimeout(() => {
                window.location.href = "admlogin.html"; // Redireciona para admlogin.html
            }, 1500); // Atraso para ver o loading
        });
    }
});