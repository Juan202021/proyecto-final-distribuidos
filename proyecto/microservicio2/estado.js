const express = require('express');
const app = express();
const port = 3002;

// Middleware para parsear JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Microservicio 2!');
});

app.post('/estado', (req, res) => {
  const {idSolicitud} = req.body;
  res.json({ 
    total: 0, 
    generados: 0 
  });
});

app.listen(port, () => {
  console.log(`Microservice 2 listening at http://localhost:${port}`);
});