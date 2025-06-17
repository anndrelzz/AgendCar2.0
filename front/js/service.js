let currentService = null;
let currentStep = 1;
let selectedTimeSlot = null;
let vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Carrega o status de login e as informações do usuário
let isUserLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
let userName = localStorage.getItem('userName') || 'Convidado';
let userEmail = localStorage.getItem('userEmail') || '';
let userPhone = localStorage.getItem('userPhone') || '';
// currentUserId agora é crucial para associar agendamentos e veículos ao cliente correto
let currentUserId = JSON.parse(localStorage.getItem('currentUser'))?.id || null;

// Brazilian car brands
const brazilianCarBrands = [
    'Chevrolet', 'Volkswagen', 'Ford', 'Fiat', 'Toyota', 'Honda', 'Hyundai',
    'Nissan', 'Renault', 'Peugeot', 'Citroën', 'Jeep', 'Kia', 'Mitsubishi',
    'Suzuki', 'Subaru', 'Chery', 'JAC', 'Lifan', 'Caoa Chery', 'BMW',
    'Mercedes-Benz', 'Audi', 'Land Rover', 'Volvo', 'Porsche', 'Outros'
];

// Services data - Agora carrega do localStorage ou usa o padrão
let services = JSON.parse(localStorage.getItem('services')) || [
    {
        id: 1,
        name: 'Lavagem Completa',
        icon: 'fas fa-car',
        description: 'Limpeza completa interna e externa do seu veículo com produtos premium.',
        price: 150.00,
        duration: 120
    },
    {
        id: 2,
        name: 'Polimento',
        icon: 'fas fa-star',
        description: 'Polimento profissional para remover riscos e restaurar o brilho da pintura.',
        price: 280.00,
        duration: 180
    },
    {
        id: 3,
        name: 'Cristalização',
        icon: 'fas fa-shield-alt',
        description: 'Proteção duradoura que mantém seu carro brilhando por mais tempo.',
        price: 400.00,
        duration: 240
    },
    {
        id: 4,
        name: 'Higienização',
        icon: 'fas fa-broom',
        description: 'Limpeza profunda de estofados e ar condicionado.',
        price: 200.00,
        duration: 150
    },
    {
        id: 5,
        name: 'Enceramento',
        icon: 'fas fa-gem',
        description: 'Aplicação de cera premium para proteção e brilho intenso.',
        price: 180.00,
        duration: 90
    },
    {
        id: 6,
        name: 'Lavagem Simples',
        icon: 'fas fa-tint',
        description: 'Lavagem externa básica com produtos de qualidade.',
        price: 80.00,
        duration: 60
    }
];

// Salva os serviços iniciais no localStorage se ele estava vazio
if (!localStorage.getItem('services')) {
    localStorage.setItem('services', JSON.stringify(services));
}

// Time slots
const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Validação de placa brasileira
function validateBrazilianPlate(plate) {
    if (!plate) return false;

    plate = plate.replace(/\s/g, '').toUpperCase();

    const oldPlateRegex = /^[A-Z]{3}[0-9]{4}$/;
    const mercosulPlateRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return oldPlateRegex.test(plate) || mercosulPlateRegex.test(plate);
}

function checkUserLogin() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

