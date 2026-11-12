// ========================================================
// 1. VERIFICAÇÃO AUTOMÁTICA DE SESSÃO E ATUALIZAÇÃO DA NAVBAR
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const navActions = document.getElementById('nav-actions');
    const navLinks = document.getElementById('nav-links');

    if (usuario && navActions) {
        // Substitui o botão "Entrar / Cadastro" pelo botão com o nome do utilizador
        navActions.innerHTML = `
            <a href="/perfil" class="btn-primary" style="text-decoration: none; display: inline-block;">
                👤 ${usuario.nome ? usuario.nome.split(' ')[0] : 'Meu Perfil'}
            </a>
        `;

        // Adiciona a hiperligação "Meu Perfil" ao menu se ainda não existir
        if (navLinks && !document.querySelector('a[href="/perfil"]')) {
            const perfilLink = document.createElement('a');
            perfilLink.href = '/perfil';
            perfilLink.textContent = 'Meu Perfil';
            
            // Marca o link como ativo se a página atual for /perfil
            if (window.location.pathname === '/perfil') {
                perfilLink.classList.add('active');
            }
            
            navLinks.appendChild(perfilLink);
        }
    }
});

// ========================================================
// 2. GESTÃO DO MODAL DE AUTENTICAÇÃO (LOGIN / CADASTRO)
// ========================================================
const modal = document.getElementById('modal-auth');
const openModalBtn = document.getElementById('open-login-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const loginBtn = document.getElementById('tab-login-btn');
const cadastroBtn = document.getElementById('tab-cadastro-btn');
const formLogin = document.getElementById('form-login');
const formCadastro = document.getElementById('form-cadastro');

// Abrir e Fechar o Modal
if (openModalBtn) openModalBtn.onclick = () => modal.classList.remove('hidden');
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.add('hidden');

// Alternar entre as abas de Entrar e Cadastrar
if (loginBtn && cadastroBtn) {
    loginBtn.onclick = () => {
        formLogin.classList.remove('hidden');
        formCadastro.classList.add('hidden');
        loginBtn.style.background = '#2563eb';
        loginBtn.style.color = 'white';
        cadastroBtn.style.background = '#f1f5f9';
        cadastroBtn.style.color = '#0f172a';
    };
    cadastroBtn.onclick = () => {
        formCadastro.classList.remove('hidden');
        formLogin.classList.add('hidden');
        cadastroBtn.style.background = '#2563eb';
        cadastroBtn.style.color = 'white';
        loginBtn.style.background = '#f1f5f9';
        loginBtn.style.color = '#0f172a';
    };
}

// ========================================================
// 3. SUBMISSÃO DO FORMULÁRIO DE LOGIN
// ========================================================
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (response.ok) {
                alert('Login efetuado com sucesso!');
                localStorage.setItem('usuario', JSON.stringify(result.user));
                window.location.href = '/perfil';
            } else {
                alert('Erro no login: ' + (result.error || 'Credenciais inválidas.'));
            }
        } catch (err) {
            console.error('Erro de conexão:', err);
            alert('Erro ao ligar ao servidor.');
        }
    });
}

// ========================================================
// 4. SUBMISSÃO DO FORMULÁRIO DE CADASTRO
// ========================================================
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('cad-nome').value;
        const email = document.getElementById('cad-email').value;
        const senha = document.getElementById('cad-senha').value;
        const tipo = document.getElementById('cad-tipo') ? document.getElementById('cad-tipo').value : 'morador';
        const cidade = document.getElementById('cad-cidade') ? document.getElementById('cad-cidade').value : 'São Paulo';
        const estado = document.getElementById('cad-estado') ? document.getElementById('cad-estado').value : 'SP';

        try {
            const response = await fetch('/api/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha, tipo, cidade, estado })
            });
            const result = await response.json();

            if (response.ok) {
                alert('Cadastro efetuado com sucesso!');
                localStorage.setItem('usuario', JSON.stringify(result.user));
                window.location.href = '/perfil';
            } else {
                alert('Erro no cadastro: ' + (result.error || 'Erro desconhecido.'));
            }
        } catch (err) {
            console.error('Erro de conexão:', err);
            alert('Erro ao ligar ao servidor.');
        }
    });
}