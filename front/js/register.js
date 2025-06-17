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

            var btnsignin = document.querySelector("#signin");
            var btnsignup = document.querySelector("#signup");
            var body = document.querySelector("body");
            var enterBtn = document.querySelector("#enter-btn");
            var adminLoginLink = document.getElementById("adminLoginLink"); // Pega o link para adm login

            btnsignin.addEventListener("click", function () {
                body.className = "sign-in-js";
            });

            btnsignup.addEventListener("click", function () {
                body.className = "sign-up-js"
            });

            // Evento para o botão "Entrar" (para clientes)
            if (enterBtn) { // Verifica se o botão existe
                enterBtn.addEventListener("click", function(event) {
                    event.preventDefault(); // Evita recarregar a página
                    console.log("Botão Entrar clicado — login de cliente simulado.");
                    showLoading(); // MOSTRA O LOADING
                    setTimeout(() => {
                        window.location.href = "car.html"; // Redireciona para car.html (dashboard do cliente?)
                    }, 1500); // Atraso para ver o loading
                });
            }

            // Evento para o link "Acesso Administrativo"
            if (adminLoginLink) { // Verifica se o link existe
                adminLoginLink.addEventListener("click", function(event) {
                    event.preventDefault(); // Evita o comportamento padrão do link
                    console.log("Link para login de Administrador clicado.");
                    showLoading(); // MOSTRA O LOADING
                    setTimeout(() => {
                        window.location.href = "admlogin.html"; // Redireciona para admlogin.html
                    }, 1500); // Atraso para ver o loading
                });
            }
        });