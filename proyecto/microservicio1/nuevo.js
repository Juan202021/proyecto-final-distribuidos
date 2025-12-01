const express = require('express');
const app = express();
const port = 3001;

// Middleware para parsear JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Microservicio 1!');
});

app.post('/nuevo', (req, res) => {
  const {cantidad, digitos} = req.body;
  res.json({ 
    idSolicitud: 0,
  });
});

app.listen(port, () => {
  console.log(`Microservice 1 listening at http://localhost:${port}`);
});