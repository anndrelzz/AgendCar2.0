let currentService = null;
let currentStep = 1;
let selectedTimeSlot = null;
let vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Carrega o status de login e as informações do usuário
let isUserLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
let userName = localStorage.getItem('userName') || 'Convidado';
let userEmail = localStorage.getItem('userEmail') || '';
let userPhone = localStorage.getItem('userPhone') || ''; // Novo: carrega o telefone do usuário
let currentUserId = JSON.parse(localStorage.getItem('currentUser'))?.id || null;

// Brazilian car brands
const brazilianCarBrands = [
    'Chevrolet', 'Volkswagen', 'Ford', 'Fiat', 'Toyota', 'Honda', 'Hyundai',
    'Nissan', 'Renault', 'Peugeot', 'Citroën', 'Jeep', 'Kia', 'Mitsubishi',
    'Suzuki', 'Subaru', 'Chery', 'JAC', 'Lifan', 'Caoa Chery', 'BMW',
    'Mercedes-Benz', 'Audi', 'Land Rover', 'Volvo', 'Porsche', 'Outros'
];

// Services data
const services = [
    {
        id: 1,
        name: 'Lavagem Completa',
        icon: 'fas fa-car',
        description: 'Limpeza completa interna e externa do seu veículo com produtos premium.',
        price: 150.00,
        duration: '120 min'
    },
    {
        id: 2,
        name: 'Polimento',
        icon: 'fas fa-star',
        description: 'Polimento profissional para remover riscos e restaurar o brilho da pintura.',
        price: 280.00,
        duration: '180 min'
    },
    {
        id: 3,
        name: 'Cristalização',
        icon: 'fas fa-shield-alt',
        description: 'Proteção duradoura que mantém seu carro brilhando por mais tempo.',
        price: 400.00,
        duration: '240 min'
    },
    {
        id: 4,
        name: 'Higienização',
        icon: 'fas fa-broom',
        description: 'Limpeza profunda de estofados e ar condicionado.',
        price: 200.00,
        duration: '150 min'
    },
    {
        id: 5,
        name: 'Enceramento',
        icon: 'fas fa-gem',
        description: 'Aplicação de cera premium para proteção e brilho intenso.',
        price: 180.00,
        duration: '90 min'
    },
    {
        id: 6,
        name: 'Lavagem Simples',
        icon: 'fas fa-tint',
        description: 'Lavagem externa básica com produtos de qualidade.',
        price: 80.00,
        duration: '60 min'
    }
];

// Time slots
const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Validação de placa brasileira
function validateBrazilianPlate(plate) {
    if (!plate) return false;

    // Remove espaços e converte para maiúsculo
    plate = plate.replace(/\s/g, '').toUpperCase();

    // Placa antiga: ABC1234 (3 letras + 4 números)
    const oldPlateRegex = /^[A-Z]{3}[0-9]{4}$/;

    // Placa Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
    const mercosulPlateRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return oldPlateRegex.test(plate) || mercosulPlateRegex.test(plate);
}

// Check if user is logged in
function checkUserLogin() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

// Redirect to login
function redirectToLogin() {
    showLoading();
    setTimeout(() => {
        window.location.href = `register.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1500);
}

// Loading functions
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

// Initialize Application
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

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
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

    // Date change
    document.getElementById('bookingDate')?.addEventListener('change', generateTimeSlots);

    // Profile Edit Modal
    document.getElementById('closeProfileEditModal')?.addEventListener('click', closeProfileEditModal);
    document.getElementById('profileEditForm')?.addEventListener('submit', saveProfile);
    document.getElementById('editProfileBtn')?.addEventListener('click', openProfileEditModal); // Ensure this is hooked up

    // Outside clicks
    document.getElementById('bookingModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'bookingModal') closeBookingModal();
    });

    document.getElementById('sidebar')?.addEventListener('click', (e) => {
        // Verifica se o clique foi diretamente no overlay da sidebar, não em seus filhos
        if (e.target.id === 'sidebar') toggleSidebar();
    });

    document.getElementById('profileEditModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'profileEditModal') closeProfileEditModal();
    });

    // Event listeners para os botões do formulário modal (prev, next, confirm)
    // Esses listeners precisam ser mais robustos se os botões são dinâmicos ou não têm IDs únicos.
    // O sistema de `onclick` direto no HTML já cuida disso, então não duplica aqui.
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu?.classList.toggle('active');
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.toggle('active');
}

// Novo: Atualiza o texto do botão de perfil na navbar
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

// Open Profile Edit Modal
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

// Close Profile Edit Modal
function closeProfileEditModal() {
    document.getElementById('profileEditModal')?.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Save Profile Changes
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
        loadUserData(); // Reload profile info in sidebar
        updateProfileButton(); // Update navbar button
        closeProfileEditModal();
    } else {
        showToast('Erro: Usuário não encontrado para atualização.', 'error');
    }
}

// Render Services
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
                <span class="duration">${service.duration}</span>
            </div>
            <button class="book-btn" onclick="openBookingModal(${service.id})">
                <i class="fas fa-calendar-plus"></i>
                Agendar
            </button>
        </div>
    `).join('');
}

// Open Booking Modal
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
    resetForm(); // Garante que o formulário esteja limpo
    nextStep(1); // Inicia no primeiro passo
}

