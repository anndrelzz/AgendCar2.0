// Global Data Storage
// Load from localStorage or use default if empty
let appointments = JSON.parse(localStorage.getItem('appointments')) || [
    { id: 1, clientId: 1, serviceId: 1, date: '2024-03-15', time: '14:30', value: 150.00, status: 'scheduled' },
    { id: 2, clientId: 2, serviceId: 2, date: '2024-03-15', time: '16:00', value: 280.00, status: 'confirmed' },
    { id: 3, clientId: 3, serviceId: 3, date: '2024-03-16', time: '09:00', value: 400.00, status: 'completed' },
    { id: 4, clientId: 1, serviceId: 4, date: '2024-03-16', time: '11:30', value: 200.00, status: 'cancelled' }
];
if (!localStorage.getItem('appointments')) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}


let services = JSON.parse(localStorage.getItem('services')) || [
    { id: 1, name: 'Lavagem Completa', price: 150.00, duration: 60, description: 'Limpeza completa interna e externa do veículo' },
    { id: 2, name: 'Polimento', price: 280.00, duration: 120, description: 'Polimento profissional para remover riscos' },
    { id: 3, name: 'Cristalização', price: 400.00, duration: 180, description: 'Proteção duradoura da pintura' },
    { id: 4, name: 'Higienização', price: 200.00, duration: 90, description: 'Limpeza profunda de estofados' }
];
if (!localStorage.getItem('services')) {
    localStorage.setItem('services', JSON.stringify(services));
}

// **ALTERAÇÃO AQUI:** Carregar clientes APENAS do 'registeredUsers' do localStorage.
// Se não houver, será um array vazio, sem clientes fictícios.
let clients = JSON.parse(localStorage.getItem('registeredUsers')) || [];

// Também carregar os veículos para exibir na coluna 'Veículo'
let vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];


// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    // Adiciona T00:00:00 para evitar problemas de fuso horário na criação da data
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
}

