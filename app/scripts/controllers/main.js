'use strict';

/**
 * @ngdoc function
 * @name agenceApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the agenceApp
 */
angular.module('agenceApp')

	.filter('sumByColumn', function () {
      return function (collection, column) {
        var total = 0;

        collection.forEach(function (item) {
          total += parseFloat(item[column]);
        });

        return total;
      };
    })

  .controller('MainCtrl', function ($scope, $http, WS) {

  	$scope.step = 1;
  	$scope.report = 0;

  	$scope.$watch('report', function() {
  		console.log($scope.report);
  	})

  	$http.get(WS.CONSULTORES).then( function(response) {
  		//console.log(response.data);
  		$scope.consultores = response.data;
  	}, function(error) {
  		console.log(error.data)
  	})

  	$scope.selectedConsultores = [];
  	$scope.relatorios = [];
  	$scope.data = [];

  	$scope.addConsultor = function(consultor) {		

  		$http.get(WS.RELATORIO, {
			params: {
				user:consultor.co_usuario,
				date1: moment($scope.date1).format('YYYY-MM-01'),
				date2: moment($scope.date2).format('YYYY-MM-31')
			}
		}).then( function(response) {

			$scope.data = [];
			$scope.data2 = [];
			
			
			// Existe el consultor?
		    var index =  $scope.selectedConsultores.indexOf(consultor);
		    //console.log(index);

		    if(index > -1) {
		      alert('El consultor ya fue agregado');
		      $scope.consultorSelected = '';
		    } else {
		    	$scope.relatorios.push(response.data);
		    	$scope.selectedConsultores.push(consultor);
		      	$scope.report = 1;

			    // Construcción de matriz Gráfico 1

			    function dateRange(startDate, endDate) {
				  var start      = startDate.split('-');
				  var end        = endDate.split('-');
				  var startYear  = parseInt(start[0]);
				  var endYear    = parseInt(end[0]);
				  var dates      = [];

				  for(var i = startYear; i <= endYear; i++) {
				    var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
				    var startMon = i === startYear ? parseInt(start[1])-1 : 0;
				    for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
				      var month = j+1;
				      var displayMonth = month < 10 ? '0'+month : month;
				      dates.push([displayMonth, i].join('-'));
				    }
				  }
				  return dates;
				}

				var meses = dateRange(moment($scope.date1).format('YYYY-MM'), moment($scope.date2).format('YYYY-MM'));

				$scope.data= [];
			    $scope.data[0]= ['Mes'];

			    angular.forEach($scope.selectedConsultores, function(consultor) {
			    	$scope.data[0].push(consultor.no_usuario);
			    })

			    angular.forEach(meses, function(mes) {
			    	$scope.data.push([mes])
			    })

			   	for (var i = 1; i < $scope.data.length; i++) {
			   		for (var a = 1; a < $scope.data[0].length; a++) {
			   			$scope.data[i][a] = 0;
			   		}
			   	}

			   	for (var a = 0; a < $scope.relatorios.length; a++) {
	   				for (var b = 0; b < $scope.relatorios[a].length; b++) {
	   					for (var i = 1; i < $scope.data.length; i++) {
	   						var index = $scope.data[i].indexOf($scope.relatorios[a][b]['fecha_emision']);
	   						if(index >= 0) {
		   						$scope.data[i][a+1] = parseFloat($scope.relatorios[a][b]['ganancias_netas']);
		   					}
	   					}
	   				}   					   				
	   			}

	   			$scope.data[0][$scope.data[0].length]='Costo Fijo Promedio';

	   			var promedio = 0;

	   			for (var i = 0; i < $scope.selectedConsultores.length; i++) {
	   				promedio = parseFloat(promedio) + parseFloat($scope.relatorios[i][0].costo_fijo);			
	   			}

	   			promedio = promedio/$scope.selectedConsultores.length;   				

	   			for (var i = 1; i < $scope.data.length; i++) {
					$scope.data[i][$scope.data[i].length] = promedio;
				}
					

	   			// Propiedades Gráfico 1

			 	var chart1 = {};
			    chart1.type = "ComboChart";
			    chart1.cssStyle = "min-height:400px; width:auto;";
			    chart1.data = $scope.data;		    

			    var countLinea =$scope.data[0].length-2;
			    var linea =  "{ title : 'Desempeño Consultores', vAxis: {title: 'Consultor'}, hAxis: {title: 'Mes'}, seriesType: 'bars', series:{"+countLinea+": {type: 'line'}} }";
			    chart1.options = JSON.parse(JSON.stringify(eval("(" + linea + ")")));

			    chart1.formatters = {}; 
			    chart1.formatters.number = []  	   

			    for (var i = 0; i < $scope.relatorios.length; i++) {
			    	chart1.formatters.number[i] = {
										        columnNum: i+1,
										        pattern: "R$ #,##0.00"
										      };
			    }	

			    $scope.chart1 = chart1;

				// Construcción de matriz Gráfico 2
				$scope.data2=[];
				$scope.data2[0] = ['Cosultor','Total'];
				var suma = 0;

				for (var i = 0; i < $scope.relatorios.length; i++) {
					for (var a = 0; a < $scope.relatorios[i].length; a++) {
						suma = suma + parseFloat($scope.relatorios[i][a].ganancias_netas);
					}
					$scope.data2[i+1] = [$scope.relatorios[i][0].no_usuario, suma];
					suma = 0;
				}						

				// Propiedades Gráfico 2
				var chart2 = {};
			    chart2.type = "PieChart";
			    chart2.cssStyle = "min-height:500px; width:auto;";
			    chart2.data = $scope.data2

			    chart2.options = {
			    	legend: 'true',
		       		pieSliceText: 'label',
		        	title: 'Ganancias Netas',
		        	pieStartAngle: 100,
			    };

			    chart2.formatters = {}; 
			    chart2.formatters.number = []  	   

			    for (var i = 0; i < $scope.relatorios.length; i++) {
			    	chart2.formatters.number[i] = {
										        columnNum: i+1,
										        pattern: "R$ #,##0.00"
										      };
			    }	    

			    $scope.chart2 = chart2;
		    }

		    

			
		}, function(error) {
			console.log(error.data);
			alert(error.data.message)
			$scope.consultorSelected = '';
		}) 	

  	}; 

    $scope.reset = function() {
    	$scope.date1='';
    	$scope.date2='';
    	$scope.selectedConsultores = [];
  		$scope.relatorios = [];
		$scope.data = [];
		$scope.data2 = [];
		$scope.report = 1;			
    }


	$scope.today = function() {
	    $scope.date = new Date();
	  };
	  $scope.today();

	  $scope.clear = function() {
	    $scope.date = null;
	  };

	  $scope.dateOptions = {
	    formatYear: 'yy',
	    minMode: 'month',
	    maxDate: new Date(),
	    startingDay: 1
	  };

	  $scope.open1 = function() {
	    $scope.popup1.opened = true;
	  };

	  $scope.open2 = function() {
	    $scope.popup2.opened = true;
	  };
	  
	  $scope.format = 'MM-yyyy';
	  $scope.altInputFormats = ['M!/yyyy'];

	  $scope.popup1 = {
	    opened: false
	  };

	  $scope.popup2 = {
	    opened: false
	  }; 

  });
