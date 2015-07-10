/* - import_into_postgres.js - Node based script that imports JSON files
 * into Postgres in conjunction with the data store migration from CouchDB,
 * This script uses the Sequelize ORM (https://github.com/sequelize/sequelize)
 * for the application models.
 *
 * The script should be installed using the following syntax:
 * > node data/import_into_postgres.js
 */

var db = require('../models'); // Sequelize initialization
var async = require('async'); // Used primarily for iterator

/* import JSON using node require */
var rcRegionsByCounty = require('../data/rc_regions_by_county.json');
var usAddressesJson = require('../data/us_addresses.json');


/* Throw an error if the database sync does not occur. The database
   sync connects to a database and also reinstates the known database
   structure if for some reason it is not in place */
db.sequelize.sync().then(function(promise) {

	/* Import the selected Red Cross regions from JSON.  Create
	   each county using Model.create() function from Sequelize.
	 */
	var rcRegionsByCounty = db.rcRegionsByCounty;

	async.each(rcRegionsByCounty.docs, function(county, callback) {
		rcRegionsByCounty.create(county).then(function(returnedCounty) {
			console.log("County " + returnedCounty + " added");
		});
	});


	/* Import the US addresses from JSON. Create UsAddress models using
	 * Model.create() function from Sequelize.
	 */
	var addresses = db.UsAddress;
	while (usAddressesJson.docs.length) {
		var addressSplice = usAddressesJson.docs.splice(0,100);
		async.each(addressSplice, function(address, callback) {
			addresses.create(address).then(function(returnedAddress) {
				console.log("Address " + returnedAddress + " added");
			});
		});
	}

}).catch(SyntaxError, function(e){
    console.log("ERROR: Unable to connect to database" + e);
});
