// service.js

let currentService = null;
let currentStep = 1;
let selectedTimeSlot = null;
// As variáveis globais 'vehicles' e 'appointments' agora serão preenchidas do backend
let vehicles = [];
let appointments = [];

// Carrega o status de login e as informações do usuário
let isUserLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
let userName = localStorage.getItem('userName') || 'Convidado';
let userEmail = localStorage.getItem('userEmail') || '';
let userPhone = localStorage.getItem('userPhone') || '';
let currentUserToken = localStorage.getItem('userToken') || null; // NOVO: Obter o token
let currentUserId = JSON.parse(localStorage.getItem('currentUser'))?.id || null; // _id do MongoDB

// Brazilian car brands (manter localmente, é estático)
const brazilianCarBrands = [
    'Chevrolet', 'Volkswagen', 'Ford', 'Fiat', 'Toyota', 'Honda', 'Hyundai',
    'Nissan', 'Renault', 'Peugeot', 'Citroën', 'Jeep', 'Kia', 'Mitsubishi',
    'Suzuki', 'Subaru', 'Chery', 'JAC', 'Lifan', 'Caoa Chery', 'BMW',
    'Mercedes-Benz', 'Audi', 'Land Rover', 'Volvo', 'Porsche', 'Outros'
];

// Services data - AGORA VAI CARREGAR DO BACKEND (no init)
// Remova a inicialização com dados fixos aqui. A função loadServicesFromBackend() vai preencherá.
let services = [];

// Time slots (manter localmente, é estático)
const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// --- FUNÇÕES DE UTILIIDADE ---
function validateBrazilianPlate(plate) {
    if (!plate) return false;

    // Garante que a placa está limpa de espaços e em maiúsculas para validação
    plate = plate.replace(/\s/g, '').toUpperCase(); 

    const oldPlateRegex = /^[A-Z]{3}[0-9]{4}$/; // Padrão antigo (ABC1234)
    const mercosulPlateRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/; // Padrão Mercosul (ABC1D23)

    // Testa se a placa corresponde ao padrão antigo OU ao padrão Mercosul
    return oldPlateRegex.test(plate) || mercosulPlateRegex.test(plate);
}

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

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// --- FUNÇÕES DE AUTENTICAÇÃO E PERFIL ---
function checkUserLogin() {
    return localStorage.getItem('userLoggedIn') === 'true' && localStorage.getItem('userToken');
}

