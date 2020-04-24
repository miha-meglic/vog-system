const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.promoteToUser = functions.https
	.onCall((data, context) => {
		if (context.auth.uid !== functions.config().admin.uid && !context.auth.token.admin)
			return 'Only admins can execute this function!';
		
		return admin.auth().getUserByEmail(data.email).then(user => {
			return admin.auth().updateUser(user.uid, {displayName: data.displayName});
		}).then(user => {
			return admin.auth().setCustomUserClaims(user.uid, {authorized: true});
		}).then(() => {
			return `User ${data.email} has been authorized!`;
		}).catch(err => {
			return err;
		});
	});

exports.promoteToAdmin = functions.https
	.onCall((data, context) => {
		if (context.auth.uid !== functions.config().admin.uid)
			return 'Only the admin can execute this function!';
		
		return admin.auth().getUserByEmail(data.email).then(user => {
			return admin.auth().updateUser(user.uid, {displayName: data.displayName});
		}).then(user => {
			return admin.auth().setCustomUserClaims(user.uid, {admin: true, authorized: true});
		}).then(() => {
			return `User ${data.email} has been made an admin!`;
		}).catch(err => {
			return err;
		});
	});