import {Router} from 'express';
const router = Router();
import {
    createIncident,
    getAllIncidents,
    getOneIncident,
    removeIncident,
    updateIncident,
    verifyIncident,
    updateStatus,
    add_like,
    createNotif,
    removeNotif,
    updateNotif,
    createComment,
    removeComment,
    updateComment
} from '../data/incidentfunctions.js';

import {
  string_checker,
  id_checker
} from '../data/errorchecking.js';

router
    .route('/incident_create')
    .get(async (req, res) =>{
        try{
            return res.render('incident_create', {title: "Create Incident"});
        } catch(e){
            return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })
    .post(async (req, res) => {
        let incident_data = req.body;
        if (!incident_data){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            incident_data.category = string_checker(incident_data.category);
            if (incident_data.category.length > 100){
                throw "Error: category cannot be longer than 100 characters";
            }
            incident_data.Title = string_checker(incident_data.Title);
            if (incident_data.Title.length > 100){
                throw "Error: title cannot be longer than 100 characters";
            }
            incident_data.description = string_checker(incident_data.description);
            if (incident_data.description.length > 500){
                throw "Error: description cannot be longer than 500 characters";
            }
            incident_data.location = string_checker(incident_data.location);
            if (incident_data.location.length > 100){
                throw "Error: location cannot be longer than 100 characters";
            }
            //get reportedBy and user_id and error check them
            let reportedBy = req.session.user.firstName + " " + req.session.user.lastName;
            reportedBy = string_checker(reportedBy);
            let user_id = req.session.user._id;
            user_id = id_checker(user_id);
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            const {category, Title, description, location} = incident_data;
            const created_incident = await createIncident(req.params.id, category, Title, description, location, reportedBy, user_id);
            //return res.render("i think it would go back home but im not sure");
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

router
    .route('/incident_card/:id')
    .get(async (req, res) => {
        try{
            req.params.id = id_checker(req.params.id);
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            //get user_id and perform check from whats in the db
            let correct_user = false;
            let admin = false;
            const incident = await getOneIncident(req.params.id);
            if (req.session.user._id = incident.userId){
                correct_user = true;
            }
            //get user role, if admin set admin = true
            if (req.session.user.role === "admin"){
                admin = true;
            }
            return res.render("incident_card", {title: "Incident Card"}, {incident: incident}, {admin: admin}, {user: correct_user});
        } catch(e){
            return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })
    .post(async (req, res) =>{
        try{
            req.params.id = id_checker(req.params.id);
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            const incident = await getOneIncident(req.params.id);
            verified = incident.verified;
            const deleted_incident = await removeIncident(req.params.id, verified);
            return res.render("Deletion");
        } catch(e){
             return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

router
    .route('/incident_update/:id')
    .get(async (req, res) => {
        try{
            return res.render('incident_update', {title: "Update Incident"});
        } catch(e){
            return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })
    .post(async (req, res) => {
        let incident_data = req.body;
        if (!incident_data){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            req.params.id = id_checker(req.params.id);
            incident_data.category = string_checker(incident_data.category);
            if (incident_data.category.length > 100){
                throw "Error: category cannot be longer than 100 characters";
            }
            incident_data.Title = string_checker(incident_data.Title);
            if (incident_data.Title.length > 100){
                throw "Error: title cannot be longer than 100 characters";
            }
            incident_data.description = string_checker(incident_data.description);
            if (incident_data.description.length > 500){
                throw "Error: description cannot be longer than 500 characters";
            }
            incident_data.location = string_checker(incident_data.location);
            if (incident_data.location.length > 100){
                throw "Error: location cannot be longer than 100 characters";
            }
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            let correct_user = false;
            let admin = false;
            const incident = await getOneIncident(req.params.id);
            if (req.session.user._id = incident.userId){
                correct_user = true;
            }
            //get user role, if admin set admin = true
            if (req.session.user.role === "admin"){
                admin = true;
            }
            const {category, Title, description, location} = incident_data;
            const updated_incident = await updateIncident(req.params.id, category, Title, description, location);
            return res.render("incident_card", {title: "Incident Card"}, {incident: incident}, {admin: admin}, {user: correct_user});
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

router
    .route('/verify/:id')
    .get(async (req, res) =>{
        try{
            return res.render('Verify', {title: "Verify Incident"});
        } catch(e){
            return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })
    .post(async (req, res) => {
        let data = req.body;
        if (!data){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            req.params.id = id_checker(req.params.id);
            data.verified = string_checker(data.verified);
            data.content = string_checker(data.content);
            if (data.content.length > 500){
                throw "Error: content cannot be longer than 500 characters";
            }
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            let correct_user = false;
            let admin = false;
            const incident = await getOneIncident(req.params.id);
            if (req.session.user._id = incident.userId){
                correct_user = true;
            }
            //get user role, if admin set admin = true
            if (req.session.user.role === "admin"){
                admin = true;
            }
            const {verified, content} = data;
            const verified_incident = verifyIncident(incident._id, verified);
            const created_notif = createNotif(incident.reportedBy, content, incident._id, incident.userId);
            return res.render("incident_card", {title: "Incident Card"}, {incident: incident}, {admin: admin}, {user: correct_user});
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

router
    .route('/status/:id')
    .get(async (req, res) =>{
        try{
            return res.render('Status_Update', {title: "Update Status"});
        } catch(e){
            return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })
    .post(async (req, res) => {
        let data = req.body;
        if (!data){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            req.params.id = id_checker(req.params.id);
            data.status = string_checker(data.status);
            data.content = string_checker(data.content);
            if (data.content.length > 500){
                throw "Error: content cannot be longer than 500 characters";
            }
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            let correct_user = false;
            let admin = false;
            const incident = await getOneIncident(req.params.id);
            if (req.session.user._id = incident.userId){
                correct_user = true;
            }
            //get user role, if admin set admin = true
            if (req.session.user.role === "admin"){
                admin = true;
            }
            const {status, content} = data;
            const verified_incident = verifyIncident(incident._id, status);
            const created_notif = createNotif(incident.reportedBy, content, incident._id, incident.userId);
            return res.render("incident_card", {title: "Incident Card"}, {incident: incident}, {admin: admin}, {user: correct_user});
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

router
    .route('/comment/:id')
    .post(async (req, res) =>{
        let content = req.body;
        if (!content){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            content = string_checker(content);
            if (content.length > 500){
                throw "Error: content cannot be longer than 500 characters";
            }
            req.params.id = id_checker(req.params.id);
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            const incident = await getOneIncident(req.params.id);
            let incident_id = incident._id;
            let name = incident.reportedBy;
            let user_id = incident.userId;
            const created_comment = await createComment(name, content, incident_id, user_id);
            return res.json(created_comment);
        } catch(e){
             return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

router
    .route('/like/:id')
    .post(async (req, res) =>{
        try{
            const incident = await getOneIncident(req.params.id);
            let incident_id = incident._id;
            const added_like = await add_like(name, content, incident_id, user_id);
            return res.json(added_like);
        } catch(e){
             return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

    export default router;
