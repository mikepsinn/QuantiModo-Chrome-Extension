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
var units = [];

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
	var valueCategory = $("#addmeasurement-variable-category").val();
	var combineOp = $("input:radio[name ='combineOperation']:checked").val();
	var datetimeString = $("#addmeasurement-variable-date").val();
	
	var hour = $('#addmeasurement-variable-timeh').val();
	var min = $('#addmeasurement-variable-timem').val();
	var ap = $('#addmeasurement-variable-timeap').val();
	var datetime = new Date(datetimeString);
	datetime.setHours(parseInt(hour) + (ap * 12));
	datetime.setMinutes(min);
	datetime.setSeconds(0);
	alert(datetime);
	exit;
	if (name == '') {
		alert("Please enter the variable name."); return;
	}
	if (value == '') {
		alert("Please enter the value."); return;
	}
	//var variable = getVariableWithName(name);
	var measurements = 	[
							{
								timestamp: 	Math.floor(datetime.getTime()  / 1000), 
								value: 		value
							}
						];
	// Add it to a request, payload is what we'll send to QuantiModo
	var request =		{
							message: "uploadMeasurements",
							payload:[
										{
											measurements:			measurements,
											name: 					name,
											source: 				"QuantiMo.Do",
											category: 				valueCategory,
											combinationOperation: 	combineOp,
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
	var filteredVars = jQuery.grep(variables, function (variable, i) {
			return variable.name == variableName;
	});
	
	if (filteredVars.length > 0) return filteredVars[0];
	return null;
}

var getUnitWithAbbriatedName = function(unitAbbr)
{
	var filteredUnits = jQuery.grep(units, function (unit, i) {
			return unit.abbreviatedName == unitAbbr;
	});
	
	if (filteredUnits.length > 0) return filteredUnits[0];
	return null;
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
		var categories = [];
		variableCategorySelect = document.getElementById('addmeasurement-variable-category');
		$.each(variables.sort(function(a, b)
		{
			return a.name.localeCompare(b.name);
		}), function(_, variable)
		{
			//varnames.push({label: variable.name, category: variable.category});
			varnames.push(variable.name);
			if ($.inArray(variable.category, categories)==-1) {
				categories.push(variable.category);
			}
		});
		
		categories.sort();
		for(var i=0; i<categories.length; i++)
			variableCategorySelect.options[variableCategorySelect.options.length] = new Option(categories[i], categories[i]);
		
		$("#addmeasurement-variable-name").autocomplete({
		//$("#addmeasurement-variable-name").catcomplete({
			source: varnames,
			select: function (event, ui) {
				var variable = getVariableWithName(ui.item.label);
				$("input[name='combineOperation'][value='" + variable.combinationOperation + "']").prop('checked', true);
				if (variable == null) return;
				$( "#addmeasurement-variable-category").val(variable.category);
				var variableUnit = getUnitWithAbbriatedName(variable.unit);
				if (variableUnit == null) return;
				$( "#addmeasurement-variable-unitCategory").val(variableUnit.category).trigger('change');
				$( "#addmeasurement-variable-unit").val(variableUnit.abbreviatedName);
				
			}
		});
	});
}

var loadVariableUnits = function()
{
	$( "#addmeasurement-variable-unitCategory" ).change(function() {
		
		var filteredUnits = jQuery.grep(units, function (unit, i) {
			return unit.category == $( "#addmeasurement-variable-unitCategory" ).val();
		});
		$( "#addmeasurement-variable-unit option").remove();
		unitSelect = document.getElementById('addmeasurement-variable-unit');
		//unitSelect.options = [];
		$.each(filteredUnits.sort(function(a, b)
		{
			return a.name.localeCompare(b.name);
		}), function(_, unit){
			unitSelect.options[unitSelect.options.length] = new Option(unit.name + " (" + unit.abbreviatedName + ")", unit.abbreviatedName);
		});
	});

	var request = {message: "getVariableUnits", params: {}};
	chrome.extension.sendMessage(request, function(responseText) {
		unitSelect = document.getElementById('addmeasurement-variable-unit');
		unitCategorySelect = document.getElementById('addmeasurement-variable-unitCategory');
		units = $.parseJSON(responseText);
		var categories = [];
		$.each(units.sort(function(a, b)
		{
			return a.name.localeCompare(b.name);
		}), function(_, unit){
			//unitSelect.options[unitSelect.options.length] = new Option(unit.name + " (" + unit.abbreviatedName + ")", unit.abbreviatedName);
			if ($.inArray(unit.category, categories)==-1) {
				categories.push(unit.category);
			}
		});
		categories.sort();
		for(var i=0; i<categories.length; i++)
			unitCategorySelect.options[unitCategorySelect.options.length] = new Option(categories[i], categories[i]);

		$( "#addmeasurement-variable-unitCategory").val(categories[0]).trigger('change');
	});
}


var loadDateTime = function()
{
	$("#addmeasurement-variable-date").datepicker({
      showOtherMonths: true,
      selectOtherMonths: true
    });
	$("#addmeasurement-variable-date").datepicker("setDate", new Date());
	$("#addmeasurement-variable-date").datepicker( "option", "dateFormat", "mm/dd/y");
	
	hourSelect = document.getElementById('addmeasurement-variable-timeh');
	hourSelect.options[0] = new Option(12, 0);
	for(var i=1; i<12; i++)
		hourSelect.options[i] = new Option(i, i);
	minSelect = document.getElementById('addmeasurement-variable-timem');
	for(var i=0; i<60; i++)
		minSelect.options[i] = new Option(i, i);
	ampmSelect = document.getElementById('addmeasurement-variable-timeap');
	ampmSelect.options[0] = new Option("AM", 0);
	ampmSelect.options[1] = new Option("PM", 1);
	
	var currentTime = new Date();
	$('#addmeasurement-variable-timeh').val(currentTime.getHours() % 12);
	$('#addmeasurement-variable-timem').val(currentTime.getMinutes());
	$('#addmeasurement-variable-times').val(0);
	//$("#addmeasurement-variable-date").val(currentTime.getFullYear() + '-' + (currentTime.getMonth() + 1) + '-' + currentTime.getDate();// + ' ' + currentTime.getHours() + ':00');
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