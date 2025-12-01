const express = require('express');
const app = express();
const port = 3003;

// Middleware para parsear JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Microservicio 3!');
});

app.post('/resultado', (req, res) => {
  const {idSolicitud} = req.body;
  res.json({ 
    numeros: []
  });
});

app.listen(port, () => {
  console.log(`Microservice 3 listening at http://localhost:${port}`);
});