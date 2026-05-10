import { Router } from 'express';
import xss from 'xss';
import {
    createIncident,
    getAllIncidents,
    getOneIncident,
    removeIncident,
    updateIncident,
    verifyIncident,
    updateStatus,
    createComment
} from '../data/incidentfunctions.js';
import { string_checker, id_checker } from '../data/errorchecking.js';

const router = Router();

function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/signin');
    next();
}

// List all incidents
router.get('/incidents', requireLogin, async (_req, res) => {
    try {
        const incidentList = await getAllIncidents();
        return res.render('incidents', { title: 'Incidents', incidents: incidentList });
    } catch (e) {
        return res.status(500).render('error', { title: 'Error', error: e });
    }
});

// Create incident
router.route('/incident_create')
    .get(requireLogin, async (_req, res) => {
        return res.render('incident_create', { title: 'Create Incident' });
    })
    .post(requireLogin, async (req, res) => {
        let category = xss(req.body.category || '');
        let title = xss(req.body.Title || '');
        let description = xss(req.body.description || '');
        let location = xss(req.body.location || '');
        let reportedBy = req.session.user.firstName + ' ' + req.session.user.lastName;
        let user_id = req.session.user._id.toString();

        try {
            string_checker(category);
            string_checker(title);
            string_checker(description);
            string_checker(location);
            if (category.length > 100) throw 'Category cannot be longer than 100 characters';
            if (title.length > 100) throw 'Title cannot be longer than 100 characters';
            if (description.length > 500) throw 'Description cannot be longer than 500 characters';
            if (location.length > 100) throw 'Location cannot be longer than 100 characters';
        } catch (e) {
            return res.status(400).render('incident_create', { title: 'Create Incident', hasError: true, error: e });
        }

        try {
            await createIncident(category, title, description, location, reportedBy, user_id);
            return res.redirect('/incidents');
        } catch (e) {
            return res.status(500).render('incident_create', { title: 'Create Incident', hasError: true, error: e });
        }
    });

// View / delete incident
router.route('/incident_card/:id')
    .get(requireLogin, async (req, res) => {
        let id;
        try {
            id = id_checker(req.params.id);
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
        try {
            const incident = await getOneIncident(id);
            let isOwner = req.session.user._id.toString() === incident.userId;
            let isAdmin = req.session.user.role === 'admin';
            return res.render('incident_card', { title: incident.Title, incident: incident, isOwner: isOwner, isAdmin: isAdmin });
        } catch (e) {
            return res.status(404).render('error', { title: 'Error', error: e });
        }
    })
    .post(requireLogin, async (req, res) => {
        let id;
        try {
            id = id_checker(req.params.id);
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
        try {
            const incident = await getOneIncident(id);
            await removeIncident(id, incident.verified);
            return res.redirect('/incidents');
        } catch (e) {
            return res.status(404).render('error', { title: 'Error', error: e });
        }
    });

// Update incident
router.route('/incident_update/:id')
    .get(requireLogin, async (req, res) => {
        let id;
        try {
            id = id_checker(req.params.id);
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
        try {
            const incident = await getOneIncident(id);
            return res.render('incident_update', { title: 'Update Incident', incident: incident });
        } catch (e) {
            return res.status(404).render('error', { title: 'Error', error: e });
        }
    })
    .post(requireLogin, async (req, res) => {
        let id;
        try {
            id = id_checker(req.params.id);
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }

        let category = xss(req.body.category || '');
        let title = xss(req.body.Title || '');
        let description = xss(req.body.description || '');
        let location = xss(req.body.location || '');
        let user_id = req.session.user._id.toString();

        try {
            await updateIncident(id, user_id, category, title, description, location);
            return res.redirect('/incident_card/' + id);
        } catch (e) {
            return res.status(400).render('incident_update', { title: 'Update Incident', hasError: true, error: e });
        }
    });

// Verify incident (admin only)
router.route('/verify/:id')
    .get(requireLogin, async (req, res) => {
        try {
            const incident = await getOneIncident(req.params.id);
            return res.render('Verify', { title: 'Verify Incident', incident: incident });
        } catch (e) {
            return res.status(404).render('error', { title: 'Error', error: e });
        }
    })
    .post(requireLogin, async (req, res) => {
        let verify = xss(req.body.verify || '');
        try {
            await verifyIncident(req.params.id, verify, req.session.user.role);
            return res.redirect('/incident_card/' + req.params.id);
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
    });

// Update status (admin only)
router.route('/status/:id')
    .get(requireLogin, async (req, res) => {
        try {
            const incident = await getOneIncident(req.params.id);
            return res.render('Status_Update', { title: 'Update Status', incident: incident });
        } catch (e) {
            return res.status(404).render('error', { title: 'Error', error: e });
        }
    })
    .post(requireLogin, async (req, res) => {
        let status = xss(req.body.status || '');
        try {
            await updateStatus(req.params.id, status, req.session.user.role);
            return res.redirect('/incident_card/' + req.params.id);
        } catch (e) {
            return res.status(400).render('error', { title: 'Error', error: e });
        }
    });

// Add comment
router.post('/comment/:id', requireLogin, async (req, res) => {
    let content = xss(req.body.content || '');
    let id;
    try {
        id = id_checker(req.params.id);
        string_checker(content);
        if (content.length > 500) throw 'Comment cannot be longer than 500 characters';
    } catch (e) {
        return res.status(400).render('error', { title: 'Error', error: e });
    }
    try {
        let name = req.session.user.firstName + ' ' + req.session.user.lastName;
        let user_id = req.session.user._id.toString();
        await createComment(name, content, id, user_id);
        return res.redirect('/incident_card/' + id);
    } catch (e) {
        return res.status(500).render('error', { title: 'Error', error: e });
    }
});

export default router;