function getStatusBadge(status) {
    const statusMap = {
        'scheduled': { class: 'status-scheduled', text: 'Agendado' },
        'confirmed': { class: 'status-confirmed', text: 'Confirmado' },
        'completed': { class: 'status-completed', text: 'Concluído' },
        'cancelled': { class: 'status-cancelled', text: 'Cancelado' }
    };
    const statusInfo = statusMap[status] || { class: '', text: status };
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

function getClientName(clientId) {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
}

// Nova função para obter a marca e modelo do veículo
function getVehicleInfo(vehicleId, plate) {
    // A propriedade 'vehicle' no objeto appointment em service.js é o objeto completo do veículo.
    // Então, podemos tentar encontrar pelo ID do objeto completo do veículo salvo,
    // ou, se a estrutura mudar, pelo plate.
    const vehicle = vehicles.find(v => v.id === vehicleId || v.plate === plate); // Ajuste a busca se o ID do veículo for inconsistente
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado';
}


function getServiceName(serviceId) {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Serviço não encontrado';
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'appointments': 'Agendamentos',
        'services': 'Serviços',
        'clients': 'Clientes',
        'settings': 'Configurações'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';

    // Load section data
    switch(sectionId) {
        case 'appointments':
            loadAppointments();
            break;
        case 'services':
            loadServices();
            break;
        case 'clients':
            loadClients();
            break;
    }
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// Appointments Functions
function loadAppointments() {
    const tbody = document.getElementById('appointmentsTable');
    tbody.innerHTML = '';

    // Re-carrega clientes, serviços e veículos do localStorage para garantir que estejam atualizados
    clients = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    services = JSON.parse(localStorage.getItem('services')) || [];
    appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];


    appointments.forEach(appointment => {
        // Encontra o cliente e o serviço com base nos IDs salvos no agendamento
        const clientName = getClientName(appointment.clientId);
        const serviceName = getServiceName(appointment.serviceId);
        const serviceValue = serviceName !== 'Serviço não encontrado' ? services.find(s => s.id === appointment.serviceId).price : (appointment.value || 'N/A');
        
        // Obter informações do veículo. O appointment.vehicle agora é o objeto completo do veículo.
        const vehicleInfo = appointment.vehicle ? getVehicleInfo(appointment.vehicle.id, appointment.vehicle.plate) : 'Veículo não encontrado';


        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="ID">${appointment.id}</td>
            <td data-label="Cliente">${clientName}</td>
            <td data-label="Veículo">${vehicleInfo}</td>
            <td data-label="Serviço">${serviceName}</td>
            <td data-label="Data">${formatDate(appointment.date)}</td>
            <td data-label="Horário">${appointment.time}</td>
            <td data-label="Valor">${formatCurrency(serviceValue)}</td>
            <td data-label="Status">${getStatusBadge(appointment.status)}</td>
            <td data-label="Ações">
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editAppointment(${appointment.id})" title="Editar">
                        <i class="fas fa-edit"></i> </button>
                    <button class="action-btn delete-btn" onclick="deleteAppointment(${appointment.id})" title="Excluir">
                        <i class="fas fa-trash"></i> </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editAppointment(id) {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    document.getElementById('appointmentModalTitle').textContent = 'Editar Agendamento';
    document.getElementById('appointmentId').value = appointment.id;
    document.getElementById('appointmentClient').value = appointment.clientId;
    document.getElementById('appointmentService').value = appointment.serviceId;
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('appointmentValue').value = appointment.value;
    document.getElementById('appointmentStatus').value = appointment.status;

    openModal('appointmentModal');
}

function deleteAppointment(id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        appointments = appointments.filter(a => a.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments)); // Save to localStorage
        loadAppointments();
        updateDashboard();
    }
}

function saveAppointment() {
    const form = document.getElementById('appointmentForm');
    
    const appointmentData = {
        clientId: parseInt(document.getElementById('appointmentClient').value),
        serviceId: parseInt(document.getElementById('appointmentService').value),
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        value: parseFloat(document.getElementById('appointmentValue').value),
        status: document.getElementById('appointmentStatus').value
    };

    const id = document.getElementById('appointmentId').value;
    
    if (id) {
        // Edit existing appointment
        const index = appointments.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            appointments[index] = { ...appointmentData, id: parseInt(id) };
        }
    } else {
        // Add new appointment
        const newId = Math.max(...appointments.map(a => a.id), 0) + 1;
        appointments.push({ ...appointmentData, id: newId });
    }

    localStorage.setItem('appointments', JSON.stringify(appointments));

    closeModal('appointmentModal');
    loadAppointments();
    updateDashboard();
    form.reset();
}

// Services Functions
function loadServices() {
    const container = document.getElementById('servicesGrid');
    container.innerHTML = '';

    // Re-carrega serviços do localStorage para garantir que estejam atualizados
    services = JSON.parse(localStorage.getItem('services')) || [];

    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <div class="service-header">
                <div class="service-info">
                    <h3>${service.name}</h3>
                    <div class="service-price">${formatCurrency(service.price)}</div>
                </div>
            </div>
            <div class="service-body">
                <p class="service-description">${service.description}</p>
                <p><strong>Duração:</strong> ${service.duration} min</p>
                <div class="service-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editService(${service.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteService(${service.id})">Excluir</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function editService(id) {
    const service = services.find(s => s.id === id);
    if (!service) return;

    document.getElementById('serviceModalTitle').textContent = 'Editar Serviço';
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceDuration').value = service.duration;
    document.getElementById('serviceDescription').value = service.description;

    openModal('serviceModal');
}

function deleteService(id) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        services = services.filter(s => s.id !== id);
        localStorage.setItem('services', JSON.stringify(services));
        loadServices();
        updateServiceOptions();
    }
}

