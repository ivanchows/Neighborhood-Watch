function checkString(val, type) {
  if (!val) throw `${type} was not supplied.`;
  if (typeof val !== 'string') throw `${type} must be a string.`;

  val = val.trim();
  if (val.length === 0) throw `${type} cannot be an empty string.`;

  return val;
}

function checkName(val, type) {
  val = checkString(val, type);

  if (val.length < 2) throw `${type} must be at least 2 characters long.`;
  if (val.length > 25) throw `${type} cannot be more than 25 characters long.`;

  let validchars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-\'';

  for (let i = 0; i < val.length; i++) {
    if (!validchars.includes(val[i])) throw `${type} can only contain letters, hyphens, or apostrophes.`;
  }

  return val;
}

function checkEmail(val) {
  val = checkString(val, 'email');
  val = val.toLowerCase();

  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val)) throw `email must be a valid email address.`;

  return val;
}

function checkGender(val) {
  val = checkString(val, 'gender');

  if (val === 'prefer not to say') return '';

  if (val !== 'M' && val !== 'F' && val !== 'NB') {
    throw `gender must be M, F, NB, or prefer not to say.`;
  }

  return val;
}

function checkAge(val) {
  if (val === undefined || val === null) throw `age was not supplied.`;

  let ageNum = Number(val);

  if (!Number.isInteger(ageNum)) throw `age must be a valid whole number.`;
  if (ageNum < 16 || ageNum > 100) throw `age must be between 16 and 100.`;

  return ageNum;
}

function checkStreet(val) {
  val = checkString(val, 'street');

  if (val.length < 3) throw `street must be at least 3 characters long.`;
  if (val.length > 100) throw `street cannot be more than 100 characters long.`;

  let validchars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,#-\'';

  for (let i = 0; i < val.length; i++) {
    if (!validchars.includes(val[i])) throw `street contains invalid characters.`;
  }

  return val;
}

function checkCity(val) {
  val = checkString(val, 'city');

  if (val.length < 2) throw `city must be at least 2 characters long.`;
  if (val.length > 50) throw `city cannot be more than 50 characters long.`;

  let validchars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ -';

  for (let i = 0; i < val.length; i++) {
    if (!validchars.includes(val[i])) throw `city can only contain letters, spaces, or hyphens.`;
  }

  return val;
}

function checkState(val) {
  val = checkString(val, 'state').toUpperCase();

  let states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
  ];

  if (!states.includes(val)) throw `state must be a valid US state abbreviation.`;

  return val;
}

function checkZipCode(val) {
  val = checkString(val, 'zipCode');

  if (!/^\d{5}$/.test(val)) throw `zipCode must be a valid 5 digit US zip code.`;

  return val;
}

function removeExistingErrors() {
  let oldError = document.getElementById('form-error');
  if (oldError) oldError.remove();
}

function showError(form, message) {
  removeExistingErrors();

  let errorElement = document.createElement('p');
  errorElement.id = 'form-error';
  errorElement.textContent = message;

  form.prepend(errorElement);
}

function showSuccess(form, message) {
  removeExistingErrors();

  let successElement = document.createElement('p');
  successElement.id = 'form-error';
  successElement.textContent = message;
  successElement.style.color = 'green';

  form.prepend(successElement);
}

let updateProfileForm = document.getElementById('update-profile-form');

if (updateProfileForm) {
  updateProfileForm.addEventListener('submit', (event) => {
    try {
      removeExistingErrors();

      let firstName = document.getElementById('firstName').value;
      let lastName = document.getElementById('lastName').value;
      let email = document.getElementById('email').value;
      let gender = document.getElementById('gender').value;
      let age = document.getElementById('age').value;
      let street = document.getElementById('Street').value;
      let city = document.getElementById('City').value;
      let state = document.getElementById('State').value;
      let zipCode = document.getElementById('zipCode').value;

      checkName(firstName, 'firstName');
      checkName(lastName, 'lastName');
      checkEmail(email);
      checkGender(gender);
      checkAge(age);
      checkStreet(street);
      checkCity(city);
      checkState(state);
      checkZipCode(zipCode);
    } catch (e) {
      event.preventDefault();
      showError(updateProfileForm, e);
    }
  });
}

let addZipForm = document.getElementById('add-zip-form');

if (addZipForm) {
  addZipForm.addEventListener('submit', (event) => {
    try {
      removeExistingErrors();

      let watchZipCode = document.getElementById('watchZipCode').value;

      checkZipCode(watchZipCode);
    } catch (e) {
      event.preventDefault();
      showError(addZipForm, e);
    }
  });
}