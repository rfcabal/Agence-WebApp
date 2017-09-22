'use strict';

/**
 * @ngdoc service
 * @name agenceApp.constant
 * @description
 * # constant
 * Constant in the agenceApp.
 */
angular.module('agenceApp')
  	//Producción		
		.constant('WS', 
			{"URL": "https://agencews.zreactor.cl/index.php/api/",
			 "CONSULTORES" : "https://agencews.zreactor.cl/index.php/api/users/consultores",
			 "RELATORIO": "https://agencews.zreactor.cl/index.php/api/users/relatorio"
			})
