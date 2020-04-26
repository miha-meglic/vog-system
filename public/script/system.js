const buttons = `
<div class="table-button btn-primary pointer" onclick="handleEditId('{id}')" title="Uredi">
	<i class="fas fa-edit" aria-hidden="true"></i>
</div>
<div class="table-button btn-danger pointer" onclick="handleDeleteId('{id}')" title="Odstrani">
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
	
	// Firestore ref
	const inventoryRef = firebase.firestore().collection('Inventory');
	
	// Setup and initialize datatable
	const datatable = new FirestoreDatatable('inventoryTable', inventoryRef,
		['Name', 'Location', 'Amount', 'custom_buttons']);
	datatable.setCustomFiled('buttons', (data, id) => buttons.replace('{id}', id));
	datatable.reload();
	
	// Handlers
	// Clear modal on close
	$('.modal [aria-label="Close"]').on('click', (event) => clearModal(event.target.closest('.modal')));
	// Delete item on confirm
	$('#confirm-remove').on('click', (event) => {
		const itemId = event.target.dataset.value;
		if (itemId.trim() !== '')
			inventoryRef.doc(itemId).delete().then(() => datatable.reload());
		$('#rmConfModal').modal('hide');
	});
});

// Clears modal form and handles title
function clearModal (modal) {
	$(modal).find('form').trigger('reset');
	
	const title = $(modal).find('.modal-title');
	if (title.text() === 'Uredi Vpis')
		title.text('Nov Vpis');
}

// Modify and populate add form on edit
window.handleEditId = (docId) => {
	const docRef = firebase.firestore().collection('Inventory').doc(docId);
	const modal = $('#entry-modal');
	
	docRef.get().then(snap => {
		const data = snap.data();
		
		modal.children('.modal-title').text('Uredi Vpis');
		$('#entry-name').val(data['Name']);
		$('#entry-location').val(data['Location']);
		$('#entry-amount').val(data['Amount']);
		
		modal.modal('show');
	});
};

// Open confirm popup
window.handleDeleteId = (docId) => {
	$('#remove-modal #confirm-remove').attr('data-value', docId);
	$('#remove-modal').modal('show');
};
