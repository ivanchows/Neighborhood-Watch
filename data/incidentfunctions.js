import { incidents } from '../config/mongoCollections.js';
import { notifications } from '../config/mongoCollections.js';
import { comments } from '../config/mongoCollections.js';
import { id_checker, string_checker } from './errorchecking.js';
import { ObjectId } from 'mongodb';

const createIncident = async (category, Title, description, location, reportedBy, user_id) => {
    category = string_checker(category);
    if (category.length > 100) throw 'Error: category cannot be longer than 100 characters';

    Title = string_checker(Title);
    if (Title.length > 100) throw 'Error: title cannot be longer than 100 characters';

    description = string_checker(description);
    if (description.length > 500) throw 'Error: description cannot be longer than 500 characters';

    location = string_checker(location);
    if (location.length > 100) throw 'Error: location cannot be longer than 100 characters';

    reportedBy = string_checker(reportedBy);
    user_id = id_checker(user_id);

    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let current_month = String(today.getMonth() + 1).padStart(2, '0');
    let current_year = today.getFullYear();
    let postedDate = current_month + '/' + day + '/' + current_year;

    let newIncident = {
        category: category,
        postedDate: postedDate,
        Title: Title,
        description: description,
        location: location,
        reportedBy: reportedBy,
        userId: user_id,
        verified: '',
        status: 'Active',
        notifications: [],
        comments: []
    };

    const incident_collection = await incidents();
    const insert_incident = await incident_collection.insertOne(newIncident);
    if (!insert_incident.acknowledged || !insert_incident.insertedId) {
        throw 'Error: could not add incident';
    }

    return { _id: insert_incident.insertedId.toString(), ...newIncident };
};

const getAllIncidents = async () => {
    const incident_collection = await incidents();
    let result = await incident_collection.find({}).toArray();
    return result;
};

const getOneIncident = async (id) => {
    id = id_checker(id);
    let incident_collection = await incidents();
    const incident = await incident_collection.findOne({ _id: new ObjectId(id) });
    if (!incident) throw 'Error: could not find incident with desired id';
    return incident;
};

const verifyIncident = async (id, verify, user_role) => {
    id = id_checker(id);

    user_role = string_checker(user_role);
    if (user_role !== 'admin') throw 'Error: user must be an admin to verify incidents';

    verify = string_checker(verify);
    verify = verify.toLowerCase();
    if (verify !== 'yes' && verify !== 'no') throw 'Error: verify can only be yes or no';

    let incident_collection = await incidents();
    const incident = await incident_collection.findOne({ _id: new ObjectId(id) });
    if (!incident) throw 'Error: could not find incident with desired id';

    await incident_collection.updateOne({ _id: new ObjectId(id) }, { $set: { verified: verify } });
    return 'Incident has been verified!';
};

const updateStatus = async (id, status, user_role) => {
    id = id_checker(id);

    user_role = string_checker(user_role);
    if (user_role !== 'admin') throw 'Error: user must be an admin to update status';

    status = string_checker(status);
    status = status.toLowerCase();
    if (status !== 'active' && status !== 'resolved' && status !== 'authorities notified') {
        throw 'Error: status must be active, resolved, or authorities notified';
    }

    let incident_collection = await incidents();
    const incident = await incident_collection.findOne({ _id: new ObjectId(id) });
    if (!incident) throw 'Error: could not find incident with desired id';

    await incident_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: status } });
    return 'Status has been updated!';
};

const removeIncident = async (id, verified) => {
    id = id_checker(id);
    verified = string_checker(verified);
    if (verified !== 'no' && verified !== '') throw 'Error: can only remove unverified incidents';

    const incident_collection = await incidents();
    const removed_incident = await incident_collection.findOneAndDelete({ _id: new ObjectId(id) });
    if (!removed_incident) throw 'Error: could not remove incident';
    return 'Incident successfully removed!';
};

const updateIncident = async (incident_id, user_id, category, Title, description, location) => {
    incident_id = id_checker(incident_id);

    const incident_collection = await incidents();
    let og_incident = await incident_collection.findOne({ _id: new ObjectId(incident_id) });
    if (!og_incident) throw 'Error: could not retrieve original incident';

    if (user_id !== og_incident.userId) throw 'Error: cannot update an incident that you did not post';

    let new_incident = {
        category: og_incident.category,
        postedDate: og_incident.postedDate,
        Title: og_incident.Title,
        description: og_incident.description,
        location: og_incident.location,
        reportedBy: og_incident.reportedBy,
        userId: og_incident.userId,
        verified: og_incident.verified,
        status: og_incident.status,
        notifications: og_incident.notifications,
        comments: og_incident.comments
    };

    if (category !== '') {
        category = string_checker(category);
        if (category.length > 100) throw 'Error: updated category cannot be longer than 100 characters';
        new_incident.category = category;
    }
    if (Title !== '') {
        Title = string_checker(Title);
        if (Title.length > 100) throw 'Error: updated title cannot be longer than 100 characters';
        new_incident.Title = Title;
    }
    if (description !== '') {
        description = string_checker(description);
        if (description.length > 500) throw 'Error: updated description cannot be longer than 500 characters';
        new_incident.description = description;
    }
    if (location !== '') {
        location = string_checker(location);
        if (location.length > 100) throw 'Error: updated location cannot be longer than 100 characters';
        new_incident.location = location;
    }

    await incident_collection.findOneAndUpdate({ _id: new ObjectId(incident_id) }, { $set: new_incident }, { returnDocument: 'after' });
    return 'Incident has been updated!';
};

const createComment = async (name, content, incident_id, user_id) => {
    name = string_checker(name);
    content = string_checker(content);
    if (content.length > 500) throw 'Error: content cannot be longer than 500 characters';
    incident_id = id_checker(incident_id);
    user_id = id_checker(user_id);

    let comment = {
        name: name,
        content: content,
        incident_id: incident_id,
        user_id: user_id
    };

    const comment_collection = await comments();
    const insert_comment = await comment_collection.insertOne(comment);
    if (!insert_comment.acknowledged || !insert_comment.insertedId) throw 'Error: could not add comment';

    const incident_collection = await incidents();
    await incident_collection.updateOne({ _id: new ObjectId(incident_id) }, { $push: { comments: comment } });
    return 'Successfully created comment!';
};

const removeComment = async (id) => {
    id = id_checker(id);
    const comment_collection = await comments();
    const removed_comment = await comment_collection.findOneAndDelete({ _id: new ObjectId(id) });
    if (!removed_comment) throw 'Error: comment was not found';

    const incident_collection = await incidents();
    await incident_collection.updateOne(
        { _id: new ObjectId(removed_comment.incident_id) },
        { $pull: { comments: { _id: new ObjectId(id) } } }
    );
    return 'Comment successfully deleted!';
};

const updateComment = async (id, content) => {
    id = id_checker(id);
    content = string_checker(content);
    if (content.length > 500) throw 'Error: updated content cannot be longer than 500 characters';

    const comment_collection = await comments();
    const updated_comment = await comment_collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { content: content } }
    );
    if (!updated_comment) throw 'Error: could not update comment';
    return 'Comment successfully updated!';
};

export {
    createIncident,
    getAllIncidents,
    getOneIncident,
    removeIncident,
    updateIncident,
    verifyIncident,
    updateStatus,
    createComment,
    removeComment,
    updateComment
};