function redirectToLogin() {
    showLoading();
    setTimeout(() => {
        window.location.href = `register.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1500);
}

document.addEventListener('DOMContentLoaded', async function() {
    hideLoading();
    await loadInitialData(); // NOVO: Carregar dados iniciais do backend
    setupEventListeners();
    populateVehicleSelect();
    populateBrandSelect();
    setMinDate();
    updateProfileButton();
});

async function loadInitialData() {
    await loadServicesFromBackend(); // Carrega serviços do backend
    await loadUserData(); // Carrega dados do usuário, veículos e agendamentos
    renderServices(); // Renderiza os serviços APÓS carregá-los
}

// NOVO: Função para carregar serviços do backend
async function loadServicesFromBackend() {
    try {
        const response = await fetch('http://localhost:5000/api/services');
        const data = await response.json();
        if (response.ok) {
            services = data; // Preenche a variável global 'services'
        } else {
            showToast(data.message || 'Erro ao carregar serviços.', 'error');
            console.error('Erro ao carregar serviços:', data.message);
        }
    } catch (error) {
        showToast('Erro de conexão ao carregar serviços.', 'error');
        console.error('Erro de conexão ao carregar serviços:', error);
    }
}

function closeBookingModal() {
    const bookingModal = document.getElementById('bookingModal');
    bookingModal?.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

function closeProfileEditModal() { // Esta função já está mais acima
    document.getElementById('profileEditModal')?.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// MOVA A FUNÇÃO closeHistory() PARA CÁ (ou perto de closeProfileEditModal)
function closeHistory() {
    console.log('closeHistory chamada!'); // LINHA DE DEBUG
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.remove('active'); // Remove a classe 'active' para esconder o modal
        document.body.style.overflow = 'auto'; // Restaura o scroll do body
    }
}

function setupEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const profileBtn = document.getElementById('profileBtn');
    console.log('Botão Perfil encontrado:', profileBtn); // LINHA ADICIONADA PARA DEBUG
    const closeSidebar = document.getElementById('closeSidebar');
    const closeModal = document.getElementById('closeModal');
    const bookingForm = document.getElementById('bookingForm');

    hamburger?.addEventListener('click', toggleMobileMenu);
    profileBtn?.addEventListener('click', toggleSidebar);
    closeSidebar?.addEventListener('click', toggleSidebar);
    closeModal?.addEventListener('click', closeBookingModal);
    bookingForm?.addEventListener('submit', handleBookingSubmit);

    document.getElementById('bookingDate')?.addEventListener('change', generateTimeSlots);

    document.getElementById('closeProfileEditModal')?.addEventListener('click', closeProfileEditModal);
    document.getElementById('profileEditForm')?.addEventListener('submit', saveProfile);
    document.getElementById('editProfileBtn')?.addEventListener('click', openProfileEditModal);

    document.getElementById('bookingModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'bookingModal') closeBookingModal();
    });

    document.getElementById('sidebar')?.addEventListener('click', (e) => {
        if (e.target.id === 'sidebar') toggleSidebar();
    });

    document.getElementById('profileEditModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'profileEditModal') closeProfileEditModal();
    });

    // NOVO: Listener para o botão de fechar o histórico (botão 'X' no modal)
    document.getElementById('historyModal')?.querySelector('.modal-close')?.addEventListener('click', closeHistory);

    // NOVO: Listener para fechar o histórico clicando fora do modal
    document.getElementById('historyModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'historyModal') closeHistory();
    });
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu?.classList.toggle('active');
}

function toggleSidebar() {
    console.log('toggleSidebar chamada!'); // LINHA ADICIONADA PARA DEBUG
    const sidebar = document.getElementById('sidebar');
    console.log('Sidebar encontrada:', sidebar); // LINHA ADICIONADA PARA DEBUG
    sidebar?.classList.toggle('active');
}

function updateProfileButton() {
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        if (isUserLoggedIn) {
            profileBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${userName}`;
        } else {
            profileBtn.innerHTML = `<i class="fas fa-user"></i> Perfil`;
        }
    }
}

