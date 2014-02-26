function clearNotifications()
{
	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);
	chrome.notifications.clear("moodReportNotification", function(){});
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

var onAddButtonClicked = function()
{
	// Figure out what rating was selected
	//alert('add a measurement is clicked');
	//var backPage = chrome.extension.getBackgroundPage();
	//console.log(backPage);
	
	//backPage.AnalyzePage.showAddMeasurementDialog();
	
	// Create an array of measurements
	var measurements = 	[
							{
								timestamp: 	Math.floor(Date.now() / 1000), 
								value: 		0.97
							}
						];
	// Add it to a request, payload is what we'll send to QuantiModo
	var request =		{
							message: "uploadMeasurements",
							payload:[
										{
											measurements:			measurements,
											name: 					"Sleep Quality",
											source: 				"QuantiMo.Do",
											category: 				"Sleep",
											combinationOperation: 	"",
											unit:					"/1"
										}
									]
									
						};
	// Request our background script to upload it for us
	alert('calling' + request);
	alert( JSON.stringify(request));
	chrome.extension.sendMessage(request);
	alert('called' + request);
	//clearNotifications();
	window.close();
	
	/*var sectionRateMood = document.getElementById("sectionRateMood");
	var sectionSendingMood = document.getElementById("sectionSendingMood");
	
	sectionRateMood.className = "invisible";
	setTimeout(function()
	{
			sectionRateMood.style.display = "none";

			sectionSendingMood.innerText = "Sending mood";
			sectionSendingMood.style.display = "block";
			sectionSendingMood.className = "visible";
			pushMeasurement(measurement, function(response) 
				{
					sectionSendingMood.className = "invisible";
					setTimeout(function()
					{
						window.close();
					}, 300);
				});
				
			clearNotifications();
		}, 400 );*/
}

document.addEventListener('DOMContentLoaded', function () 
{
	
	var wDiff = (346 - window.innerWidth);
	var hDiff = (60 - window.innerHeight);
	
	window.resizeBy(wDiff, hDiff);

	setButtonListeners();
});