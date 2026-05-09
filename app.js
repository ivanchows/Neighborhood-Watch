import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import constructorMethod from './index.js';

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Session ----
app.use(session({
  name: 'AuthState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false
}));

// ---- Make session user available to all templates ----
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ---- Routes ----
constructorMethod(app);

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`Sentry running at http://localhost:${PORT}`);
});
