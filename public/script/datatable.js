class FirestoreDatatable {
	fieldVisibility = {};
	customFields = {};
	snapshot;
	batchSize;
	lastLoaded = null;
	order = 'asc';
	orderBy;
	orderWithWhere = false;
	conditionSet = false;
	condField;
	condOp;
	condVal;
	scrollFun = (event) => {
	};
	
	/**
	 * FIRESTORE DATATABLE
	 * @class
	 *
	 * @param {string} tableID - ID of table body tag
	 * @param {CollectionReference} collection - Firestore collection reference
	 * @param {string[]} fields - Array of field IDs in Firebase documents
	 * 		custom fields should start with custom_ (e.g. custom_fName) and
	 * 		their implementation should be added with setCustomField(fName, implementation)
	 * @param {int} batchSize - Amount of entries to retrieve by default
	 * @param {boolean} subscribe - If set to true it ensures, the reload command will subscribe to the database
	 */
	constructor (tableID, collection, fields, batchSize = 20, subscribe = false) {
		this.table = $('#' + tableID);
		this.dataColl = collection;
		this.fields = fields;
		this.batchSize = batchSize;
		this.snapshot = subscribe;
		
		this.orderBy = fields[0];
	}
	
	/**
	 * Set custom field contents
	 *
	 * @param {string} name - field name (name after custom_ in fields array)
	 * @param {callback} callback - field implementation
	 */
	setCustomFiled (name, callback) {
		this.customFields[name] = callback;
	}
	
	/**
	 * Set field visibility
	 *
	 * @param {string} field - field name
	 * @param {boolean} visible - field visibility
	 */
	setFieldVisibility (field, visible) {
		this.fieldVisibility[field] = visible;
	}
	
	/**
	 * Set item loading order
	 *
	 * @param {fields} orderBy - field to order by (cannot use custom_ fields)
	 * @param {OrderByDirection} order - ascending or descending order
	 * @param {boolean} activeWithWhere - use order even when using where (requires compound index)
	 */
	setOrder (orderBy, order, activeWithWhere = false) {
		if (orderBy.toString().startsWith('custom_'))
			return;
		
		// let reload = false;
		// if (this.orderBy !== orderBy.toString() || this.order !== order.toString())
		// 	reload = true;
		
		this.orderBy = orderBy.toString();
		this.order = order.toString();
		this.orderWithWhere = activeWithWhere;
		
		// if (reload)
		// 	this.reload();
	}
	
	/**
	 * Set conditions of query
	 *
	 * @param {fields} field
	 * @param {WhereFilterOp} operand
	 * @param {string|number|boolean} value
	 */
	setCondition (field, operand, value) {
		this.condField = field;
		this.condOp = operand;
		this.condVal = value;
		
		this.conditionSet = true;
	}
	
	clearCondition () {
		this.conditionSet = false;
	}
	
	/**
	 * Add row to datatable
	 *
	 * @param {Object} data - Firebase document
	 */
	addRow (data) {
		let row = document.createElement('tr');
		
		this.fields.forEach((item, index) => {
			let it = document.createElement('td');
			if (index === 0) {
				it = document.createElement('th');
				it.scope = 'row';
			}
			
			if (item.startsWith('custom')) {
				let customKey = item.slice(7);
				let ret = this.customFields[customKey](data);
				if (ret instanceof Promise) {
					this.customFields[customKey](data).then(x => it.innerHTML = x.toString());
				} else {
					it.innerHTML = ret;
				}
			} else {
				it.innerText = data[item];
			}
			
			if (this.fieldVisibility[item] === false) {
				it.innerHTML = '';
			}
			
			row.append(it);
		});
		
		this.table.append(row);
	}
	
	/**
	 * Load data to datatable
	 */
	load () {
		let query = this.dataColl;
		
		if (this.lastLoaded !== undefined) {
			// conditions
			if (this.conditionSet)
				query = query.where(this.condField, this.condOp, this.condVal);
			// order
			if (!this.conditionSet || this.orderWithWhere)
				query = query.orderBy(this.orderBy, this.order);
			// start after last
			if (this.lastLoaded != null)
				query = query.startAfter(this.lastLoaded);
			// limit and GET
			query.limit(this.batchSize).get()
				.then(snap => {
					// set last loaded
					this.lastLoaded = snap.docs[snap.docs.length - 1];
					// add documents to datatable
					snap.docs.forEach(doc => {
						this.addRow(doc.data());
					});
				});
		}
	}
	
	/**
	 * Subscribe to query and load data on request
	 */
	subscribe () {
		let query = this.dataColl;
		
		// conditions
		if (this.conditionSet)
			query = query.where(this.condField, this.condOp, this.condVal);
		// order
		if (!this.conditionSet || this.orderWithWhere)
			query = query.orderBy(this.orderBy, this.order);
		// limit and GET
		this.snapshot = query.limit(this.batchSize)
			.onSnapshot(snap => {
				// clear current data
				this.clear();
				// add documents to datatable
				snap.docs.forEach(doc => {
					this.addRow(doc.data());
				});
			});
	}
	
	unsubscribe () {
		if (this.snapshot && this.snapshot !== true) {
			this.snapshot();
			this.snapshot = null;
		}
	}
	
	/**
	 * Clear datatable
	 */
	clear () {
		this.table.html('');
		this.lastLoaded = null;
	}
	
	/**
	 * Reload datatable
	 */
	reload () {
		if (this.snapshot) {
			this.unsubscribe();
			this.clear();
			this.subscribe();
		} else {
			this.clear();
			this.load();
		}
	}
	
	/**
	 * Enable/disable infinity scroll
	 *
	 * @param {boolean} enabled
	 */
	setInfinityScroll (enabled) {
		if (enabled) {
			window.addEventListener('scroll', this.scrollFun);
		} else {
			window.removeEventListener('scroll', this.scrollFun);
		}
	}
}