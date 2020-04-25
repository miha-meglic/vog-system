const buttons = `
<div class="table-button btn-primary pointer" onclick="handleEditId({id})" title="Uredi">
	<i class="fas fa-edit" aria-hidden="true"></i>
</div>
<div class="table-button btn-danger pointer" onclick="handleDeleteId({id})" title="Odstrani">
	<i class="fas fa-trash" aria-hidden="true"></i>
</div>
`;

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
	
	const inventoryRef = firebase.firestore().collection('Inventory');
	
	const datatable = new FirestoreDatatable('inventoryTable', inventoryRef,
		['Name', 'Location', 'Amount', 'custom_buttons']);
	datatable.setCustomFiled('buttons', (data) => buttons);
	
	datatable.reload();
});

window.handleEditId = (docId) => {

};

window.handleDeleteId = (docId) => {

};