// FUNÇÃO ATUALIZADA: openProfileEditModal
async function openProfileEditModal() {
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    // Tenta buscar os dados mais recentes do usuário logado do backend
    showLoading();
    try {
        const response = await fetch(`http://localhost:5000/api/users/${currentUserId}`, {
            headers: {
                'Authorization': `Bearer ${currentUserToken}`
            }
        });
        const currentUserData = await response.json();
        hideLoading();

        if (response.ok) {
            document.getElementById('profileUserId').value = currentUserData._id;
            document.getElementById('editProfileName').value = currentUserData.name;
            document.getElementById('editProfileEmail').value = currentUserData.email;
            document.getElementById('editProfilePhone').value = currentUserData.phone;
            
            document.getElementById('profileEditModal')?.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            showToast(currentUserData.message || 'Erro ao carregar dados do perfil.', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Erro de conexão ao carregar perfil.', 'error');
        console.error('Erro ao buscar perfil:', error);
    }
}

function closeProfileEditModal() {
    document.getElementById('profileEditModal')?.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// FUNÇÃO ATUALIZADA: saveProfile
async function saveProfile(e) {
    e.preventDefault();

    if (!checkUserLogin() || !currentUserId) {
        redirectToLogin();
        return;
    }

    const userId = document.getElementById('profileUserId').value;
    const newName = document.getElementById('editProfileName').value.trim();
    const newEmail = document.getElementById('editProfileEmail').value.trim();
    const newPhone = document.getElementById('editProfilePhone').value.trim();

    if (!newName || !newEmail) {
        showToast('Nome e Email são obrigatórios.', 'error');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUserToken}`
            },
            body: JSON.stringify({ name: newName, email: newEmail, phone: newPhone }),
        });

        const data = await response.json();
        hideLoading();

        if (response.ok) {
            // Atualizar localStorage com os novos dados do perfil
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userPhone', data.phone || '');
            localStorage.setItem('currentUser', JSON.stringify({
                id: data._id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: data.role
            }));

            userName = data.name;
            userEmail = data.email;
            userPhone = data.phone;
            
            showToast('Perfil atualizado com sucesso!', 'success');
            loadUserData(); // Recarregar dados na sidebar
            updateProfileButton(); // Atualizar botão de perfil na navbar
            closeProfileEditModal();
        } else {
            showToast(data.message || 'Erro ao atualizar perfil.', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Erro de rede ou servidor:', error);
        showToast('Erro de conexão. Tente novamente mais tarde.', 'error');
    }
}

// FUNÇÃO ATUALIZADA: renderServices (remover ícone)
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card">
            <h3>${service.name}</h3>
            <p class="description">${service.description}</p>
            <div class="service-details">
                <span class="price">R$ ${service.price.toFixed(2)}</span>
                <span class="duration">${service.duration} min</span>
            </div>
            <button class="book-btn" onclick="openBookingModal('${service._id}')">
                <i class="fas fa-calendar-plus"></i>
                Agendar
            </button>
        </div>
    `).join('');
}

// FUNÇÃO ATUALIZADA: openBookingModal (passar _id do serviço)
function openBookingModal(serviceId) { // serviceId agora é _id
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    currentService = services.find(s => s._id === serviceId); // Buscar por _id
    if (!currentService) {
        showToast('Serviço não encontrado.', 'error');
        return;
    }

    const bookingModal = document.getElementById('bookingModal');
    bookingModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetForm();
    nextStep(1);
}

function closeBookingModal() {
    const bookingModal = document.getElementById('bookingModal');
    bookingModal?.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

function resetForm() {
    currentStep = 1;
    selectedTimeSlot = null;

    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.toggle('active', index === 0);
    });

    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.reset();
    }

    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.style.display = 'none';
        document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
            input.value = '';
        });
        document.getElementById('vehicleIdToEdit').value = '';
    }

    populateVehicleSelect();
}