function saveService() {
    const serviceData = {
        name: document.getElementById('serviceName').value,
        price: parseFloat(document.getElementById('servicePrice').value),
        duration: parseInt(document.getElementById('serviceDuration').value),
        description: document.getElementById('serviceDescription').value
    };

    const id = document.getElementById('serviceId').value;
    
    if (id) {
        // Edit existing service
        const index = services.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            services[index] = { ...serviceData, id: parseInt(id) };
        }
    } else {
        // Add new service
        const newId = Math.max(...services.map(s => s.id), 0) + 1;
        services.push({ ...serviceData, id: newId });
    }

    localStorage.setItem('services', JSON.stringify(services));

    closeModal('serviceModal');
    loadServices();
    updateServiceOptions();
    document.getElementById('serviceForm').reset();
}

// Clients Functions
function loadClients() {
    const tbody = document.getElementById('clientsTable');
    tbody.innerHTML = '';

    // Re-carrega clientes do localStorage para garantir que estejam atualizados
    clients = JSON.parse(localStorage.getItem('registeredUsers')) || [];


    clients.forEach(client => {
        const appointmentCount = appointments.filter(a => a.clientId === client.id).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="ID">${client.id}</td>
            <td data-label="Nome">${client.name}</td>
            <td data-label="Email">${client.email}</td>
            <td data-label="Telefone">${client.phone}</td>
            <td data-label="Agendamentos">${appointmentCount}</td>
            <td data-label="Ações">
                <div class="action-buttons">
                    <button class="action-btn delete-btn" onclick="deleteClient(${client.id})" title="Excluir">
                        <i class="fas fa-trash"></i> </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    document.getElementById('clientModalTitle').textContent = 'Editar Cliente';
    document.getElementById('clientId').value = client.id;
    document.getElementById('clientName').value = client.name;
    document.getElementById('clientEmail').value = client.email;
    document.getElementById('clientPhone').value = client.phone;

    openModal('clientModal');
}

function deleteClient(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        clients = clients.filter(c => c.id !== id);
        localStorage.setItem('registeredUsers', JSON.stringify(clients));
        loadClients();
        updateClientOptions();
    }
}

function saveClient() {
    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value
    };

    const id = document.getElementById('clientId').value;
    
    if (id) {
        // Edit existing client
        const index = clients.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            clients[index] = { ...clientData, id: parseInt(id) };
        }
    } else {
        // Add new client
        const newId = Math.max(...clients.map(c => c.id), 0) + 1;
        clients.push({ ...clientData, id: newId });
    }

    localStorage.setItem('registeredUsers', JSON.stringify(clients));

    closeModal('clientModal');
    loadClients();
    updateClientOptions();
    document.getElementById('clientForm').reset();
}

// Update Options Functions
function updateClientOptions() {
    const select = document.getElementById('appointmentClient');
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });
}

function updateServiceOptions() {
    const select = document.getElementById('appointmentService');
    select.innerHTML = '<option value="">Selecione um serviço</option>';
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} - ${formatCurrency(service.price)}`;
        select.appendChild(option);
    });
}

// Dashboard Functions
function updateDashboard() {
    // Re-carrega appointments, clients e services do localStorage para garantir que estejam atualizados
    appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    clients = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    services = JSON.parse(localStorage.getItem('services')) || [];
    vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];


    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    
    // Update stats
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = todayAppointments.length;
    
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyAppointments = appointments.filter(a => a.date.startsWith(thisMonth));
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = monthlyAppointments.length;
    
    const monthlyRevenue = monthlyAppointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + a.value, 0);
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = formatCurrency(monthlyRevenue);

    // Update upcoming appointments on dashboard
    const dashboardAppointmentsTable = document.getElementById('dashboardAppointments');
    if (dashboardAppointmentsTable) {
        dashboardAppointmentsTable.innerHTML = '';
        todayAppointments.forEach(appointment => {
            const clientName = getClientName(appointment.clientId);
            const serviceName = getServiceName(appointment.serviceId);
            const vehicleInfo = appointment.vehicle ? getVehicleInfo(appointment.vehicle.id, appointment.vehicle.plate) : 'Veículo não encontrado';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Cliente">${clientName}</td>
                <td data-label="Veículo">${vehicleInfo}</td>
                <td data-label="Serviço">${serviceName}</td>
                <td data-label="Data">${formatDate(appointment.date)}</td>
                <td data-label="Horário">${appointment.time}</td>
                <td data-label="Status">${getStatusBadge(appointment.status)}</td>
            `;
            dashboardAppointmentsTable.appendChild(row);
        });
        if (todayAppointments.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" style="text-align: center; color: var(--dark-100);">Nenhum agendamento para hoje.</td>`;
            dashboardAppointmentsTable.appendChild(row);
        }
    }
}

