// admin.js

// REMOVER OU COMENTAR TODAS AS VARIÁVEIS GLOBAIS DE DADOS INICIAIS DO localStorage
// let appointments = JSON.parse(localStorage.getItem('appointments')) || [...];
// let services = JSON.parse(localStorage.getItem('services')) || [...];
// let clients = JSON.parse(localStorage.getItem('registeredUsers')) || [];
// let vehicles = JSON.parse(localStorage.getItem('vehicles')) || [];

// Adicionar variáveis para armazenar dados carregados do backend
let currentAppointments = [];
let currentServices = [];
let currentClients = [];
let currentVehicles = [];

// Obter o token e dados do admin do localStorage
const ADMIN_TOKEN = localStorage.getItem('adminToken') || null;
const ADMIN_ID = localStorage.getItem('adminId') || null; // Novo: ID do admin
const ADMIN_NAME = localStorage.getItem('adminName') || 'Administrador';

// --- Utility Functions (manter existentes, ajustar getServiceName para _id se necessário) ---
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
    const client = currentClients.find(c => c._id === clientId); // Buscar por _id
    return client ? client.name : 'Cliente não encontrado';
}

function getVehicleInfo(vehicleId) { // Agora passamos apenas o _id do veículo
    const vehicle = currentVehicles.find(v => v._id === vehicleId); // Buscar por _id
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado';
}

function getServiceName(serviceId) { // Assumindo que serviceId no agendamento é um ID numérico.
                                    // Se você migrar serviços para _id, mude currentServices.find(s => s.id === serviceId) para s._id
    const service = currentServices.find(s => s._id === serviceId); // Buscando pelo _id do MongoDB, conforme alteramos o model Appointment
    return service ? service.name : 'Serviço não encontrado';
}

// --- Loading Overlay Functions (reutilizadas do service.js/register.js) ---
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


// --- Navigation Functions (manter, mas load functions agora são async) ---
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'appointments': 'Agendamentos',
        'services': 'Serviços',
        'clients': 'Clientes',
        'settings': 'Configurações'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';

    // Carregar dados da seção (agora assíncronas)
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
        case 'dashboard':
            updateDashboard();
            break;
    }
}