function nextStep(step) {
    if (step > currentStep) {
        if (currentStep === 1 && !validateStep(1)) return;
        if (currentStep === 2 && !validateStep(2)) return;
    }

    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`)?.classList.add('active');

    currentStep = step;

    if (step === 3) {
        updateSummary();
    }
}

function validateStep(step) {
    switch(step) {
        case 1:
            const vehicleSelect = document.getElementById('vehicleSelect');
            const vehicleForm = document.getElementById('vehicleForm');
            const isVehicleFormVisible = vehicleForm?.style.display === 'block';

            if (vehicleSelect.value === "" && !isVehicleFormVisible) {
                showToast('Por favor, selecione um veículo existente ou cadastre um novo.', 'error');
                return false;
            }

            if (isVehicleFormVisible) {
                const plate = document.getElementById('vehiclePlate')?.value?.trim();
                const brand = document.getElementById('vehicleBrand')?.value;
                const model = document.getElementById('vehicleModel')?.value?.trim();
                const type = document.getElementById('vehicleType')?.value;
                const color = document.getElementById('vehicleColor')?.value?.trim();

                if (!plate || !brand || !model || !type || !color) {
                    showToast('Por favor, preencha todos os campos do veículo.', 'error');
                    return false;
                }
                if (!validateBrazilianPlate(plate)) {
                    showToast('Por favor, insira uma placa brasileira válida (formato ABC1234 ou ABC1D23).', 'error');
                    return false;
                }
            }
            return true;

        case 2:
            const date = document.getElementById('bookingDate')?.value;
            if (!date || !selectedTimeSlot) {
                showToast('Por favor, selecione uma data e horário para o agendamento.', 'error');
                return false;
            }
            break;
    }
    return true;
}

function showVehicleForm() {
    const vehicleForm = document.getElementById('vehicleForm');
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (vehicleForm) {
        const isVisible = vehicleForm.style.display === 'block';
        vehicleForm.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            vehicleSelect.value = "";
            document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
                input.value = '';
            });
            document.getElementById('vehicleIdToEdit').value = '';
        }
    }
}

function populateBrandSelect() {
    const brandSelect = document.getElementById('vehicleBrand');
    if (!brandSelect) return;

    brandSelect.innerHTML = '<option value="">Selecione a marca</option>' +
        brazilianCarBrands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
}

// FUNÇÃO ATUALIZADA: saveVehicle
async function saveVehicle() {
    if (!checkUserLogin() || !currentUserId) {
        redirectToLogin();
        return;
    }

    const plate = document.getElementById('vehiclePlate')?.value?.trim();
    const brand = document.getElementById('vehicleBrand')?.value;
    const model = document.getElementById('vehicleModel')?.value?.trim();
    const type = document.getElementById('vehicleType')?.value;
    const color = document.getElementById('vehicleColor')?.value?.trim();
    const vehicleIdToEdit = document.getElementById('vehicleIdToEdit')?.value; // _id do MongoDB

    if (!plate || !brand || !model || !type || !color) {
        showToast('Por favor, preencha todos os campos do veículo.', 'error');
        return;
    }

    if (!validateBrazilianPlate(plate)) {
        showToast('Por favor, insira uma placa brasileira válida (formato ABC1234 ou ABC1D23).', 'error');
        return;
    }

    showLoading();

    try {
        let response;
        let method;
        let url;
        let vehicleData = {
            // userId: currentUserId, // Backend vai usar o ID do token, não precisa enviar
            plate: plate.toUpperCase().replace(/\s/g, ''),
            brand,
            model,
            type,
            color
        };

        if (vehicleIdToEdit) {
            method = 'PUT';
            url = `http://localhost:5000/api/vehicles/${vehicleIdToEdit}`;
        } else {
            method = 'POST';
            url = 'http://localhost:5000/api/vehicles';
        }

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUserToken}`
            },
            body: JSON.stringify(vehicleData),
        });

        const data = await response.json();
        hideLoading();

        if (response.ok) {
            showToast(data.message || (vehicleIdToEdit ? 'Veículo atualizado com sucesso!' : 'Veículo adicionado com sucesso!'), 'success');
            
            await loadUserData(); // Recarrega veículos e agendamentos (pois um veículo pode ter sido adicionado/editado)
            populateVehicleSelect(); // Repopula o select com os veículos atualizados

            document.getElementById('vehicleForm').style.display = 'none';
            document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
                input.value = '';
            });
            document.getElementById('vehicleIdToEdit').value = '';

            // Após adicionar, selecione o novo veículo na lista do usuário
            if (!vehicleIdToEdit && data.vehicle && data.vehicle._id) {
                 document.getElementById('vehicleSelect').value = data.vehicle._id;
            } else if (vehicleIdToEdit) { // Se foi edição, re-seleciona
                 document.getElementById('vehicleSelect').value = vehicleIdToEdit;
            }

        } else {
            showToast(data.message || 'Erro ao salvar veículo.', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Erro de rede ou servidor ao salvar veículo:', error);
        showToast('Erro de conexão ao salvar veículo.', 'error');
    }
}

// FUNÇÃO ATUALIZADA: populateVehicleSelect
function populateVehicleSelect() {
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (!vehicleSelect) return;

    vehicleSelect.innerHTML = '<option value="">Selecione um veículo</option>';

    // 'vehicles' global já está filtrado e populado por loadUserData()
    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle._id; // Usar o _id do MongoDB
        option.textContent = `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`;
        vehicleSelect.appendChild(option);
    });

    vehicleSelect.addEventListener('change', () => {
        const vehicleForm = document.getElementById('vehicleForm');
        if (vehicleSelect.value !== "" && vehicleForm.style.display === 'block') {
            vehicleForm.style.display = 'none';
            document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
                input.value = '';
            });
            document.getElementById('vehicleIdToEdit').value = '';
        }
    });
}

function setMinDate() {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    const selectedDate = document.getElementById('bookingDate')?.value;

    if (!timeSlotsContainer || !selectedDate) return;

    timeSlotsContainer.innerHTML = '';
    selectedTimeSlot = null;

    const dayOfWeek = new Date(selectedDate.replace(/-/g, '\/')).getDay();

    timeSlots.forEach(time => {
        const isUnavailable = isTimeSlotUnavailable(selectedDate, time) || (dayOfWeek === 0);
        
        const timeSlot = document.createElement('div');
        timeSlot.className = `time-slot ${isUnavailable ? 'unavailable' : ''}`;
        timeSlot.textContent = time;

        if (!isUnavailable) {
            timeSlot.addEventListener('click', () => selectTimeSlot(timeSlot, time));
        }

        timeSlotsContainer.appendChild(timeSlot);
    });
}

function selectTimeSlot(element, time) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    element.classList.add('selected');
    selectedTimeSlot = time;
}

// FUNÇÃO ATUALIZADA: isTimeSlotUnavailable
function isTimeSlotUnavailable(date, time) {
    // Agora verifica os agendamentos carregados do backend
    return appointments.some(appointment =>
        appointment.date === date && appointment.time === time && appointment.status !== 'cancelled' && appointment.status !== 'completed'
    );
}

function updateSummary() {
    const vehicle = vehicles.find(v => v._id == document.getElementById('vehicleSelect')?.value);
    const date = document.getElementById('bookingDate')?.value;

    if (currentService) {
        document.getElementById('summaryService').textContent = currentService.name;
        document.getElementById('summaryPrice').textContent = `R$ ${currentService.price.toFixed(2)}`;
    }

    document.getElementById('summaryDate').textContent = date ? formatDate(date) : '-';
    document.getElementById('summaryTime').textContent = selectedTimeSlot || '-';
    document.getElementById('summaryVehicle').textContent =
        vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : '-';
}

// FUNÇÃO ATUALIZADA: handleBookingSubmit
async function handleBookingSubmit(e) {
    e.preventDefault();

    if (currentStep < 3) {
        nextStep(currentStep + 1);
        return;
    }

    if (!validateStep(2)) return;
    if (!checkUserLogin() || !currentUserId) {
        showToast('Você precisa estar logado para agendar um serviço.', 'error');
        redirectToLogin();
        return;
    }

    showLoading();

    const selectedVehicleId = document.getElementById('vehicleSelect').value;
    const vehicle = vehicles.find(v => v._id === selectedVehicleId);

    if (!vehicle) {
        showToast('Erro: Veículo selecionado não encontrado ou não pertence a você.', 'error');
        hideLoading();
        return;
    }

    const appointmentData = {
        serviceId: currentService._id, // O ID do serviço agora é _id do MongoDB
        value: currentService.price,
        vehicleId: vehicle._id, // Passar apenas o _id do veículo
        date: document.getElementById('bookingDate').value,
        time: selectedTimeSlot,
        status: 'scheduled', // Status inicial
    };

    try {
        const response = await fetch('http://localhost:5000/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUserToken}`
            },
            body: JSON.stringify(appointmentData),
        });

        const data = await response.json();
        hideLoading();

        if (response.ok) {
            showToast('Agendamento realizado com sucesso!', 'success');
            closeBookingModal();
            await loadUserData(); // Recarrega agendamentos e veículos
            generateTimeSlots(); // Recarrega slots de tempo para refletir o novo agendamento
        } else {
            showToast(data.message || 'Erro ao agendar serviço.', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Erro de rede ou servidor ao agendar:', error);
        showToast('Erro de conexão ao agendar serviço.', 'error');
    }
}

