# AgendCar 2.0

Nosso **AgendCar 2.0** é uma plataforma web de agendamento de serviços para estéticas automotivas. O sistema foi projetado para facilitar a gestão de agendamentos, tanto para os clientes quanto para os administradores da estética. O objetivo é oferecer uma experiência fluida e eficiente, permitindo que os clientes agendem serviços de forma simples, enquanto os administradores gerenciam e monitoram os agendamentos em tempo real.

## Tecnologias Utilizadas

-   **Frontend**:
    * **HTML**: Utilizado para estruturar a interface de usuário.
    * **CSS**: Responsável pela estilização da interface, criando um layout responsivo.
    * **JavaScript**: Usado para a criação de funcionalidades e puxar informações da API.

-   **Backend**:
    * **Node.js com Express.js**: Framework para o desenvolvimento da API, lógica de negócios, criação de endpoints e integração com banco de dados.

-   **Banco de Dados**:
    * **MongoDB**: Banco de dados não relacional, que vai armazenar dados dos clientes, agendamentos e serviços oferecidos pela estética automotiva, escolhido pela escalabilidade e flexibilidade.

## Domínio do Problema

Esse setor enfrenta diversos desafios relacionados à organização e eficiência no processo de agendamento, tanto para os **clientes** quanto para os **administradores**. As principais dificuldades incluem:

-   **Gerenciamento de Horários**: As estéticas automotivas precisam garantir que os horários dos serviços sejam bem organizados e não sobrecarreguem os profissionais ou criem períodos ociosos.
-   **Experiência do Cliente**: O processo de agendamento deve ser simples e eficiente para os clientes, com fácil acesso aos horários disponíveis e confirmações de agendamento.
-   **Controle Administrativo**: Os administradores precisam de uma ferramenta eficaz para visualizar, editar e gerenciar os agendamentos, com foco em produtividade e controle de fluxo de trabalho.

A **agilidade e organização** são essenciais para que a estética automotiva consiga operar sem contratempos e oferecer uma experiência positiva para seus clientes.

## Escopo

O **AgendCar 2.0** tem como objetivo resolver os problemas do domínio de forma eficiente e simples. O sistema permitirá que:

### Para os **Clientes**:
-   **Agendamentos de Serviços**: O cliente poderá agendar serviços de estética automotiva diretamente pela plataforma web, escolhendo o tipo de serviço, data e horário de sua preferência sem ter que sair do conforto de sua casa e sem precisar falar com alguém.
-   **Confirmação de Agendamento**: O cliente receberá uma confirmação do agendamento, incluindo todos os detalhes relevantes, como data, horário e tipo de serviço.
-   **Notificações**: O cliente será notificado sobre qualquer alteração ou atualização em seu agendamento, garantindo comunicação constante.

### Para os **Administradores**:
-   **Visualização de Agendamentos**: O administrador poderá acessar uma interface para visualizar todos os agendamentos, permitindo uma gestão eficiente da agenda da estética.
-   **Edição e Cancelamento**: O administrador poderá editar ou cancelar agendamentos, caso seja necessário, oferecendo flexibilidade no gerenciamento.
-   **Controle de Disponibilidade**: O sistema permitirá ao administrador visualizar a disponibilidade de horários e serviços, ajustando conforme a demanda.
-   **Controle de serviços**: Será possível editar quais serão os serviços oferecidos e definir um preço e tempo médio de execução para cada um, assim controlando melhor os horários.
-   **Gráficos e estatísticas**: O administrador terá acesso a gráficos e estatísticas para comparações, assim podemos mostrar como nosso sistema faz a diferença e ele não nos abandonará :D.

### Para os **Colaboradores**:
-   **Visualização de Agendamentos**: Não há funcionalidades específicas para "colaboradores" nos arquivos fornecidos. O sistema lida com "clientes" e "administradores".

### Funcionalidades Comuns:
-   **Verificação de Disponibilidade**: O sistema verificará a disponibilidade de horários em tempo real, evitando sobrecarga de agendamentos.
-   **Histórico de Agendamentos**: O sistema manterá um histórico dos agendamentos realizados, permitindo que os administradores e clientes consultem os serviços passados.
-   **Interface Responsiva**: A plataforma será totalmente responsiva, oferecendo uma experiência de usuário fluida em diferentes dispositivos, como desktops, tablets e smartphones.
-   **Autenticação**: Implementação de login para clientes e administradores, garantindo acesso seguro à plataforma.
