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
            incident_data.category = string_checker(category);
            if (incident_data.category.length > 100){
                throw "Error: category cannot be longer than 100 characters";
            }
            incident_data.Title = string_checker(Title);
            if (incident_data.Title.length > 100){
                throw "Error: title cannot be longer than 100 characters";
            }
            incident_data.description = string_checker(description);
            if (incident_data.description.length > 500){
                throw "Error: description cannot be longer than 500 characters";
            }
            incident_data.location = string_checker(location);
            if (location_data.location.length > 100){
                throw "Error: location cannot be longer than 100 characters";
            }
            //get reportedBy and user_id and error check them
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
    .route('/incident_card')
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
            if (user_id = incident.userId){
                correct_user = true;
            }
            //get user role, if admin set admin = true
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
            incident_data.category = string_checker(category);
            if (incident_data.category.length > 100){
                throw "Error: category cannot be longer than 100 characters";
            }
            incident_data.Title = string_checker(Title);
            if (incident_data.Title.length > 100){
                throw "Error: title cannot be longer than 100 characters";
            }
            incident_data.description = string_checker(description);
            if (incident_data.description.length > 500){
                throw "Error: description cannot be longer than 500 characters";
            }
            incident_data.location = string_checker(location);
            if (location_data.location.length > 100){
                throw "Error: location cannot be longer than 100 characters";
            }
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
        try{
            const {category, Title, description, location} = incident_data;
            const updated_incident = await updateIncident(req.params.id, category, Title, description, location);
            //return res.render("i think it would go back home but im not sure");
        } catch(e){
            return res.status(400).render('error', {title: "error", error: e, error_class: "error"});
        }
    })
    .route('/verify/:id')
    .get(async (req, res) =>{
        try{
            return res.render('Verify', {title: "Verify Incident"});
        } catch(e){
            return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

    .route('/status/:id')
    .get(async (req, res) =>{
        try{
            return res.render('Status_Update', {title: "Update Status"});
        } catch(e){
            return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })

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
            return res.render("incident_card", {title: "Incident Card"}, {incident: incident}, {admin: admin}, {user: correct_user});
        } catch(e){
             return res.status(404).render('error', {title: "error", error: e, error_class: "error"});
        }
    })