// --- Modal Functions (manter) ---
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// --- Appointments Functions (AGORA INTERAGEM COM O BACKEND) ---
async function loadAppointments() {
    const tbody = document.getElementById('appointmentsTable');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Carregando agendamentos...</td></tr>';

    try {
        // Carregar clientes, veículos e serviços ANTES dos agendamentos para mapeamento
        await loadClientsFromBackend();
        await loadVehiclesFromBackend(); // Carrega todos os veículos (admin view)
        await loadServicesFromBackend();

        const response = await fetch('https://agendcar20-production.up.railway.app//api/appointments', {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        const data = await response.json();

        if (response.ok) {
            currentAppointments = data; // Armazena os agendamentos na variável global
            tbody.innerHTML = ''; // Limpa a mensagem de carregamento

            currentAppointments.forEach(appointment => {
                const clientName = getClientName(appointment.client._id);
                const vehicleInfo = getVehicleInfo(appointment.vehicle._id);
                // serviceId agora é _id do MongoDB
                const serviceName = getServiceName(appointment.serviceId);
                const serviceDetail = currentServices.find(s => s._id === appointment.serviceId); // Buscar pelo _id
                const serviceValue = serviceDetail ? serviceDetail.price : (appointment.value || 'N/A');
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="ID">${appointment._id}</td>
                    <td data-label="Cliente">${clientName}</td>
                    <td data-label="Veículo">${vehicleInfo}</td>
                    <td data-label="Serviço">${serviceName}</td>
                    <td data-label="Data">${formatDate(appointment.date)}</td>
                    <td data-label="Horário">${appointment.time}</td>
                    <td data-label="Valor">${formatCurrency(serviceValue)}</td>
                    <td data-label="Status">${getStatusBadge(appointment.status)}</td>
                    <td data-label="Ações">
                        <div class="action-buttons">
                            <button class="action-btn edit-btn" onclick="editAppointment('${appointment._id}')" title="Editar">
                                <i class="fas fa-edit"></i> </button>
                            <button class="action-btn delete-btn" onclick="deleteAppointment('${appointment._id}')" title="Excluir">
                                <i class="fas fa-trash"></i> </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger);">Erro ao carregar agendamentos: ${data.message || 'Desconhecido'}</td></tr>`;
        }
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger);">Erro de conexão ao carregar agendamentos.</td></tr>`;
    }
}

async function editAppointment(id) {
    const appointment = currentAppointments.find(a => a._id === id);
    if (!appointment) return;

    document.getElementById('appointmentModalTitle').textContent = 'Editar Agendamento';
    document.getElementById('appointmentId').value = appointment._id;

    await updateClientOptions(); // Popula o select de clientes
    document.getElementById('appointmentClient').value = appointment.client._id;

    await updateServiceOptions(); // Popula o select de serviços
    document.getElementById('appointmentService').value = appointment.serviceId; // serviceId é _id

    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('appointmentValue').value = appointment.value;
    document.getElementById('appointmentStatus').value = appointment.status;

    openModal('appointmentModal');
}

async function deleteAppointment(id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        showLoading();
        try {
            const response = await fetch(`https://agendcar20-production.up.railway.app//api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
            });
            const data = await response.json();

            hideLoading();
            if (response.ok) {
                showToast(data.message || 'Agendamento excluído com sucesso!', 'success');
                loadAppointments(); // Recarregar
                updateDashboard();
            } else {
                showToast(data.message || 'Erro ao excluir agendamento.', 'error');
            }
        } catch (error) {
            hideLoading();
            console.error('Erro ao excluir agendamento:', error);
            showToast('Erro de conexão ao excluir agendamento.', 'error');
        }
    }
}

async function saveAppointment() {
    const form = document.getElementById('appointmentForm');
    
    const appointmentData = {
        clientId: document.getElementById('appointmentClient').value,
        serviceId: document.getElementById('appointmentService').value, // Agora é _id
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        value: parseFloat(document.getElementById('appointmentValue').value),
        status: document.getElementById('appointmentStatus').value
    };

    const id = document.getElementById('appointmentId').value;
    
    showLoading();

    try {
        let response;
        let method;
        let url;

        if (id) {
            method = 'PUT';
            url = `https://agendcar20-production.up.railway.app//api/appointments/${id}`;
        } else {
            method = 'POST';
            url = 'https://agendcar20-production.up.railway.app//api/appointments';
        }

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            },
            body: JSON.stringify(appointmentData),
        });

        const data = await response.json();
        hideLoading();

        if (response.ok) {
            showToast(data.message || 'Agendamento salvo com sucesso!', 'success');
            closeModal('appointmentModal');
            loadAppointments();
            updateDashboard();
            form.reset();
        } else {
            showToast(data.message || 'Erro ao salvar agendamento.', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Erro ao salvar agendamento:', error);
        showToast('Erro de conexão ao salvar agendamento.', 'error');
    }
}

// --- Services Functions (AGORA INTERAGEM COM O BACKEND) ---
async function loadServices() {
    const container = document.getElementById('servicesGrid');
    container.innerHTML = '<div style="text-align: center; width: 100%;">Carregando serviços...</div>';

    try {
        const response = await fetch('https://agendcar20-production.up.railway.app//api/services');
        const data = await response.json();

        if (response.ok) {
            currentServices = data; // Armazena os serviços
            container.innerHTML = ''; // Limpa a mensagem de carregamento

            currentServices.forEach(service => {
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
                            <button class="btn btn-secondary btn-sm" onclick="editService('${service._id}')">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteService('${service._id}')">Excluir</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `<div style="text-align: center; width: 100%; color: var(--danger);">Erro ao carregar serviços: ${data.message || 'Desconhecido'}</div>`;
        }
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        container.innerHTML = `<div style="text-align: center; width: 100%; color: var(--danger);">Erro de conexão ao carregar serviços.</div>`;
    }
}

async function editService(id) {
    const service = currentServices.find(s => s._id === id);
    if (!service) return;

    document.getElementById('serviceModalTitle').textContent = 'Editar Serviço';
    document.getElementById('serviceId').value = service._id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceDuration').value = service.duration;
    document.getElementById('serviceDescription').value = service.description;

    openModal('serviceModal');
}

async function deleteService(id) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        showLoading();
        try {
            const response = await fetch(`https://agendcar20-production.up.railway.app//api/services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
            });
            const data = await response.json();

            hideLoading();
            if (response.ok) {
                showToast(data.message || 'Serviço excluído com sucesso!', 'success');
                loadServices();
                updateServiceOptions();
            } else {
                showToast(data.message || 'Erro ao excluir serviço.', 'error');
            }
        } catch (error) {
            hideLoading();
            console.error('Erro ao excluir serviço:', error);
            showToast('Erro de conexão ao excluir serviço.', 'error');
        }
    }
}

async function saveService() {
    const serviceData = {
        name: document.getElementById('serviceName').value,
        price: parseFloat(document.getElementById('servicePrice').value),
        duration: parseInt(document.getElementById('serviceDuration').value),
        description: document.getElementById('serviceDescription').value,
    };

    const id = document.getElementById('serviceId').value;
    
    showLoading();

    try {
        let response;
        let method;
        let url;

        if (id) {
            method = 'PUT';
            url = `https://agendcar20-production.up.railway.app//api/services/${id}`;
        } else {
            method = 'POST';
            url = 'https://agendcar20-production.up.railway.app//api/services';
        }

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            },
            body: JSON.stringify(serviceData),
        });

        const data = await response.json();
        hideLoading();

        if (response.ok) {
            showToast(data.message || 'Serviço salvo com sucesso!', 'success');
            closeModal('serviceModal');
            loadServices();
            updateServiceOptions();
            document.getElementById('serviceForm').reset();
        } else {
            showToast(data.message || 'Erro ao salvar serviço.', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Erro ao salvar serviço:', error);
        showToast('Erro de conexão ao salvar serviço.', 'error');
    }
}

// --- Clients Functions (AGORA INTERAGEM COM O BACKEND) ---
async function loadClients() {
    const tbody = document.getElementById('clientsTable');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Carregando clientes...</td></tr>';

    try {
        const response = await fetch('https://agendcar20-production.up.railway.app//api/users', {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        const data = await response.json();

        if (response.ok) {
            currentClients = data; // Armazena os clientes
            tbody.innerHTML = ''; // Limpa a mensagem de carregamento

            currentClients.forEach(client => {
                // Para contar agendamentos, precisa que currentAppointments esteja carregado
                const appointmentCount = currentAppointments.filter(a => a.client._id === client._id).length;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="ID">${client._id}</td>
                    <td data-label="Nome">${client.name}</td>
                    <td data-label="Email">${client.email}</td>
                    <td data-label="Telefone">${client.phone || 'N/A'}</td>
                    <td data-label="Agendamentos">${appointmentCount}</td>
                    <td data-label="Ações">
                        <div class="action-buttons">
                            <button class="action-btn delete-btn" onclick="deleteClient('${client._id}')" title="Excluir">
                                <i class="fas fa-trash"></i> </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Erro ao carregar clientes: ${data.message || 'Desconhecido'}</td></tr>`;
        }
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Erro de conexão ao carregar clientes.</td></tr>`;
    }
}

// editClient e saveClient seriam implementados aqui se você adicionar um modal para cliente.
// A função deleteClient já foi explicada e adaptada no Postman, agora a lógica no frontend:
async function deleteClient(id) { // id agora é o _id do MongoDB
    if (confirm('Tem certeza que deseja excluir este cliente? Isso também excluirá seus agendamentos e veículos!')) {
        showLoading();
        try {
            const response = await fetch(`https://agendcar20-production.up.railway.app//api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
            });
            const data = await response.json();

            hideLoading();
            if (response.ok) {
                showToast(data.message || 'Cliente excluído com sucesso!', 'success');
                // Recarrega todos os dados, pois a exclusão de um cliente afeta agendamentos e veículos
                await loadClients();
                await loadAppointments();
                await loadVehiclesFromBackend(); // Recarrega para ter a lista mais recente
                updateClientOptions(); // Atualiza o select de clientes no agendamento
                updateDashboard();
            } else {
                showToast(data.message || 'Erro ao excluir cliente.', 'error');
            }
        } catch (error) {
            hideLoading();
            console.error('Erro ao excluir cliente:', error);
            showToast('Erro de conexão ao excluir cliente.', 'error');
        }
    }
}


// --- Update Options Functions (AGORA POPULAM DE currentClients E currentServices) ---
async function updateClientOptions() {
    const select = document.getElementById('appointmentClient');
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    
    // Garante que 'currentClients' esteja populado
    if (currentClients.length === 0) {
        await loadClientsFromBackend(); // Carrega clientes se ainda não estiverem carregados
    }

    currentClients.forEach(client => {
        const option = document.createElement('option');
        option.value = client._id;
        option.textContent = client.name;
        select.appendChild(option);
    });
}

async function updateServiceOptions() {
    const select = document.getElementById('appointmentService');
    select.innerHTML = '<option value="">Selecione um serviço</option>';

    // Garante que 'currentServices' esteja populado
    if (currentServices.length === 0) {
        await loadServicesFromBackend();
    }

    currentServices.forEach(service => {
        const option = document.createElement('option');
        // Usar _id se você for migrar o serviceId no model de Appointment para ObjectId
        // Por enquanto, mantenho service.id (número) para compatibilidade com o Appointments model
        option.value = service._id; // Agora é service._id
        option.textContent = `${service.name} - ${formatCurrency(service.price)}`;
        select.appendChild(option);
    });
}

// --- Helper Functions to Fetch Data from Backend ---
async function loadClientsFromBackend() {
    try {
        const response = await fetch('https://agendcar20-production.up.railway.app//api/users', {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        const data = await response.json();
        if (response.ok) {
            currentClients = data;
        } else {
            console.error('Erro ao carregar clientes do backend:', data.message);
        }
    } catch (error) {
        console.error('Erro de conexão ao carregar clientes do backend:', error);
    }
}

async function loadServicesFromBackend() {
    try {
        const response = await fetch('https://agendcar20-production.up.railway.app//api/services'); // Esta rota é pública
        const data = await response.json();
        if (response.ok) {
            currentServices = data;
        } else {
            console.error('Erro ao carregar serviços do backend:', data.message);
        }
    } catch (error) {
        console.error('Erro de conexão ao carregar serviços do backend:', error);
    }
}

async function loadVehiclesFromBackend() {
    try {
        // Como admin, queremos carregar todos os veículos para mapeamento nos agendamentos
        const response = await fetch('https://agendcar20-production.up.railway.app//api/vehicles', {
            headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        });
        const data = await response.json();
        if (response.ok) {
            currentVehicles = data;
        } else {
            console.error('Erro ao carregar veículos do backend:', data.message);
        }
    } catch (error) {
        console.error('Erro de conexão ao carregar veículos do backend:', error);
    }
}


// --- Dashboard Functions (AGORA INTERAGEM COM O BACKEND) ---
async function updateDashboard() {
    // Garante que os dados estejam carregados para o dashboard
    await loadAppointments(); // Isso também carrega clients, services, vehicles através das dependências
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = currentAppointments.filter(a => a.date === today && a.status !== 'cancelled' && a.status !== 'completed');
    
    // Update stats
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = todayAppointments.length;
    
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyAppointments = currentAppointments.filter(a => a.date.startsWith(thisMonth));
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = monthlyAppointments.length;
    
    const monthlyRevenue = monthlyAppointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + a.value, 0);
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = formatCurrency(monthlyRevenue);

    // Update upcoming appointments on dashboard
    const dashboardAppointmentsTable = document.getElementById('dashboardAppointments');
    if (dashboardAppointmentsTable) {
        dashboardAppointmentsTable.innerHTML = '';
        if (todayAppointments.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" style="text-align: center; color: var(--dark-100);">Nenhum agendamento para hoje.</td>`;
            dashboardAppointmentsTable.appendChild(row);
        } else {
             todayAppointments.sort((a, b) => a.time.localeCompare(b.time)); // Ordenar por horário
            todayAppointments.forEach(appointment => {
                const clientName = getClientName(appointment.client._id);
                const serviceName = getServiceName(appointment.serviceId);
                const vehicleInfo = getVehicleInfo(appointment.vehicle._id);

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
        }
    }
}

// --- Search Functions (manter, funcionam com os dados nas arrays globais) ---
function setupSearch() {
    document.getElementById('appointmentSearch')?.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#appointmentsTable tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('serviceSearch')?.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('clientSearch')?.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#clientsTable tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    document.getElementById('statusFilter')?.addEventListener('change', function(e) {
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

    document.getElementById('dashboardSearch')?.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#dashboardAppointments tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// --- Init Function ---
async function init() { // Adicione 'async' aqui
    // Adicione uma verificação de token aqui para proteger a página admin
    if (!ADMIN_TOKEN) {
        alert('Você precisa estar logado como administrador para acessar esta página.');
        window.location.href = 'admlogin.html';
        return; // Impede que o resto do init seja executado
    }
    document.getElementById('pageTitle').textContent = `Bem-vindo, ${ADMIN_NAME}!`; // Atualiza o título com o nome do admin

    // Carregar dados iniciais para popular as listas antes de configurar event listeners
    await loadClientsFromBackend();
    await loadServicesFromBackend();
    await loadVehiclesFromBackend();
    await updateDashboard(); // Isso também chamará loadAppointments()

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    document.getElementById('sidebarToggle')?.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
    });

    document.getElementById('mobileMenuBtn')?.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        sidebar.classList.toggle('mobile-visible');
        overlay.classList.toggle('active');
    });

    document.getElementById('overlay')?.addEventListener('click', function() {
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

    document.getElementById('saveAppointmentBtn')?.addEventListener('click', saveAppointment);
    document.getElementById('saveServiceBtn')?.addEventListener('click', saveService);

    document.getElementById('newAppointmentBtn')?.addEventListener('click', function() {
        document.getElementById('appointmentModalTitle').textContent = 'Novo Agendamento';
        document.getElementById('appointmentForm').reset();
        document.getElementById('appointmentId').value = '';
        updateClientOptions(); // Popula clientes antes de abrir o modal
        updateServiceOptions(); // Popula serviços antes de abrir o modal
        openModal('appointmentModal');
    });

    document.getElementById('addAppointmentBtn')?.addEventListener('click', function() {
        document.getElementById('appointmentModalTitle').textContent = 'Novo Agendamento';
        document.getElementById('appointmentForm').reset();
        document.getElementById('appointmentId').value = '';
        updateClientOptions();
        updateServiceOptions();
        openModal('appointmentModal');
    });

    document.getElementById('addServiceBtn')?.addEventListener('click', function() {
        document.getElementById('serviceModalTitle').textContent = 'Novo Serviço';
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceId').value = '';
        openModal('serviceModal');
    });

    document.getElementById('appointmentService')?.addEventListener('change', function() {
        const serviceId = this.value; // Pega o _id como string
        const service = currentServices.find(s => s._id === serviceId); // Busca pelo _id
        if (service) {
            document.getElementById('appointmentValue').value = service.price;
        }
    });

    setupSearch();

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });

    // Logout button handler
    const logoutButton = document.getElementById('logoutBtnSidebar');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão Desconectar clicado. Limpando token e redirecionando...');
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminToken'); // Limpa o token do localStorage
            localStorage.removeItem('adminName');
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminId');
            showLoading();
            setTimeout(() => {
                window.location.href = 'admlogin.html';
            }, 1500);
        });
    } else {
        console.warn("Elemento 'logoutBtnSidebar' não encontrado. Verifique o ID no HTML.");
    }
}

document.addEventListener('DOMContentLoaded', init);