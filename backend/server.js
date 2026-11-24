const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3333;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERRO: As variáveis SUPABASE_URL e SUPABASE_KEY não foram encontradas!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Rotas das páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/mural', (req, res) => {
    res.sendFile(path.join(frontendPath, 'mural.html'));
});

app.get('/prestadores', (req, res) => {
    res.sendFile(path.join(frontendPath, 'prestadores.html'));
});

app.get('/perfil', (req, res) => {
    res.sendFile(path.join(frontendPath, 'perfil.html'));
});

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }
    try {
        const cleanEmail = email.trim();
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', cleanEmail)
            .eq('senha', password)
            .single();

        if (error || !usuario) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const { senha, ...userWithoutPassword } = usuario;
        return res.status(200).json({ user: userWithoutPassword });
    } catch (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// Rota de Cadastro
app.post('/api/cadastro', async (req, res) => {
    let { nome, email, senha, idade, estado, cidade, tipo, telefone, servico, bio } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    if (!tipo || tipo.trim() === '') {
        tipo = 'morador';
    }

    try {
        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ nome, email: email.trim(), senha, idade, estado, cidade, tipo, telefone, servico, bio }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const { senha: p, ...userWithoutPassword } = data;
        return res.status(201).json({ user: userWithoutPassword });
    } catch (err) {
        console.error('Erro no cadastro:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota de Listagem de Todos os Usuários (Para o Mapa de Prestadores)
app.get('/api/usuarios', async (req, res) => {
    try {
        const { data, error } = await supabase.from('usuarios').select('*');
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        const usuariosPublicos = data.map(u => {
            const { senha, ...resto } = u;
            return resto;
        });
        return res.status(200).json(usuariosPublicos);
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota de Atualização do Perfil por E-mail (Segura)
app.put('/api/usuario/atualizar', async (req, res) => {
    const { emailOriginal, nome, email, idade, estado, cidade, tipo, telefone, servico, bio } = req.body;
    
    if (!emailOriginal) {
        return res.status(400).json({ error: 'E-mail original não fornecido para identificação.' });
    }

    try {
        const dadosUpdate = { 
            nome, 
            email: email ? email.trim() : undefined, 
            idade, 
            estado, 
            cidade, 
            tipo, 
            telefone, 
            servico, 
            bio 
        };

        Object.keys(dadosUpdate).forEach(key => dadosUpdate[key] === undefined && delete dadosUpdate[key]);

        const { data, error } = await supabase
            .from('usuarios')
            .update(dadosUpdate)
            .eq('email', emailOriginal.trim())
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Utilizador não encontrado na base de dados.' });
        }

        const usuarioAtualizado = data[0];
        const { senha, ...userWithoutPassword } = usuarioAtualizado;
        
        return res.status(200).json({ user: userWithoutPassword });
    } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});