// Close Booking Modal
function closeBookingModal() {
    const bookingModal = document.getElementById('bookingModal');
    bookingModal?.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

// Reset Form
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

    // Certifica-se de que o formulário de veículo esteja oculto inicialmente
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.style.display = 'none';
        // Limpa os campos do formulário de veículo
        document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
            input.value = '';
        });
        document.getElementById('vehicleIdToEdit').value = ''; // Clear the hidden ID
    }

    // Garante que o select de veículos seja populado novamente
    populateVehicleSelect();
}

// Navigate Steps
function nextStep(step) {
    // Adiciona validação antes de avançar para o próximo passo
    if (step > currentStep) { // Apenas valida se estiver avançando de passo
        if (currentStep === 1 && !validateStep(1)) return;
        if (currentStep === 2 && !validateStep(2)) return;
    }

    // Esconde todos os passos
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    // Mostra o passo atual
    document.getElementById(`step${step}`)?.classList.add('active');

    currentStep = step;

    if (step === 3) {
        updateSummary();
    }
}

// Validate Step
function validateStep(step) {
    switch(step) {
        case 1:
            // Valida o veículo selecionado ou cadastrado
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

// Show Vehicle Form
function showVehicleForm() {
    const vehicleForm = document.getElementById('vehicleForm');
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (vehicleForm) {
        // Alterna a visibilidade
        const isVisible = vehicleForm.style.display === 'block';
        vehicleForm.style.display = isVisible ? 'none' : 'block';
        
        // Se o formulário de cadastro de veículo for exibido, deseleciona o veículo existente
        if (!isVisible) {
            vehicleSelect.value = ""; // Deseleciona qualquer veículo selecionado
            // Clear vehicle form fields when switching to 'add new'
            document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
                input.value = '';
            });
            document.getElementById('vehicleIdToEdit').value = ''; // Clear the hidden ID
        }
    }
}

// Populate Brand Select
function populateBrandSelect() {
    const brandSelect = document.getElementById('vehicleBrand');
    if (!brandSelect) return;

    brandSelect.innerHTML = '<option value="">Selecione a marca</option>' +
        brazilianCarBrands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
}

