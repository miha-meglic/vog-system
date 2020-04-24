document.addEventListener('DOMContentLoaded', () => {
	// Check if user is logged in and authorized
	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			$('.auth').show();
			$('.unauth').hide();
			user.getIdTokenResult().then(token => {
				if (token.claims.authorized) {
					// If authorized forward to /system
					location.href = '/system.html';
				} else {
					// Else notify user
					let notification = $('#form-notifications');
					notification.addClass('alert alert-warning');
					notification.text('Vaš račun še ni avtoriziran!');
				}
			});
		} else {
			$('.auth').hide();
			$('.unauth').show();
		}
	});
	
	// Login handler
	$('#form-login').on('submit', (event) => {
		event.preventDefault();
		let form = event.target;
		
		firebase.auth().signInWithEmailAndPassword(form['inputEmail'].value, form['inputPassword'].value)
			.then(() => {
				const notification = $('#form-notifications');
				notification.removeClass('alert alert-danger');
				notification.text('');
				form.reset();
			})
			.catch(err => {
				const notification = $('#form-notifications');
				let message;
				switch (err.code) {
					case 'auth/invalid-email':
						message = 'Email ne obstaja!';
						break;
					case 'auth/user-disabled':
						message = 'Uporabnik je onemogočen!';
						break;
					case 'auth/user-not-found':
						message = 'Uporabnik ne obstaja!';
						break;
					case 'auth/wrong-password':
						message = 'Napačno geslo!';
						break;
					default:
						message = `Napaka: ${err.message}!`;
				}
				notification.addClass('alert alert-danger');
				notification.text(message);
			});
	});
	
	// Logout handler
	$('#logout-btn').on('click', () => {
		firebase.auth().signOut()
			.then(() => {
				const notification = $('#form-notifications');
				notification.removeClass('alert alert-danger');
				notification.text('');
				document.querySelector('#form-login').reset();
			});
	})
});