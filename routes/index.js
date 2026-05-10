// Here you will import route files and export the constructor method as shown in lecture code and worked in previous labs.

import incidentRoutes from './incident_routes.js';

const constructorMethod = (app) => {
  app.use('/', incidentRoutes);

  app.use((req, res) => {
    return res.status(404).render('error', {
      title: 'Error',
      error: 'Page not found'
    });
  });
};

export default constructorMethod;
