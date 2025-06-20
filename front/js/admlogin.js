// admlogin.js

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

document.addEventListener('DOMContentLoaded', function() {
    hideLoading();

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const clientLoginLink = document.getElementById('clientLoginLink');

    // --- FUNÇÃO DE LOGIN DE ADMINISTRADOR (AGORA COM BACKEND REAL) ---
    loginForm.addEventListener('submit', async function(event) { // Adicione 'async' aqui
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        errorMessage.classList.add('d-none'); // Esconde mensagens anteriores

        if (!email || !password) {
            errorMessage.textContent = 'Por favor, insira seu e-mail e senha.';
            errorMessage.classList.remove('d-none');
            return;
        }

        showLoading(); // MOSTRA O LOADING

        try {
            const response = await fetch('agendcar20-production.up.railway.app/api/auth/login', { // URL DO BACKEND
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            hideLoading(); // ESCONDE O LOADING

            if (response.ok) {
                // Login bem-sucedido
                if (data.role === 'admin') {
                    // Salva o token e dados do admin no localStorage
                    localStorage.setItem('adminLoggedIn', 'true'); // Flag simples para indicar admin logado
                    localStorage.setItem('adminToken', data.token); // O JWT real do admin
                    localStorage.setItem('adminName', data.name);
                    localStorage.setItem('adminEmail', data.email);
                    localStorage.setItem('adminId', data._id); // Salva o _id do admin

                    showToast('Login de administrador bem-sucedido! Redirecionando...', 'success');
                    setTimeout(() => {
                        window.location.href = 'admin.html'; // Redireciona para admin.html
                    }, 1500);
                } else {
                    // Usuário logado, mas não é admin
                    errorMessage.classList.remove('d-none');
                    errorMessage.textContent = 'Acesso negado: você não tem privilégios de administrador.';
                    showToast('Acesso negado: não é administrador.', 'error');
                }
            } else {
                // Erro de login retornado pelo backend (email ou senha inválidos)
                errorMessage.classList.remove('d-none');
                errorMessage.textContent = data.message || 'Email ou senha incorretos.';
                showToast(data.message || 'Erro no login.', 'error');
            }
        } catch (error) {
            // Erro de rede ou servidor
            hideLoading();
            console.error('Erro de rede ou servidor:', error);
            errorMessage.classList.remove('d-none');
            errorMessage.textContent = 'Erro de conexão com o servidor. Tente novamente mais tarde.';
            showToast('Erro de conexão.', 'error');
        }
    });

    // --- EVENT LISTENER PARA O LINK DE CLIENTE ---
    if (clientLoginLink) {
        clientLoginLink.addEventListener('click', function(event) {
            event.preventDefault();
            showLoading();
            setTimeout(() => {
                window.location.href = 'register.html';
            }, 1550);
        });
    }
});