document.addEventListener('DOMContentLoaded', () => {
	// Check if user is logged in and authorized
	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			user.getIdTokenResult().then(token => {
				user.authorized = token.claims.authorized
				if (user.authorized) {
					$('.auth').show();
					$('#userName').text(user.displayName);
					$('#userEmail').text(user.email);
				} else {
					// If unauthorized forward to /
					location.href = '/';
				}
			});
		} else {
			// If logged-out forward to /
			location.href = '/';
		}
	});
	
	$('#btnOdjava').on('click', () => {
		firebase.auth().signOut();
	});
});