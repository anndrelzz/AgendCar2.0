// register.js

// --- Funções de Loading e Toast (manter as existentes) ---
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('d-none');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('d-none');
        loadingOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

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
        toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}


document.addEventListener('DOMContentLoaded', function() {
    hideLoading();

    var btnsignin = document.querySelector("#signin");
    var btnsignup = document.querySelector("#signup");
    var body = document.querySelector("body");
    var adminLoginLink = document.getElementById("adminLoginLink");

    const registerForm = document.getElementById('registerForm');
    const registerNameInput = document.getElementById('registerName');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerErrorMessageDiv = document.getElementById('registerErrorMessage');

    const loginForm = document.getElementById('loginForm');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginErrorMessageDiv = document.getElementById('loginErrorMessage');

    // --- FUNÇÕES DE REGISTRO E LOGIN (AGORA COM BACKEND) ---

    // Função de Registro de Cliente
    async function handleRegisterSubmit(event) {
        event.preventDefault();

        const name = registerNameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value.trim();

        registerErrorMessageDiv.classList.add('d-none');

        if (!name || !email || !password) {
            registerErrorMessageDiv.textContent = 'Por favor, preencha todos os campos.';
            registerErrorMessageDiv.classList.remove('d-none');
            registerErrorMessageDiv.classList.remove('success-message');
            registerErrorMessageDiv.classList.add('error-message');
            return;
        }

        if (password.length < 6) {
            registerErrorMessageDiv.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            registerErrorMessageDiv.classList.remove('d-none');
            registerErrorMessageDiv.classList.remove('success-message');
            registerErrorMessageDiv.classList.add('error-message');
            return;
        }

        showLoading();

        try {
            const response = await fetch('https://agendcar20-production.up.railway.app//api/auth/register', { // URL DO BACKEND
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            hideLoading();

            if (response.ok) {
                showToast('Cadastro realizado com sucesso! Faça seu login agora.', 'success');
                registerErrorMessageDiv.classList.add('d-none');
                registerForm.reset();
                body.className = "sign-in-js"; // Redireciona visualmente para a tela de login
            } else {
                registerErrorMessageDiv.textContent = data.message || 'Erro ao registrar usuário.';
                registerErrorMessageDiv.classList.remove('d-none');
                registerErrorMessageDiv.classList.remove('success-message');
                registerErrorMessageDiv.classList.add('error-message');
                showToast(data.message || 'Erro ao registrar.', 'error');
            }
        } catch (error) {
            hideLoading();
            console.error('Erro de rede ou servidor:', error);
            registerErrorMessageDiv.textContent = 'Erro de conexão. Tente novamente mais tarde.';
            registerErrorMessageDiv.classList.remove('d-none');
            registerErrorMessageDiv.classList.remove('success-message');
            registerErrorMessageDiv.classList.add('error-message');
            showToast('Erro de conexão.', 'error');
        }
    }

    // Função de Login de Cliente
    async function handleLoginSubmit(event) {
        event.preventDefault();

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        loginErrorMessageDiv.classList.add('d-none');

        if (!email || !password) {
            loginErrorMessageDiv.textContent = 'Por favor, insira seu e-mail e senha.';
            loginErrorMessageDiv.classList.remove('d-none');
            loginErrorMessageDiv.classList.remove('success-message');
            loginErrorMessageDiv.classList.add('error-message');
            return;
        }

        showLoading();

        try {
            const response = await fetch('https://agendcar20-production.up.railway.app//api/auth/login', { // URL DO BACKEND
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            hideLoading();

            if (response.ok) {
                // Login bem-sucedido: Salva as informações do usuário logado e o token no localStorage
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userToken', data.token); // Salva o JWT
                localStorage.setItem('userName', data.name);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userPhone', data.phone || '');
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data._id, // Usar _id do MongoDB
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    role: data.role
                }));

                showToast('Login bem-sucedido! Redirecionando...', 'success');
                loginErrorMessageDiv.classList.add('d-none');

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);

            } else {
                loginErrorMessageDiv.textContent = data.message || 'E-mail ou senha inválidos.';
                loginErrorMessageDiv.classList.remove('d-none');
                loginErrorMessageDiv.classList.remove('success-message');
                loginErrorMessageDiv.classList.add('error-message');
                showToast(data.message || 'Erro no login.', 'error');
            }
        } catch (error) {
            hideLoading();
            console.error('Erro de rede ou servidor:', error);
            loginErrorMessageDiv.textContent = 'Erro de conexão. Tente novamente mais tarde.';
            loginErrorMessageDiv.classList.remove('d-none');
            loginErrorMessageDiv.classList.remove('success-message');
            loginErrorMessageDiv.classList.add('error-message');
            showToast('Erro de conexão.', 'error');
        }
    }

    // --- EVENT LISTENERS ---
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

    btnsignin.addEventListener("click", function () {
        body.className = "sign-in-js";
        registerErrorMessageDiv.classList.add('d-none');
        loginErrorMessageDiv.classList.add('d-none');
        loginForm.reset();
    });

    btnsignup.addEventListener("click", function () {
        body.className = "sign-up-js"
        loginErrorMessageDiv.classList.add('d-none');
        registerErrorMessageDiv.classList.add('d-none');
        registerForm.reset();
    });

    if (adminLoginLink) {
        adminLoginLink.addEventListener("click", function(event) {
            event.preventDefault();
            showLoading();
            setTimeout(() => {
                window.location.href = "admlogin.html";
            }, 1500);
        });
    }
});