function redirectToLogin() {
    showLoading();
    setTimeout(() => {
        window.location.href = `register.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1500);
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

document.addEventListener('DOMContentLoaded', function() {
    hideLoading();
    renderServices();
    loadUserData();
    setupEventListeners();
    populateVehicleSelect();
    populateBrandSelect();
    setMinDate();
    updateProfileButton();
});

function setupEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const profileBtn = document.getElementById('profileBtn');
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
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu?.classList.toggle('active');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
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

function openProfileEditModal() {
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('profileUserId').value = currentUser.id;
        document.getElementById('editProfileName').value = currentUser.name;
        document.getElementById('editProfileEmail').value = currentUser.email;
        document.getElementById('editProfilePhone').value = currentUser.phone;
        
        document.getElementById('profileEditModal')?.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        showToast('Nenhum usuário logado para editar.', 'error');
        redirectToLogin();
    }
}

function closeProfileEditModal() {
    document.getElementById('profileEditModal')?.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function saveProfile(e) {
    e.preventDefault();

    const userId = document.getElementById('profileUserId').value;
    const newName = document.getElementById('editProfileName').value.trim();
    const newEmail = document.getElementById('editProfileEmail').value.trim();
    const newPhone = document.getElementById('editProfilePhone').value.trim();

    if (!newName || !newEmail) {
        showToast('Nome e Email são obrigatórios.', 'error');
        return;
    }

    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = registeredUsers.findIndex(u => u.id == userId);

    if (userIndex !== -1) {
        registeredUsers[userIndex].name = newName;
        registeredUsers[userIndex].email = newEmail;
        registeredUsers[userIndex].phone = newPhone;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

        localStorage.setItem('userName', newName);
        localStorage.setItem('userEmail', newEmail);
        localStorage.setItem('userPhone', newPhone);
        localStorage.setItem('currentUser', JSON.stringify(registeredUsers[userIndex]));

        userName = newName;
        userEmail = newEmail;
        userPhone = newPhone;

        showToast('Perfil atualizado com sucesso!', 'success');
        loadUserData();
        updateProfileButton();
        closeProfileEditModal();
    } else {
        showToast('Erro: Usuário não encontrado para atualização.', 'error');
    }
}

function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card">
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <h3>${service.name}</h3>
            <p class="description">${service.description}</p>
            <div class="service-details">
                <span class="price">R$ ${service.price.toFixed(2)}</span>
                <span class="duration">${service.duration} min</span>
            </div>
            <button class="book-btn" onclick="openBookingModal(${service.id})">
                <i class="fas fa-calendar-plus"></i>
                Agendar
            </button>
        </div>
    `).join('');
}

function openBookingModal(serviceId) {
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    currentService = services.find(s => s.id === serviceId);
    if (!currentService) return;

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

function saveVehicle() {
    if (!currentUserId) { // Garante que há um usuário logado para associar o carro
        showToast('Você precisa estar logado para adicionar um veículo.', 'error');
        redirectToLogin();
        return;
    }

    const plate = document.getElementById('vehiclePlate')?.value?.trim();
    const brand = document.getElementById('vehicleBrand')?.value;
    const model = document.getElementById('vehicleModel')?.value?.trim();
    const type = document.getElementById('vehicleType')?.value;
    const color = document.getElementById('vehicleColor')?.value?.trim();
    const vehicleIdToEdit = document.getElementById('vehicleIdToEdit')?.value;

    if (!plate || !brand || !model || !type || !color) {
        showToast('Por favor, preencha todos os campos do veículo para salvar.', 'error');
        return;
    }

    if (!validateBrazilianPlate(plate)) {
        showToast('Por favor, insira uma placa brasileira válida (formato ABC1234 ou ABC1D23).', 'error');
        return;
    }

    // Filtra veículos do usuário atual para verificar duplicidade
    const userVehicles = vehicles.filter(v => v.userId === currentUserId);
    const plateExistsForUser = userVehicles.some(v => v.plate.toUpperCase() === plate.toUpperCase() && v.id != vehicleIdToEdit);
    if (plateExistsForUser) {
        showToast('Esta placa já está cadastrada para um veículo seu.', 'error');
        return;
    }

    if (vehicleIdToEdit) {
        const vehicleIndex = vehicles.findIndex(v => v.id == vehicleIdToEdit);
        if (vehicleIndex !== -1) {
            // Garante que a edição é do carro do usuário logado
            if (vehicles[vehicleIndex].userId !== currentUserId) {
                showToast('Você não tem permissão para editar este veículo.', 'error');
                return;
            }
            vehicles[vehicleIndex] = {
                ...vehicles[vehicleIndex], // Mantém userId existente e outras propriedades
                plate: plate.toUpperCase().replace(/\s/g, ''),
                brand,
                model,
                type,
                color
            };
            showToast('Veículo atualizado com sucesso!', 'success');
        } else {
            showToast('Erro: Veículo não encontrado para atualização.', 'error');
            return;
        }
    } else {
        const vehicle = {
            id: Date.now(),
            userId: currentUserId, // Associa o veículo ao ID do usuário logado
            plate: plate.toUpperCase().replace(/\s/g, ''),
            brand,
            model,
            type,
            color
        };
        vehicles.push(vehicle);
        showToast('Veículo adicionado com sucesso!', 'success');
    }

    localStorage.setItem('vehicles', JSON.stringify(vehicles));
    populateVehicleSelect(); // Repopula o select apenas com carros do usuário atual
    loadUserData(); // Recarrega a lista de veículos na sidebar apenas com carros do usuário atual

    document.getElementById('vehicleForm').style.display = 'none';
    document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
        input.value = '';
    });
    document.getElementById('vehicleIdToEdit').value = '';

    if (!vehicleIdToEdit) {
        // Após adicionar, selecione o novo veículo na lista do usuário
        const userVehiclesAfterAdd = vehicles.filter(v => v.userId === currentUserId);
        if (userVehiclesAfterAdd.length > 0) {
             document.getElementById('vehicleSelect').value = userVehiclesAfterAdd[userVehiclesAfterAdd.length - 1].id;
        }
    } else {
        document.getElementById('vehicleSelect').value = vehicleIdToEdit;
    }
}

