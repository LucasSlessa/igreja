const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do armazenamento do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Rota para upload de arquivo
app.post('/upload', upload.single('file'), (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const sheet_name_list = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  // Aqui você pode implementar os cálculos necessários
  // Exemplo de cálculo de média simples e ponderada:
  const mediaSimples = calcularMediaSimples(data);
  const mediaPonderada = calcularMediaPonderada(data);

  res.json({ mediaSimples, mediaPonderada });
});

// Função para calcular média simples
function calcularMediaSimples(data) {
  const valores = data.map(item => item.valor); // Ajuste 'valor' conforme sua planilha
  return valores.reduce((acc, val) => acc + val, 0) / valores.length;
}

// Função para calcular média ponderada
function calcularMediaPonderada(data) {
  const totalPonderado = data.reduce((acc, item) => acc + (item.valor * item.peso), 0); // Ajuste 'peso' conforme sua planilha
  const totalPesos = data.reduce((acc, item) => acc + item.peso, 0);
  return totalPonderado / totalPesos;
}

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