// Search Functions
function setupSearch() {
    document.getElementById('appointmentSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#appointmentsTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('serviceSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.service-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('clientSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#clientsTable tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('statusFilter').addEventListener('change', function(e) {
        const status = e.target.value;
        const rows = document.querySelectorAll('#appointmentsTable tr');
        
        rows.forEach(row => {
            if (!status) {
                row.style.display = '';
            } else {
                const statusCell = row.querySelector('.status-badge');
                if (statusCell && statusCell.classList.contains(`status-${status}`)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    });

    document.getElementById('dashboardSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#dashboardAppointments tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

function init() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    document.getElementById('sidebarToggle').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
    });

    document.getElementById('mobileMenuBtn').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        sidebar.classList.toggle('mobile-visible');
        overlay.classList.toggle('active');
    });

    document.getElementById('overlay').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('mobile-visible');
        this.classList.remove('active');
    });

    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal') || this.closest('.modal').id;
            closeModal(modalId);
        });
    });

    document.getElementById('saveAppointmentBtn').addEventListener('click', saveAppointment);
    document.getElementById('saveServiceBtn').addEventListener('click', saveService);
    document.getElementById('saveClientBtn').addEventListener('click', saveClient);

    document.getElementById('newAppointmentBtn').addEventListener('click', function() {
        document.getElementById('appointmentModalTitle').textContent = 'Novo Agendamento';
        document.getElementById('appointmentForm').reset();
        document.getElementById('appointmentId').value = '';
        openModal('appointmentModal');
    });

    document.getElementById('addAppointmentBtn').addEventListener('click', function() {
        document.getElementById('appointmentModalTitle').textContent = 'Novo Agendamento';
        document.getElementById('appointmentForm').reset();
        document.getElementById('appointmentId').value = '';
        openModal('appointmentModal');
    });

    document.getElementById('addServiceBtn').addEventListener('click', function() {
        document.getElementById('serviceModalTitle').textContent = 'Novo Serviço';
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceId').value = '';
        openModal('serviceModal');
    });

    document.getElementById('addClientBtn').addEventListener('click', function() {
        document.getElementById('clientModalTitle').textContent = 'Novo Cliente';
        document.getElementById('clientForm').reset();
        document.getElementById('clientId').value = '';
        openModal('clientModal');
    });

    document.getElementById('appointmentService').addEventListener('change', function() {
        const serviceId = parseInt(this.value);
        const service = services.find(s => s.id === serviceId);
        if (service) {
            document.getElementById('appointmentValue').value = service.price;
        }
    });

    setupSearch();

    updateClientOptions();
    updateServiceOptions();
    updateDashboard();
    loadAppointments();

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });

    document.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            sidebar.classList.remove('mobile-visible');
            overlay.classList.remove('active');
        }
    });

    const logoutButton = document.getElementById('logoutBtnSidebar');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão Desconectar clicado. Redirecionando...');
            window.location.href = 'admlogin.html';
        });
    } else {
        console.warn("Elemento 'logoutBtnSidebar' não encontrado. Verifique o ID no HTML.");
    }
}

document.addEventListener('DOMContentLoaded', init);