// Save Vehicle (updated to handle both add and edit)
function saveVehicle() {
    const plate = document.getElementById('vehiclePlate')?.value?.trim();
    const brand = document.getElementById('vehicleBrand')?.value;
    const model = document.getElementById('vehicleModel')?.value?.trim();
    const type = document.getElementById('vehicleType')?.value;
    const color = document.getElementById('vehicleColor')?.value?.trim();
    const vehicleIdToEdit = document.getElementById('vehicleIdToEdit')?.value; // Get the ID

    if (!plate || !brand || !model || !type || !color) {
        showToast('Por favor, preencha todos os campos do veículo para salvar.', 'error');
        return;
    }

    if (!validateBrazilianPlate(plate)) {
        showToast('Por favor, insira uma placa brasileira válida (formato ABC1234 ou ABC1D23).', 'error');
        return;
    }

    // Check if plate already exists, excluding the current vehicle if editing
    const plateExists = vehicles.some(v => v.plate.toUpperCase() === plate.toUpperCase() && v.id != vehicleIdToEdit);
    if (plateExists) {
        showToast('Esta placa já está cadastrada para outro veículo.', 'error');
        return;
    }

    if (vehicleIdToEdit) {
        // Editing existing vehicle
        const vehicleIndex = vehicles.findIndex(v => v.id == vehicleIdToEdit);
        if (vehicleIndex !== -1) {
            vehicles[vehicleIndex] = {
                id: parseInt(vehicleIdToEdit),
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
        // Adding new vehicle
        const vehicle = {
            id: Date.now(),
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
    populateVehicleSelect(); // Re-populate the select dropdown
    loadUserData(); // Reload the vehicles list in the sidebar

    // Clear form and hide
    document.getElementById('vehicleForm').style.display = 'none';
    document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
        input.value = '';
    });
    document.getElementById('vehicleIdToEdit').value = ''; // Clear the hidden ID

    // Select the new/updated vehicle if it was an "add" operation or if editing
    if (!vehicleIdToEdit) {
        document.getElementById('vehicleSelect').value = vehicles[vehicles.length - 1].id;
    } else {
        document.getElementById('vehicleSelect').value = vehicleIdToEdit; // Select the edited vehicle
    }
}

// Populate Vehicle Select
function populateVehicleSelect() {
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (!vehicleSelect) return;

    vehicleSelect.innerHTML = '<option value="">Selecione um veículo</option>';

    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`;
        vehicleSelect.appendChild(option);
    });

    // Adiciona listener para esconder o formulário de cadastro de veículo ao selecionar um existente
    vehicleSelect.addEventListener('change', () => {
        const vehicleForm = document.getElementById('vehicleForm');
        if (vehicleSelect.value !== "" && vehicleForm.style.display === 'block') {
            vehicleForm.style.display = 'none';
            // Limpa os campos do formulário de veículo
            document.querySelectorAll('#vehicleForm input, #vehicleForm select').forEach(input => {
                input.value = '';
            });
            document.getElementById('vehicleIdToEdit').value = ''; // Clear the hidden ID
        }
    });
}


// Set Minimum Date
function setMinDate() {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Garante que a data mínima seja a partir de amanhã
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

// Generate Time Slots
function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    const selectedDate = document.getElementById('bookingDate')?.value;

    if (!timeSlotsContainer || !selectedDate) return;

    timeSlotsContainer.innerHTML = '';
    selectedTimeSlot = null; // Reseta a seleção de horário ao mudar a data

    // Obtém o dia da semana para desabilitar domingos (0 = domingo)
    const dayOfWeek = new Date(selectedDate.replace(/-/g, '\/')).getDay(); // Fix date parsing for consistency

    timeSlots.forEach(time => {
        const isUnavailable = isTimeSlotUnavailable(selectedDate, time) || (dayOfWeek === 0); // Desabilita domingos
        
        const timeSlot = document.createElement('div');
        timeSlot.className = `time-slot ${isUnavailable ? 'unavailable' : ''}`;
        timeSlot.textContent = time;

        if (!isUnavailable) {
            timeSlot.addEventListener('click', () => selectTimeSlot(timeSlot, time));
        }

        timeSlotsContainer.appendChild(timeSlot);
    });
}

// Select Time Slot
function selectTimeSlot(element, time) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    element.classList.add('selected');
    selectedTimeSlot = time;
}

// Check if time slot is unavailable
function isTimeSlotUnavailable(date, time) {
    return appointments.some(appointment =>
        appointment.date === date && appointment.time === time
    );
}

// Update Summary
function updateSummary() {
    const vehicle = vehicles.find(v => v.id == document.getElementById('vehicleSelect')?.value);
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

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Handle Booking Submit
function handleBookingSubmit(e) {
    e.preventDefault();

    if (currentStep < 3) { // Se não estiver no último passo, avança
        nextStep(currentStep + 1);
        return;
    }

    if (!validateStep(2)) return; // Garante que o passo 2 foi validado

    showLoading();

    const vehicle = vehicles.find(v => v.id == document.getElementById('vehicleSelect').value);

    const appointment = {
        id: Date.now(),
        service: currentService,
        customer: {
            name: userName, // Usa o nome do usuário logado
            email: userEmail // Usa o email do usuário logado
        },
        vehicle: vehicle,
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

        loadUserData(); // Recarrega os agendamentos no sidebar
        generateTimeSlots(); // Atualiza os horários disponíveis
    }, 2000);
}

// Load User Data
function loadUserData() {
    // Atualiza informações do perfil no sidebar
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

    // Load appointments
    const appointmentsList = document.getElementById('appointmentsList');
    if (appointmentsList) {
        const currentUserAppointments = appointments.filter(a => a.customer.email === userEmail);

        if (currentUserAppointments.length === 0) {
            appointmentsList.innerHTML = '<p class="no-data">Nenhum agendamento encontrado</p>';
        } else {
            appointmentsList.innerHTML = currentUserAppointments.map(appointment => `
                <div class="appointment-card">
                    <h5>${appointment.service.name}</h5>
                    <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)} às ${appointment.time}</p>
                    <p><i class="fas fa-car"></i> ${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}</p>
                    <p><i class="fas fa-dollar-sign"></i> R$ ${appointment.service.price.toFixed(2)}</p>
                    <button class="cancel-btn" onclick="cancelAppointment(${appointment.id})">
                        <i class="fas fa-times"></i>
                        Cancelar
                    </button>
                </div>
            `).join('');
        }
    }

    // Load vehicles
    const vehiclesList = document.getElementById('vehiclesList');
    if (vehiclesList) {
        if (vehicles.length === 0) {
            vehiclesList.innerHTML = '<p class="no-data">Nenhum veículo cadastrado</p>';
        } else {
            vehiclesList.innerHTML = vehicles.map(vehicle => `
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

// Cancel Appointment
function cancelAppointment(appointmentId) {
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        appointments = appointments.filter(a => a.id !== appointmentId);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        loadUserData(); // Recarrega a lista de agendamentos
        generateTimeSlots(); // Recarrega os horários disponíveis
        showToast('Agendamento cancelado com sucesso!', 'success');
    }
}

