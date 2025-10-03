const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://Daniel:Daniel@alphabetdb.52be42d.mongodb.net/alphabetDB?retryWrites=true&w=majority&appName=alphabetDB')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error:', err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String  // 'docente' o 'alumno'
});

const User = mongoose.model('User', userSchema);

// Ruta para login
app.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  const user = await User.findOne({ username, role });
  if (user && await bcrypt.compare(password, user.password)) {
    if (role === 'docente') {
      res.redirect('/docente-dashboard.html');
    } else if (role === 'alumno') {
      res.redirect('/alumno-ready.html');
    }
  } else {
    res.send('Usuario o contraseña incorrectos');
  }
});

// Ruta para registro
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username, role });
    if (existingUser) {
      return res.send('Usuario ya existe para este rol. Intenta con otro nombre de usuario.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();
    res.redirect('/index.html'); // Redirige al inicio tras registro exitoso
  } catch (err) {
    res.send('Error al registrar usuario: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});