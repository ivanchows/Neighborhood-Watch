// Here you will import route files and export the constructor method as shown in lecture code and worked in previous labs.

import authRoutes from './auth_routes.js';
import serviceRoutes from './service_routes.js';
import incidentRoutes from './routes/incident_routes.js';

const constructorMethod = (app) => {
    app.use('/', authRoutes);
    app.use('/', serviceRoutes);
    app.use('/', incidentRoutes);
    app.use(/(.*)/, (_req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
};
export default constructorMethod;
