function showLoading() {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.classList.remove('d-none');
                document.body.style.overflow = 'hidden';
            }
        }

        function hideLoading() {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('d-none');
                document.body.style.overflow = '';
            }
        }

        // Services data
        const services = [
            {
                id: 'lavagem-completa',
                name: 'Lavagem Completa',
                description: 'Limpeza completa interna e externa do seu veículo com produtos premium.',
                price: 150,
                duration: 120,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.4 16 9 16 9s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7h-2.3c-.7 0-1.4.3-1.9.8L6 8.5V13h0c0 1.1.9 2 2 2h1.5"></path>
                    <path d="M9 17h1"></path>
                    <path d="M17 17h1"></path>
                    <circle cx="7.5" cy="17.5" r="2.5"></circle>
                    <circle cx="16.5" cy="17.5" r="2.5"></circle>
                </svg>`
            },
            {
                id: 'polimento',
                name: 'Polimento',
                description: 'Polimento profissional para remover riscos e restaurar o brilho da pintura.',
                price: 280,
                duration: 180,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20a8 8 0 0 0 8-8"></path>
                    <path d="M12 12v8"></path>
                    <path d="M12 12a8 8 0 0 1-8-8"></path>
                    <path d="M12 4v8"></path>
                    <path d="m9 12 3-3 3 3"></path>
                </svg>`
            },
            {
                id: 'cristalizacao',
                name: 'Cristalização',
                description: 'Proteção duradoura que mantém seu carro brilhando por mais tempo.',
                price: 400,
                duration: 240,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>`
            },
            {
                id: 'higienizacao',
                name: 'Higienização',
                description: 'Limpeza profunda de estofados e ar condicionado.',
                price: 200,
                duration: 150,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>`
            },
            {
                id: 'enceramento',
                name: 'Enceramento',
                description: 'Aplicação de cera premium para proteção e brilho intenso.',
                price: 180,
                duration: 90,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>`
            },
            {
                id: 'lavagem-simples',
                name: 'Lavagem Simples',
                description: 'Lavagem externa básica com produtos de qualidade.',
                price: 80,
                duration: 60,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 2v4"></path>
                    <path d="M5 3h4"></path>
                    <path d="M9 8.5l1.9-1.9"></path>
                    <path d="M14.1 6.6L16 8.5"></path>
                    <path d="M15 2v4"></path>
                    <path d="M12 3h4"></path>
                    <circle cx="12" cy="14" r="8"></circle>
                    <path d="M12 18l-2-2 2-2 2 2-2 2"></path>
                </svg>`
            },
            {
                id: 'detalhamento',
                name: 'Detalhamento Completo',
                description: 'Serviço premium com todos os cuidados para seu veículo.',
                price: 600,
                duration: 360,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>`
            },
            {
                id: 'pneus-rodas',
                name: 'Limpeza de Pneus e Rodas',
                description: 'Limpeza especializada e cuidado com pneus e rodas.',
                price: 120,
                duration: 75,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                </svg>`
            },
            {
                id: 'motor',
                name: 'Limpeza do Motor',
                description: 'Limpeza e desengordurante profissional do motor.',
                price: 160,
                duration: 120,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>`
            },
            {
                id: 'vidros',
                name: 'Limpeza de Vidros',
                description: 'Limpeza especializada de todos os vidros do veículo.',
                price: 60,
                duration: 45,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>`
            }
        ];

        // Mock data for vehicles
        const userVehicles = [
            {
                placa: 'ABC1D23',
                marca: 'Volkswagen',
                modelo: 'Golf',
                tipo: 'Hatch',
                cor: 'Preto'
            },
            {
                placa: 'XYZ4W56',
                marca: 'Toyota',
                modelo: 'Corolla',
                tipo: 'Sedan',
                cor: 'Prata'
            }
        ];

        // Booking system variables
        let currentServiceId = null;
        let currentSlide = 0;
        let appointmentCounter = 1;

        // Time slots (working hours: 8:00 to 18:00)
        const timeSlots = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30'
        ];

        // Storage functions
        function getBookings() {
            return JSON.parse(localStorage.getItem('bookings')) || [];
        }

        function saveBooking(booking) {
            const bookings = getBookings();
            booking.id = `booking_${Date.now()}_${appointmentCounter++}`;
            bookings.push(booking);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            return booking;
        }

        function removeBooking(bookingId) {
            const bookings = getBookings();
            const filteredBookings = bookings.filter(b => b.id !== bookingId);
            localStorage.setItem('bookings', JSON.stringify(filteredBookings));
        }

        // Generate services carousel
        function generateServices() {
            const container = document.getElementById('servicesContainer');
            container.innerHTML = services.map(service => `
                <div class="service-card">
                    <div class="service-icon">
                        ${service.icon}
                    </div>
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                    <p class="duration">⏱️ ${service.duration} minutos</p>
                    <p class="price">R$ ${service.price.toFixed(2)}</p>
                    <button class="btn" onclick="openBookingModal('${service.id}')">Agendar</button>
                </div>
            `).join('');

            generateIndicators();
        }

        // Generate carousel indicators
        function generateIndicators() {
            const indicators = document.getElementById('carouselIndicators');
            const totalSlides = Math.ceil(services.length / getServicesPerView());
            
            indicators.innerHTML = Array.from({length: totalSlides}, (_, i) => 
                `<div class="indicator ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`
            ).join('');
        }

        // Get services per view based on screen size
        function getServicesPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        // Carousel navigation
        function nextSlide() {
            const servicesPerView = getServicesPerView();
            const maxSlides = Math.ceil(services.length / servicesPerView) - 1;
            currentSlide = currentSlide >= maxSlides ? 0 : currentSlide + 1;
            updateCarousel();
        }

        function prevSlide() {
            const servicesPerView = getServicesPerView();
            const maxSlides = Math.ceil(services.length / servicesPerView) - 1;
            currentSlide = currentSlide <= 0 ? maxSlides : currentSlide - 1;
            updateCarousel();
        }

        function goToSlide(slide) {
            currentSlide = slide;
            updateCarousel();
        }

        function updateCarousel() {
            const container = document.getElementById('servicesContainer');
            const servicesPerView = getServicesPerView();
            const slideWidth = 100 / servicesPerView;
            const translateX = -(currentSlide * slideWidth * servicesPerView);
            
            container.style.transform = `translateX(${translateX}%)`;
            
            // Update indicators
            document.querySelectorAll('.indicator').forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }

        // Open booking modal
        function openBookingModal(serviceId) {
            currentServiceId = serviceId;
            const service = services.find(s => s.id === serviceId);
            
            document.getElementById('bookingTitle').textContent = `Agendar ${service.name}`;
            document.getElementById('customerName').value = document.getElementById('userName').textContent;
            document.getElementById('customerPhone').value = document.getElementById('userPhone').textContent;
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('bookingDate').min = today;
            document.getElementById('bookingDate').value = today;
            
            populateVehicleSelect();
            generateTimeSlots();
            updateBookingSummary();
            
            document.getElementById('bookingModal').style.display = 'block';
        }

        // Populate vehicle select
        function populateVehicleSelect() {
            const select = document.getElementById('vehicleSelect');
            select.innerHTML = '<option value="">Selecione um veículo</option>' +
                userVehicles.map((vehicle, index) => 
                    `<option value="${index}">${vehicle.marca} ${vehicle.modelo} - ${vehicle.placa}</option>`
                ).join('');
        }

        // Generate time slots
        function generateTimeSlots() {
            const container = document.getElementById('timeSlots');
            const selectedDate = document.getElementById('bookingDate').value;
            const bookings = getBookings();
            
            container.innerHTML = timeSlots.map(time => {
                const isBooked = bookings.some(booking => 
                    booking.date === selectedDate && booking.time === time
                );
                
                return `
                    <div class="time-slot ${isBooked ? 'unavailable' : ''}" 
                        onclick="${isBooked ? '' : `selectTimeSlot('${time}')`}">
                        ${time}
                    </div>
                `;
            }).join('');
        }

        // Select time slot
        function selectTimeSlot(time) {
            document.querySelectorAll('.time-slot').forEach(slot => {
                slot.classList.remove('selected');
            });
            
            event.target.classList.add('selected');
            updateBookingSummary();
        }

        // Update booking summary
        function updateBookingSummary() {
            const service = services.find(s => s.id === currentServiceId);
            const selectedDate = document.getElementById('bookingDate').value;
            const selectedTime = document.querySelector('.time-slot.selected')?.textContent;
            const vehicleIndex = document.getElementById('vehicleSelect').value;
            
            if (service && selectedDate && selectedTime && vehicleIndex !== '') {
                const vehicle = userVehicles[vehicleIndex];
                
                document.getElementById('summaryService').textContent = service.name;
                document.getElementById('summaryDate').textContent = new Date(selectedDate).toLocaleDateString('pt-BR');
                document.getElementById('summaryTime').textContent = selectedTime;
                document.getElementById('summaryVehicle').textContent = `${vehicle.marca} ${vehicle.modelo} - ${vehicle.placa}`;
                document.getElementById('summaryPrice').textContent = `R$ ${service.price.toFixed(2)}`;
                document.getElementById('summaryDuration').textContent = `${service.duration} minutos`;
                
                document.getElementById('bookingSummary').style.display = 'block';
            } else {
                document.getElementById('bookingSummary').style.display = 'none';
            }
        }

        // Handle booking form submission
        document.getElementById('bookingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const service = services.find(s => s.id === currentServiceId);
            const selectedTime = document.querySelector('.time-slot.selected')?.textContent;
            const vehicleIndex = document.getElementById('vehicleSelect').value;
            
            if (!selectedTime) {
                alert('Por favor, selecione um horário.');
                return;
            }
            
            if (vehicleIndex === '') {
                alert('Por favor, selecione um veículo.');
                return;
            }
            
            const booking = {
                serviceId: currentServiceId,
                serviceName: service.name,
                date: document.getElementById('bookingDate').value,
                time: selectedTime,
                customerName: document.getElementById('customerName').value,
                customerPhone: document.getElementById('customerPhone').value,
                vehicle: userVehicles[vehicleIndex],
                price: service.price,
                duration: service.duration,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            };
            
            saveBooking(booking);
            closeModal('bookingModal');
            createAppointmentCards();
            alert('Agendamento realizado com sucesso!');
        });

        // Create appointment cards
        function createAppointmentCards() {
            const appointmentsList = document.getElementById('appointmentsList');
            const bookings = getBookings().sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
            
            if (bookings.length === 0) {
                appointmentsList.innerHTML = '<p style="text-align: center; color: #666;">Nenhum agendamento encontrado.</p>';
                return;
            }
            
            appointmentsList.innerHTML = bookings.map(booking => `
                <div class="appointment-card">
                    <button class="cancel-appointment-btn" onclick="cancelAppointment('${booking.id}')">
                        Cancelar
                    </button>
                    <h5>${booking.serviceName}</h5>
                    <div class="appointment-info">
                        <p><strong>Data:</strong> ${new Date(booking.date).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Horário:</strong> ${booking.time}</p>
                        <p><strong>Veículo:</strong> ${booking.vehicle.marca} ${booking.vehicle.modelo} - ${booking.vehicle.placa}</p>
                        <p><strong>Preço:</strong> R$ ${booking.price.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span style="color: #0d404f; font-weight: bold;">Confirmado</span></p>
                    </div>
                </div>
            `).join('');
        }

        // Cancel appointment
        function cancelAppointment(bookingId) {
            if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                removeBooking(bookingId);
                createAppointmentCards();
                alert('Agendamento cancelado com sucesso!');
            }
        }

        // Function to create vehicle cards
        function createVehicleCards() {
            const vehiclesList = document.getElementById('vehiclesList');
            
            if (userVehicles.length === 0) {
                vehiclesList.innerHTML = '<p style="text-align: center; color: #666;">Nenhum veículo cadastrado.</p>';
                return;
            }
            
            vehiclesList.innerHTML = userVehicles.map((vehicle, index) => `
                <div class="vehicle-card">
                    <button class="edit-vehicle-btn" data-index="${index}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <h4>${vehicle.marca} ${vehicle.modelo}</h4>
                    <div class="vehicle-info">
                        <p><strong>Placa:</strong> ${vehicle.placa}</p>
                        <p><strong>Tipo:</strong> ${vehicle.tipo}</p>
                        <p><strong>Cor:</strong> ${vehicle.cor}</p>
                    </div>
                </div>
            `).join('');

            // Add event listeners to edit buttons
            document.querySelectorAll('.edit-vehicle-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.currentTarget.dataset.index;
                    openEditVehicleModal(index);
                });
            });
        }

        // Modal functionality
        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function openEditProfileModal() {
            const editName = document.getElementById('editName');
            const editEmail = document.getElementById('editEmail');
            const editPhone = document.getElementById('editPhone');

            editName.value = document.getElementById('userName').textContent;
            editEmail.value = document.getElementById('userEmail').textContent;
            editPhone.value = document.getElementById('userPhone').textContent;

            openModal('editProfileModal');
        }

        function openEditVehicleModal(index) {
            const vehicle = userVehicles[index];
            document.getElementById('editVehicleIndex').value = index;
            document.getElementById('editPlaca').value = vehicle.placa;
            document.getElementById('editMarca').value = vehicle.marca;
            document.getElementById('editModelo').value = vehicle.modelo;
            document.getElementById('editTipo').value = vehicle.tipo;
            document.getElementById('editCor').value = vehicle.cor;

            openModal('editVehicleModal');
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            // Esconde o loading assim que o DOM desta página estiver completamente carregado
            hideLoading();

            // Generate services carousel
            generateServices();
            
            // Create vehicle and appointment cards
            createVehicleCards();
            createAppointmentCards();
            
            // Carousel navigation
            document.getElementById('nextBtn').addEventListener('click', nextSlide);
            document.getElementById('prevBtn').addEventListener('click', prevSlide);
            
            // Auto-play carousel
            setInterval(nextSlide, 5000);
            
            // Date change event
            document.getElementById('bookingDate').addEventListener('change', generateTimeSlots);
            document.getElementById('vehicleSelect').addEventListener('change', updateBookingSummary);
            
            // Sidebar functionality
            const profileLink = document.getElementById('profileLink');
            const sidebar = document.getElementById('sidebar');
            const closeSidebar = document.getElementById('closeSidebar');
            const logoutBtn = document.getElementById('logoutBtn');
            const editProfileBtn = document.querySelector('.edit-profile-btn');
            const registerVehicleLink = document.getElementById('registerVehicleLink'); // Pega o link "Cadastrar Veículo"

            // Show sidebar
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                sidebar.classList.add('visible');
            });

            // Hide sidebar
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('visible');
            });

            // Close sidebar when clicking outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !profileLink.contains(e.target) && sidebar.classList.contains('visible')) {
                    sidebar.classList.remove('visible');
                }
            });

            // Edit profile button
            editProfileBtn.addEventListener('click', openEditProfileModal);

            // Close modals
            document.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', () => {
                    closeModal('editProfileModal');
                    closeModal('editVehicleModal');
                    closeModal('bookingModal');
                });
            });

            // Handle profile edit form submission
            document.getElementById('editProfileForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('editName').value;
                const email = document.getElementById('editEmail').value;
                const phone = document.getElementById('editPhone').value;

                // Update the profile information
                document.getElementById('userName').textContent = name;
                document.getElementById('userEmail').textContent = email;
                document.getElementById('userPhone').textContent = phone;

                closeModal('editProfileModal');
                alert('Perfil atualizado com sucesso!');
            });

            // Handle vehicle edit form submission
            document.getElementById('editVehicleForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const index = document.getElementById('editVehicleIndex').value;
                const vehicle = {
                    placa: document.getElementById('editPlaca').value,
                    marca: document.getElementById('editMarca').value,
                    modelo: document.getElementById('editModelo').value,
                    tipo: document.getElementById('editTipo').value,
                    cor: document.getElementById('editCor').value
                };

                // Update the vehicle in the array
                userVehicles[index] = vehicle;
                createVehicleCards(); // Refresh the vehicle list
                closeModal('editVehicleModal');
                alert('Veículo atualizado com sucesso!');
            });

            // Logout functionality (MODIFICADO)
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Impede o comportamento padrão do botão
                if (confirm('Deseja realmente sair?')) {
                    localStorage.clear();
                    showLoading(); // MOSTRA O LOADING
                    setTimeout(() => {
                        window.location.href = 'register.html'; // Redireciona para register.html
                    }, 1500); // Atraso para ver o loading
                }
            });

            // "Cadastrar Veículo" link functionality (NOVO)
            if (registerVehicleLink) {
                registerVehicleLink.addEventListener('click', (e) => {
                    e.preventDefault(); // Impede o comportamento padrão do link
                    showLoading(); // MOSTRA O LOADING
                    setTimeout(() => {
                        window.location.href = 'car.html'; // Redireciona para car.html
                    }, 1500); // Atraso para ver o loading
                });
            }

            // Handle window resize
            window.addEventListener('resize', () => {
                generateIndicators();
                updateCarousel();
            });
        });