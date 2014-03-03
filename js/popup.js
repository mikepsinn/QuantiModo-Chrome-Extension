function clearNotifications()
{
	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);
	chrome.notifications.clear("trackReportNotification", function(){});
}

function setButtonListeners()
{
	document.getElementById('button-add').onclick=onAddButtonClicked;
	document.getElementById('button-close').onclick=onCloseButtonClicked;
}

var onCloseButtonClicked = function()
{
	window.close();

}

var variables = [];

var onAddButtonClicked = function()
{
	// Figure out what rating was selected
	//alert('add a measurement is clicked');
	//var backPage = chrome.extension.getBackgroundPage();
	//console.log(backPage);
	
	//backPage.AnalyzePage.showAddMeasurementDialog();
	
	// Create an array of measurements
	
	var name = $("#addmeasurement-variable-name").val();
	var unit = $("#addmeasurement-variable-unit").val();
	var value = $("#addmeasurement-variable-value").val();
	var datetime = $("#addmeasurement-variable-datetime").val();
	var variable = getVariableWithName(name);
	var measurements = 	[
							{
								timestamp: 	Math.floor(new Date(datetime).getTime()  / 1000), 
								value: 		value
							}
						];
	// Add it to a request, payload is what we'll send to QuantiModo
	var request =		{
							message: "uploadMeasurements",
							payload:[
										{
											measurements:			measurements,
											name: 					variable.name,
											source: 				"QuantiMo.Do",
											category: 				variable.category,
											combinationOperation: 	variable.combinationOperation,
											unit:					unit
										}
									]
									
						};

	chrome.extension.sendMessage(request, function(responseText) {
		
		var response = $.parseJSON(responseText);
		if(response.success == true)
		{
			alert("Added a measurement successfully.");
			document.getElementById('addmeasurement-variable-value').value = "";
			window.close();
		}
		else
		{
			alert("Adding a measurement failed.");
			console.log(responseText);
		}
	});
	clearNotifications();
	
}

var getVariableWithName = function(variableName)
{
	for(var i=0; i<variables.length; i++)
	{
		if(variables[i].name == variableName)
			return variables[i];
	}
}
var loadVariables = function()
{
	$.widget( "custom.catcomplete", $.ui.autocomplete, {
			_renderMenu: function( ul, items ) {
			  var that = this,
				currentCategory = "";
			  $.each( items, function( index, item ) {
				if ( item.category != currentCategory ) {
				  ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
				  currentCategory = item.category;
				}
				that._renderItemData( ul, item );
			  });
			}
		  });
		  
	var request = {message: "getVariables", params: {}};
	chrome.extension.sendMessage(request, function(responseText) {
		//unitSelect = document.getElementById('addmeasurement-variable-name');
		variables = $.parseJSON(responseText);
		var varnames = [];
		$.each(variables, function(_, variable)
		{
			varnames.push({label: variable.name, category: variable.category});
		});
		$("#addmeasurement-variable-name").catcomplete({
			source: varnames,
			select: function (event, ui) {
				var variable = getVariableWithName(ui.item.label);
				$('#addmeasurement-variable-unit').val(variable.unit);
			}
		});
	});
}

var loadVariableUnits = function()
{
	var request = {message: "getVariableUnits", params: {}};
	chrome.extension.sendMessage(request, function(responseText) {
		unitSelect = document.getElementById('addmeasurement-variable-unit');
		units = $.parseJSON(responseText);
		$.each(units.sort(function(a, b)
		{
			return a.name.localeCompare(b.name);
		}), function(_, unit){
			unitSelect.options[unitSelect.options.length] = new Option(unit.name, unit.abbreviatedName);
		});
	});
}

var loadDateTime = function()
{
	$("#addmeasurement-variable-datetime").datetimepicker();
	var currentTime = new Date();
	$("#addmeasurement-variable-datetime").val(currentTime.getFullYear() + '-' + (currentTime.getMonth() + 1) + '-' + currentTime.getDate() + ' ' + currentTime.getHours() + ':00');
}

document.addEventListener('DOMContentLoaded', function () 
{
	
	var wDiff = (330 - window.innerWidth);
	var hDiff = (300 - window.innerHeight);
	
	window.resizeBy(wDiff, hDiff);
	setButtonListeners();
	loadVariables();
	loadVariableUnits();
	loadDateTime();
	$("#addmeasurement-variable-name").focus();
});