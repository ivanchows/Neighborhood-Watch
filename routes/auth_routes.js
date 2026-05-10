import { Router } from 'express';
import xss from 'xss';

import {
  createUser,
  authenticateUser,
  checkString,
  checkName,
  checkEmail,
  checkGender,
  checkAge,
  checkAddress,
  checkPassword
} from './users.js';
import { getAllIncidents } from './data/incidentfunctions.js';
import { incidents as incidentCol } from './config/mongoCollections.js';

const router = Router();

function cleanInput(val) {
  if (typeof val !== 'string') return val;
  return xss(val);
}

function cleanAddress(address) {
  if (!address || typeof address !== 'object' || Array.isArray(address)) return address;

  return {
    Street: cleanInput(address.Street),
    City: cleanInput(address.City),
    State: cleanInput(address.State),
    zipCode: cleanInput(address.zipCode)
  };
}

const SEED_INCIDENTS = [
  { category: 'Suspicious Activity', Title: 'Suspicious vehicle parked overnight', description: 'Black sedan with no plates parked across two spaces since around 11pm. Multiple residents noted it doesn\'t belong to anyone on the block. Police have been notified for a wellness check.', location: 'Washington St & 7th St, Hoboken', status: 'active', likes: 12, lat: 40.7459, lng: -74.0285 },
  { category: 'Animal', Title: 'Loose dog reported near Pier A', description: 'Medium-sized brown dog, no visible collar, friendly but disoriented. Last seen heading toward Sinatra Drive. Animal control contacted.', location: 'Pier A Park, NW corner, Hoboken', status: 'authorities notified', likes: 8, lat: 40.7365, lng: -74.0276 },
  { category: 'Utilities', Title: 'Power outage on block', description: 'Power has been out for the entire 400 block since 9:42 PM. PSE&G has been notified, ETA unknown. Streetlights and traffic signal also affected.', location: 'Hudson St between 4th and 5th, Hoboken', status: 'active', likes: 24, lat: 40.7409, lng: -74.0298 },
  { category: 'Traffic', Title: 'Minor traffic incident, fender bender', description: 'Two-car collision at the intersection. No injuries reported. Hoboken PD on scene, traffic now flowing again.', location: 'Observer Hwy & Newark St, Hoboken', status: 'resolved', likes: 6, lat: 40.7374, lng: -74.0418 },
  { category: 'Theft', Title: 'Package theft — suspect identified', description: 'Doorbell camera caught the suspect on the 800 block. Footage shared with HPD and posted to the building\'s thread. Most packages were recovered from a nearby alley.', location: 'Garden St residential block, Hoboken', status: 'resolved', likes: 31, lat: 40.7479, lng: -74.0328 }
];

router.route('/').get(async (req, res) => {
  let recentIncidents = [];
  try {
    let all = await getAllIncidents();

    // Seed demo incidents if none of the static titles exist yet
    const titles = all.map(i => i.Title);
    if (!titles.includes('Suspicious vehicle parked overnight')) {
      const col = await incidentCol();
      const today = new Date();
      const postedDate = String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0') + '/' + today.getFullYear();
      await col.insertMany(SEED_INCIDENTS.map(s => ({
        ...s,
        postedDate,
        reportedBy: 'Sentry Demo',
        userId: '000000000000000000000000',
        verified: '',
        likedBy: [],
        notifications: [],
        comments: []
      })));
      all = await getAllIncidents();
    }

    recentIncidents = all.slice(-5).reverse();
  } catch (_) {}

  const mapIncidents = recentIncidents
    .filter(i => i.lat && i.lng)
    .map(i => ({ _id: i._id.toString(), title: i.Title, loc: i.location, status: i.status, lat: i.lat, lng: i.lng }));

  const ctx = { title: 'Home', recentIncidents, mapIncidentsJSON: JSON.stringify(mapIncidents) };
  if (!req.session.user) return res.render('home', { ...ctx, notLoggedIn: true });
  res.render('home', { ...ctx, loggedIn: true, user: req.session.user });
});

router
  .route('/register')
  .get(async (req, res) => {
    if (req.session.user) {
      res.redirect('/');
      return;
    }

    res.render('register', { title: 'Register' });
  })
  .post(async (req, res) => {
    let formData = req.body;

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.gender || !formData.age || !formData.address || !formData.password || !formData.confirmPassword) {
      res.status(400).render('register', {
        title: 'Register',
        hasError: true,
        error: 'All fields must be supplied.'
      });
      return;
    }

    let firstName = '';
    let lastName = '';
    let email = '';
    let gender = '';
    let age = '';
    let address = {};
    let password = '';
    let confirmPassword = '';

    try {
      firstName = checkName(cleanInput(formData.firstName), 'firstName');
      lastName = checkName(cleanInput(formData.lastName), 'lastName');
      email = checkEmail(cleanInput(formData.email));
      gender = checkGender(cleanInput(formData.gender));
      age = checkAge(cleanInput(formData.age));
      address = checkAddress(cleanAddress(formData.address));
      password = checkPassword(cleanInput(formData.password));
      confirmPassword = checkString(cleanInput(formData.confirmPassword), 'confirmPassword');

      if (password !== confirmPassword) throw `password and confirmPassword must match.`;
    } catch (e) {
      res.status(400).render('register', {
        title: 'Register',
        hasError: true,
        error: e
      });
      return;
    }

    try {
      const result = await createUser(
        firstName,
        lastName,
        email,
        gender,
        age,
        address,
        password
      );

      if (result.userCreated === true) {
        res.redirect('/signin');
        return;
      }

      res.status(500).render('error', {
        title: 'Error',
        error: 'Internal Server Error'
      });
      return;
    } catch (e) {
      res.status(400).render('register', {
        title: 'Register',
        hasError: true,
        error: e
      });
      return;
    }
  });

router
  .route('/signin')
  .get(async (req, res) => {
    if (req.session.user) {
      res.redirect('/');
      return;
    }

    res.render('signin', { title: 'Sign In' });
  })
  .post(async (req, res) => {
    let formData = req.body;

    if (!formData.email || !formData.password) {
      res.status(400).render('signin', {
        title: 'Sign In',
        hasError: true,
        error: 'Both email and password must be supplied.'
      });
      return;
    }

    let email = '';
    let password = '';

    try {
      email = checkEmail(cleanInput(formData.email));
      password = checkPassword(cleanInput(formData.password));
    } catch (e) {
      res.status(400).render('signin', {
        title: 'Sign In',
        hasError: true,
        error: e
      });
      return;
    }

    try {
      const user = await authenticateUser(email, password);

      req.session.user = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        age: user.age,
        address: user.address,
        role: user.role,
        trustRating: user.trustRating,
        filedReports: user.filedReports,
        verifiedReports: user.verifiedReports,
        watchListZip: user.watchListZip,
        accountMade: user.accountMade
      };

      res.redirect('/');
      return;
    } catch (e) {
      res.status(400).render('signin', {
        title: 'Sign In',
        hasError: true,
        error: 'Either the email or password is invalid.'
      });
      return;
    }
  });

router.route('/signout').get(async (req, res) => {
  if (!req.session.user) {
    res.redirect('/signin');
    return;
  }

  req.session.destroy(() => {
    res.render('signout', { title: 'Signed Out' });
  });
});

export default router;
