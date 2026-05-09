import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Handlebars setup ----
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ---- Static assets (CSS, JS, images) ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Routes ----
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/register.html', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.get('/login.html', (req, res) => {
  res.render('login', { title: 'Sign In' });
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`Sentry running at http://localhost:${PORT}`);
});