function populateVehicleSelect() {
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (!vehicleSelect) return;

    vehicleSelect.innerHTML = '<option value="">Selecione um veículo</option>';

    // Filtra veículos para mostrar apenas os do usuário logado
    const userVehicles = vehicles.filter(v => v.userId === currentUserId);

    userVehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
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

function isTimeSlotUnavailable(date, time) {
    // Apenas agendamentos do currentUserId devem impactar a disponibilidade para ele mesmo
    // ou você pode querer que todos os agendamentos ocupem o slot globalmente.
    // Para este caso, vamos assumir que um slot ocupado por QUALQUER cliente está indisponível.
    return appointments.some(appointment =>
        appointment.date === date && appointment.time === time
    );
}

function updateSummary() {
    // Obter veículos do usuário atual para resumo
    const userVehicles = vehicles.filter(v => v.userId === currentUserId);
    const vehicle = userVehicles.find(v => v.id == document.getElementById('vehicleSelect')?.value);
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

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function handleBookingSubmit(e) {
    e.preventDefault();

    if (currentStep < 3) {
        nextStep(currentStep + 1);
        return;
    }

    if (!validateStep(2)) return;

    showLoading();

    // Obter veículos do usuário atual
    const userVehicles = vehicles.filter(v => v.userId === currentUserId);
    const selectedVehicleId = document.getElementById('vehicleSelect').value;
    const vehicle = userVehicles.find(v => v.id == selectedVehicleId); // Encontra o veículo na lista filtrada

    if (!vehicle) {
        showToast('Erro: Veículo selecionado não encontrado ou não pertence a você.', 'error');
        hideLoading();
        return;
    }

    const appointment = {
        id: Date.now(),
        serviceId: currentService.id,
        value: currentService.price,
        clientId: currentUserId, // Associa o agendamento ao ID do cliente logado
        vehicle: { // Salva uma cópia dos dados essenciais do veículo para o agendamento
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            plate: vehicle.plate,
            type: vehicle.type,
            color: vehicle.color
        },
        date: document.getElementById('bookingDate').value,
        time: selectedTimeSlot,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };

    setTimeout(() => {
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        hideLoading();
        closeBookingModal();
        showToast('Agendamento realizado com sucesso!', 'success');

        loadUserData();
        generateTimeSlots();
    }, 2000);
}

function loadUserData() {
    const profileNameElem = document.getElementById('userName');
    const profileEmailElem = document.getElementById('userEmail');
    const profilePhoneElem = document.getElementById('userPhone');

    if (profileNameElem) {
        profileNameElem.textContent = userName;
    }
    if (profileEmailElem) {
        profileEmailElem.textContent = userEmail;
    }
    if (profilePhoneElem) {
        profilePhoneElem.textContent = userPhone || 'Não informado';
    }

    const appointmentsList = document.getElementById('appointmentsList');
    if (appointmentsList) {
        // Filtra agendamentos para mostrar apenas os do usuário logado
        const currentUserAppointments = appointments.filter(a => a.clientId === currentUserId);
        
        const allServices = JSON.parse(localStorage.getItem('services')) || [];

        if (currentUserAppointments.length === 0) {
            appointmentsList.innerHTML = '<p class="no-data">Nenhum agendamento encontrado</p>';
        } else {
            currentUserAppointments.sort((a, b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));
            appointmentsList.innerHTML = currentUserAppointments.map(appointment => {
                const serviceDetail = allServices.find(s => s.id === appointment.serviceId);
                const serviceName = serviceDetail ? serviceDetail.name : 'Serviço não encontrado';
                const servicePrice = serviceDetail ? serviceDetail.price : appointment.value;

                // Informações do veículo já estão salvas dentro do objeto 'appointment.vehicle'
                const vehicleDisplay = appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}` : 'Veículo não encontrado';

                return `
                    <div class="appointment-card">
                        <h5>${serviceName}</h5>
                        <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)} às ${appointment.time}</p>
                        <p><i class="fas fa-car"></i> ${vehicleDisplay}</p>
                        <p><i class="fas fa-dollar-sign"></i> R$ ${servicePrice.toFixed(2)}</p>
                        <button class="cancel-btn" onclick="cancelAppointment(${appointment.id})">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                    </div>
                `;
            }).join('');
        }
    }

    const vehiclesList = document.getElementById('vehiclesList');
    if (vehiclesList) {
        // Filtra veículos para mostrar apenas os do usuário logado
        const userVehicles = vehicles.filter(v => v.userId === currentUserId);

        if (userVehicles.length === 0) {
            vehiclesList.innerHTML = '<p class="no-data">Nenhum veículo cadastrado</p>';
        } else {
            vehiclesList.innerHTML = userVehicles.map(vehicle => `
                <div class="vehicle-card">
                    <h5>${vehicle.brand} ${vehicle.model}</h5>
                    <p><strong>Placa:</strong> ${vehicle.plate}</p>
                    <p><strong>Tipo:</strong> ${vehicle.type}</p>
                    <p><strong>Cor:</strong> ${vehicle.color}</p>
                    <button class="edit-btn" onclick="editVehicle(${vehicle.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-vehicle-btn" onclick="deleteVehicle(${vehicle.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

function cancelAppointment(appointmentId) {
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        appointments = appointments.filter(a => a.id !== appointmentId);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        loadUserData();
        generateTimeSlots();
        showToast('Agendamento cancelado com sucesso!', 'success');
    }
}

function editVehicle(vehicleId) {
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Veículo não encontrado.', 'error');
        return;
    }
    // Garante que a edição é do carro do usuário logado
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
    document.getElementById('vehicleIdToEdit').value = vehicle.id;

    document.getElementById('vehicleSelect').value = '';

    const bookingModal = document.getElementById('bookingModal');
    bookingModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    nextStep(1);
    showToast('Edite as informações do veículo e salve.', 'info');
}

function deleteVehicle(vehicleId) {
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    // Garante que a exclusão é do carro do usuário logado
    const vehicleToDelete = vehicles.find(v => v.id === vehicleId);
    if (!vehicleToDelete || vehicleToDelete.userId !== currentUserId) {
        showToast('Você não tem permissão para excluir este veículo.', 'error');
        return;
    }

    if (confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
        vehicles = vehicles.filter(v => v.id !== vehicleId);
        localStorage.setItem('vehicles', JSON.stringify(vehicles));

        appointments = appointments.filter(a => a.vehicle.id !== vehicleId); // Excluir agendamentos associados
        localStorage.setItem('appointments', JSON.stringify(appointments));

        loadUserData();
        populateVehicleSelect();
        showToast('Veículo excluído com sucesso!', 'success');
    }
}

function showHistory() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.add('active');
        loadHistoryData();
    }
}