// FUNÇÃO ATUALIZADA: loadUserData
async function loadUserData() {
    const profileNameElem = document.getElementById('userName');
    const profileEmailElem = document.getElementById('userEmail');
    const profilePhoneElem = document.getElementById('userPhone');

    if (profileNameElem) profileNameElem.textContent = userName;
    if (profileEmailElem) profileEmailElem.textContent = userEmail;
    if (profilePhoneElem) profilePhoneElem.textContent = userPhone || 'Não informado';

    const appointmentsList = document.getElementById('appointmentsList');
    const vehiclesList = document.getElementById('vehiclesList');

    if (!checkUserLogin()) {
        if (appointmentsList) appointmentsList.innerHTML = '<p class="no-data">Faça login para ver seus agendamentos</p>';
        if (vehiclesList) vehiclesList.innerHTML = '<p class="no-data">Faça login para ver seus veículos</p>';
        return;
    }

    showLoading();
    try {
        // Carregar veículos do backend para o usuário logado
        const vehiclesResponse = await fetch(`http://localhost:5000/api/vehicles/user/${currentUserId}`, {
            headers: {
                'Authorization': `Bearer ${currentUserToken}`
            }
        });
        const userVehicles = await vehiclesResponse.json();

        if (vehiclesResponse.ok) {
            vehicles = userVehicles; // Atualiza a variável global 'vehicles'
            if (vehiclesList) {
                if (userVehicles.length === 0) {
                    vehiclesList.innerHTML = '<p class="no-data">Nenhum veículo cadastrado</p>';
                } else {
                    vehiclesList.innerHTML = userVehicles.map(vehicle => `
                        <div class="vehicle-card">
                            <h5>${vehicle.brand} ${vehicle.model}</h5>
                            <p><strong>Placa:</strong> ${vehicle.plate}</p>
                            <p><strong>Tipo:</strong> ${vehicle.type}</p>
                            <p><strong>Cor:</strong> ${vehicle.color}</p>
                            <button class="edit-btn" onclick="editVehicle('${vehicle._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-vehicle-btn" onclick="deleteVehicle('${vehicle._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('');
                }
            }
        } else {
            showToast(userVehicles.message || 'Erro ao carregar veículos.', 'error');
            if (vehiclesList) vehiclesList.innerHTML = '<p class="no-data">Erro ao carregar veículos.</p>';
        }

        // Carregar agendamentos do backend para o usuário logado
        const appointmentsResponse = await fetch(`http://localhost:5000/api/appointments/user/${currentUserId}`, {
            headers: {
                'Authorization': `Bearer ${currentUserToken}`
            }
        });
        const currentUserAppointments = await appointmentsResponse.json();

        if (appointmentsResponse.ok) {
            appointments = currentUserAppointments; // Atualiza a variável global 'appointments'
            if (appointmentsList) {
                if (currentUserAppointments.length === 0) {
                    appointmentsList.innerHTML = '<p class="no-data">Nenhum agendamento encontrado</p>';
                } else {
                    // Filtrar agendamentos que não são cancelled ou completed para 'Meus Agendamentos'
                    const activeAppointments = currentUserAppointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed');
                    
                    activeAppointments.sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
                    appointmentsList.innerHTML = activeAppointments.map(appointment => {
                        // services global já deve estar populado por loadServicesFromBackend()
                        const serviceDetail = services.find(s => s._id === appointment.serviceId) || {name: 'Serviço não encontrado', price: appointment.value};
                        const serviceName = serviceDetail.name;
                        const servicePrice = serviceDetail.price;

                        const vehicleDisplay = appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}` : 'Veículo não encontrado';

                        return `
                            <div class="appointment-card">
                                <h5>${serviceName}</h5>
                                <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)} às ${appointment.time}</p>
                                <p><i class="fas fa-car"></i> ${vehicleDisplay}</p>
                                <p><i class="fas fa-dollar-sign"></i> R$ ${servicePrice.toFixed(2)}</p>
                                <button class="cancel-btn" onclick="cancelAppointment('${appointment._id}')">
                                    <i class="fas fa-times"></i>
                                    Cancelar
                                </button>
                            </div>
                        `;
                    }).join('');
                }
            }
        } else {
            showToast(currentUserAppointments.message || 'Erro ao carregar agendamentos.', 'error');
            if (appointmentsList) appointmentsList.innerHTML = '<p class="no-data">Erro ao carregar agendamentos.</p>';
        }
    } catch (error) {
        showToast('Erro de conexão ao carregar dados do usuário.', 'error');
        console.error('Erro ao buscar dados do usuário (veículos/agendamentos):', error);
    } finally {
        hideLoading();
    }
}

// FUNÇÃO ATUALIZADA: cancelAppointment
async function cancelAppointment(appointmentId) {
    if (!checkUserLogin() || !currentUserId) {
        redirectToLogin();
        return;
    }

    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        showLoading();
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUserToken}`
                },
                body: JSON.stringify({ status: 'cancelled' })
            });

            const data = await response.json();
            hideLoading();

            if (response.ok) {
                showToast(data.message || 'Agendamento cancelado com sucesso!', 'success');
                await loadUserData(); // Recarrega para atualizar a lista
                generateTimeSlots(); // Recarrega slots de tempo
            } else {
                showToast(data.message || 'Erro ao cancelar agendamento.', 'error');
            }
        } catch (error) {
            hideLoading();
            console.error('Erro de rede ou servidor ao cancelar agendamento:', error);
            showToast('Erro de conexão ao cancelar agendamento.', 'error');
        }
    }
}