// Função para editar veículo (Implemented)
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

    // Show the vehicle form inside the booking modal if it's hidden
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.style.display = 'block'; // Make sure the form is visible
    }

    // Populate the form fields with vehicle data
    document.getElementById('vehiclePlate').value = vehicle.plate;
    document.getElementById('vehicleBrand').value = vehicle.brand;
    document.getElementById('vehicleModel').value = vehicle.model;
    document.getElementById('vehicleType').value = vehicle.type;
    document.getElementById('vehicleColor').value = vehicle.color;
    document.getElementById('vehicleIdToEdit').value = vehicle.id; // Store ID for saving changes

    // Temporarily deselect any chosen vehicle from the dropdown
    document.getElementById('vehicleSelect').value = '';

    // Open the booking modal (step 1) since the vehicle form is inside it
    const bookingModal = document.getElementById('bookingModal');
    bookingModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Ensure step 1 is active and showing the vehicle form for editing
    nextStep(1); // Go to step 1 to show the vehicle form
    showToast('Edite as informações do veículo e salve.', 'info');
}

// Function to delete vehicle
function deleteVehicle(vehicleId) {
    if (!checkUserLogin()) {
        redirectToLogin();
        return;
    }

    if (confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
        // Remove the vehicle from the `vehicles` array
        vehicles = vehicles.filter(v => v.id !== vehicleId);
        localStorage.setItem('vehicles', JSON.stringify(vehicles)); // Update localStorage

        // Also remove any appointments associated with this vehicle to avoid inconsistencies
        appointments = appointments.filter(a => a.vehicle.id !== vehicleId);
        localStorage.setItem('appointments', JSON.stringify(appointments)); // Update appointments in localStorage

        loadUserData(); // Reload the vehicle list and appointments in the sidebar
        populateVehicleSelect(); // Re-populate the vehicle select dropdown in the booking modal
        showToast('Veículo excluído com sucesso!', 'success');
    }
}

// Show History Modal
function showHistory() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.add('active');
        loadHistoryData();
    }
}

// Close History Modal
function closeHistory() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.remove('active');
    }
}

// Load History Data (atualmente exibe todos os agendamentos confirmados)
function loadHistoryData() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    // For this demo, the history includes all confirmed appointments for the current user.
    const userAppointmentsHistory = appointments.filter(a => a.customer.email === userEmail);

    if (userAppointmentsHistory.length === 0) {
        historyList.innerHTML = '<p class="no-data">Nenhum histórico de agendamento encontrado</p>';
    } else {
        historyList.innerHTML = userAppointmentsHistory.map(appointment => `
            <div class="history-item">
                <h5>${appointment.service.name}</h5>
                <p><i class="fas fa-calendar"></i> ${formatDate(appointment.date)} às ${appointment.time}</p>
                <p><i class="fas fa-car"></i> ${appointment.vehicle.brand} ${appointment.vehicle.model} - ${appointment.vehicle.plate}</p>
                <p><i class="fas fa-dollar-sign"></i> R$ ${appointment.service.price.toFixed(2)}</p>
                <span class="status confirmed">Confirmado</span>
            </div>
        `).join('');
    }
}

// Show Toast
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

// Logout function
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone'); // Also remove phone on logout
        localStorage.removeItem('currentUser'); // Clear current user object
        isUserLoggedIn = false;
        userName = 'Convidado';
        userEmail = '';
        userPhone = '';
        showLoading();
        setTimeout(() => {
            window.location.href = 'register.html'; // Redirect to login/register page
        }, 1500);
    }
}

// Smooth scrolling for navigation links
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

// Close mobile menu when clicking on links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        navMenu?.classList.remove('active');
    });
});