function closeHistory() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.remove('active');
    }
}

function loadHistoryData() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const allServices = JSON.parse(localStorage.getItem('services')) || [];
    const allRegisteredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const currentUserData = allRegisteredUsers.find(user => user.email === userEmail);
    const userAppointmentsHistory = appointments.filter(a => a.clientId === currentUserData?.id);


    if (userAppointmentsHistory.length === 0) {
        historyList.innerHTML = '<p class="no-data">Nenhum histórico de agendamento encontrado</p>';
    } else {
        userAppointmentsHistory.sort((a, b) => new Date(b.date) - new Date(a.date) || b.time.localeCompare(a.time));
        historyList.innerHTML = userAppointmentsHistory.map(appointment => {
            const serviceDetail = allServices.find(s => s.id === appointment.serviceId);
            const serviceName = serviceDetail ? serviceDetail.name : 'Serviço não encontrado';
            const servicePrice = serviceDetail ? serviceDetail.price : appointment.value;
            const vehicleDisplay = appointment.vehicle ? `${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}` : 'Veículo não encontrado';

            return `
                <div class="history-item">
                    <h5>${serviceName}</h5>
                    <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)} às ${appointment.time}</p>
                    <p><i class="fas fa-car"></i> ${vehicleDisplay}</p>
                    <p><i class="fas fa-dollar-sign"></i> R$ ${servicePrice.toFixed(2)}</p>
                    <span class="status confirmed">Confirmado</span>
                </div>
            `;
        }).join('');
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

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('currentUser');
        isUserLoggedIn = false;
        userName = 'Convidado';
        userEmail = '';
        userPhone = '';
        showLoading();
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 1500);
    }
}

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