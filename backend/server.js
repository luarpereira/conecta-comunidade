require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API Conecta Comunidade no ar' });
});

// Lista todas as categorias
app.get('/categorias', async (req, res) => {
  const { data, error } = await supabase.from('categorias').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Lista pedidos de ajuda (com nome da categoria junto)
app.get('/pedidos', async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos_ajuda')
    .select('*, categorias(nome)')
    .order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Cria um novo pedido de ajuda
app.post('/pedidos', async (req, res) => {
  const { usuario_id, categoria_id, descricao, localizacao } = req.body;
  if (!descricao || !categoria_id) {
    return res.status(400).json({ error: 'descricao e categoria_id são obrigatórios' });
  }
  const { data, error } = await supabase
    .from('pedidos_ajuda')
    .insert([{ usuario_id, categoria_id, descricao, localizacao }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// Cria um novo usuário
app.post('/usuarios', async (req, res) => {
  const { nome, email, tipo } = req.body;
  if (!nome || !email || !tipo) {
    return res.status(400).json({ error: 'nome, email e tipo são obrigatórios' });
  }
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nome, email, tipo }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));