// FUNÇÃO ATUALIZADA: editVehicle
async function editVehicle(vehicleId) { // vehicleId agora é o _id do MongoDB
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    const vehicle = vehicles.find(v => v._id === vehicleId); // Buscar pelo _id
    if (!vehicle) {
        showToast('Veículo não encontrado.', 'error');
        return;
    }
    // Garante que a edição é do carro do usuário logado (pode ser o ID ou o _id)
    if (vehicle.userId !== currentUserId) {
        showToast('Você não tem permissão para editar este veículo.', 'error');
        return;
    }

    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.style.display = 'block';
    }

    document.getElementById('vehiclePlate').value = vehicle.plate;
    document.getElementById('vehicleBrand').value = vehicle.brand;
    document.getElementById('vehicleModel').value = vehicle.model;
    document.getElementById('vehicleType').value = vehicle.type;
    document.getElementById('vehicleColor').value = vehicle.color;
    document.getElementById('vehicleIdToEdit').value = vehicle._id; // Salvar o _id para edição

    document.getElementById('vehicleSelect').value = '';

    const bookingModal = document.getElementById('bookingModal');
    bookingModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    nextStep(1);
    showToast('Edite as informações do veículo e salve.', 'info');
}

// FUNÇÃO ATUALIZADA: deleteVehicle
async function deleteVehicle(vehicleId) { // vehicleId agora é o _id do MongoDB
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    // Garante que a exclusão é do carro do usuário logado
    const vehicleToDelete = vehicles.find(v => v._id === vehicleId);
    if (!vehicleToDelete || vehicleToDelete.userId !== currentUserId) {
        showToast('Você não tem permissão para excluir este veículo.', 'error');
        return;
    }

    if (confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
        showLoading();
        try {
            const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUserToken}`
                }
            });

            const data = await response.json();
            hideLoading();

            if (response.ok) {
                showToast(data.message || 'Veículo excluído com sucesso!', 'success');
                await loadUserData(); // Recarrega para atualizar listas
                populateVehicleSelect(); // Atualiza o select de veículos
                generateTimeSlots(); // Pode afetar a disponibilidade
            } else {
                showToast(data.message || 'Erro ao excluir veículo.', 'error');
            }
        } catch (error) {
            hideLoading();
            console.error('Erro de rede ou servidor ao excluir veículo:', error);
            showToast('Erro de conexão ao excluir veículo.', 'error');
        }
    }
}

// FUNÇÃO ATUALIZADA: showHistory
async function showHistory() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.add('active');
        await loadHistoryData(); // Chame assincronamente
    }
}

// FUNÇÃO ATUALIZADA: loadHistoryData
async function loadHistoryData() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (!checkUserLogin() || !currentUserId) {
        historyList.innerHTML = '<p class="no-data">Faça login para ver seu histórico</p>';
        return;
    }

    showLoading();
    try {
        // Carrega TODOS os agendamentos do usuário (incluindo cancelados/completos)
        const response = await fetch(`http://localhost:5000/api/appointments/user/${currentUserId}`, {
            headers: {
                'Authorization': `Bearer ${currentUserToken}`
            }
        });
        const currentUserAppointments = await response.json();
        hideLoading();

        if (response.ok) {
            // Filtra agendamentos para o histórico (AGORA INCLUINDO TODOS OS STATUS POR PADRÃO, A MENOS QUE MODIFICADO)
            // Para mostrar *todos* os agendamentos do usuário no histórico, use:
            const historyAppointments = currentUserAppointments; 
            
            // Se você quiser filtrar APENAS "cancelled" e "completed" ou outros, use a linha abaixo:
            // const historyAppointments = currentUserAppointments.filter(a => a.status === 'cancelled' || a.status === 'completed');
            // Ou para mostrar todos (ativos e históricos):
            // const historyAppointments = currentUserAppointments.filter(a => a.status === 'cancelled' || a.status === 'completed' || a.status === 'scheduled' || a.status === 'confirmed');

            if (historyAppointments.length === 0) {
                historyList.innerHTML = '<p class="no-data">Nenhum histórico de agendamento encontrado</p>';
            } else {
                // Ordena por data mais recente primeiro
                historyAppointments.sort((a, b) => new Date(b.date) - new Date(a.date) || b.time.localeCompare(b.time));
                historyList.innerHTML = historyAppointments.map(appointment => {
                    // services global já deve estar populado por loadServicesFromBackend()
                    const serviceDetail = services.find(s => s._id === appointment.serviceId) || {name: 'Serviço não encontrado', price: appointment.value};
                    const serviceName = serviceDetail.name;
                    const servicePrice = serviceDetail.price;
                    const vehicleDisplay = appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}` : 'Veículo não encontrado';

                    // Mapeia o status do backend para o texto/classe do frontend
                    const statusText = {
                        'scheduled': 'Agendado',
                        'confirmed': 'Confirmado',
                        'completed': 'Concluído',
                        'cancelled': 'Cancelado'
                    }[appointment.status] || appointment.status;

                    return `
                        <div class="history-item">
                            <h5>${serviceName}</h5>
                            <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)} às ${appointment.time}</p>
                            <p><i class="fas fa-car"></i> ${vehicleDisplay}</p>
                            <p><i class="fas fa-dollar-sign"></i> R$ ${servicePrice.toFixed(2)}</p>
                            <span class="status ${appointment.status}">${statusText}</span>
                        </div>
                    `;
                }).join('');
            }
        } else {
            showToast(currentUserAppointments.message || 'Erro ao carregar histórico.', 'error');
            historyList.innerHTML = '<p class="no-data">Erro ao carregar histórico.</p>';
        }
    } catch (error) {
        hideLoading();
        console.error('Erro ao buscar histórico:', error);
        historyList.innerHTML = '<p class="no-data">Erro de conexão ao carregar histórico.</p>';
    }
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('currentUser');
        isUserLoggedIn = false;
        userName = 'Convidado';
        userEmail = '';
        userPhone = '';
        currentUserToken = null;
        currentUserId = null;
        showLoading();
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 1500);
    }
}

// Event listeners para navegação suave e menu mobile
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        navMenu?.classList.remove('active');
    });
});