var variables = [];
var units = [];


function clearNotifications() {
    var badgeParams = {text: ""};
    chrome.browserAction.setBadgeText(badgeParams);
    chrome.notifications.clear("trackReportNotification", function () {
    });
};


function setBlockHideShow() {

    $('#pickDate').click(function () {
        $('#addmeasurement-variable-date').datetimepicker('show'); //support hide,show and destroy command
    });

    $('#add-pickDate').click(function () {
        $('#add-addmeasurement-variable-date').datetimepicker('show'); //support hide,show and destroy command
    });

    $("#signup_block").hide();
    $("#record_a_measurement_block").hide();
    $("#edt_record_a_measurement_block").hide();
    $("#add_record_a_measurement_block").hide();

    chrome.cookies.get({url: 'https://app.quantimo.do', name: 'wordpress_logged_in_c9005e0fb733417360658b145e2ed413'},
        function (cookie) {
            if (cookie) {
                $('body').css('width', '360px');
                $("#record_a_measurement_block").show();
            } else {
                $('body').css('width', '270px');
                $("#signup_block").show();
            }
        });


}

function setButtonListeners() {

    /*document.getElementById('button-add').onclick=onAddButtonClicked;
     document.getElementById('button-close').onclick=onCloseButtonClicked;

     */

    document.getElementById('button_quantimo_facebook_sign_in').onclick = onQmFacebookButtonClicked;
    document.getElementById('button_quantimo_google_sign_in').onclick = onQmGoogleButtonClicked;
    document.getElementById('button_quantimo_sign_in').onclick = onQmSignButtonClicked;

    document.getElementById('button-record-a-measurement').onclick = onQmRcdMstButtonClicked;

    document.getElementById('button-edit-record-a-measurement').onclick = onEdtButtonClicked;
    document.getElementById('button-add-record-a-measurement').onclick = onAddButtonClicked;
    document.getElementById('anhor-register').onclick = onRegisterAClicked;

    document.getElementById('btnQuantiModoRegister').onclick = btnQuantiModoRegisterClick;

    document.getElementById('btnQuantiModoRegister_1').onclick = btnQuantiModoRegisterClick;
    document.getElementById('btnQuantiModoRegister_2').onclick = btnQuantiModoRegisterClick;

    document.getElementById('logo-correlate').onclick = btnQuantiModoLogoCorrelateClick;
    document.getElementById('logo-correlate-1').onclick = btnQuantiModoLogoCorrelateClick;
    document.getElementById('logo-correlate-2').onclick = btnQuantiModoLogoCorrelateClick;

    //var optionsUrl = chrome.extension.getURL("src/options/options.html");
    //var content = '<a href="' + optionsUrl + '" target="_blank">Options</a>';


};

/**
 * Record a measurement is clicked
 */
var onQmRcdMstButtonClicked = function () {
    var name = $("#addmeasurement-variable-name").val();

    if (name == '') {

        $('.validation-holder span').text('Please enter the variable name');
        $('#addmeasurement-variable-name').addClass('error');

        return;
    } else {

        $('.validation-holder').text('');
        $('#addmeasurement-variable-name').removeClass('error');

    }

    var n_value = getVariableWithName(name);

    if (n_value == null) {
        $("#record_a_measurement_block").hide();
        $("#add_record_a_measurement_block").show();
        $("#add-addmeasurement-variable-name").val(name);

    }
    else {
        $("#record_a_measurement_block").hide();
        $("#edt_record_a_measurement_block").show();
        $("#edt-addmeasurement-variable-name").val(name);

    }

}


// registration button clicked
var btnQuantiModoRegisterClick = function () {
    var optionsUrl = chrome.extension.getURL("options/options.html");
    //var content = '<a href="' + optionsUrl + '" target="_blank">Options</a>';

    chrome.tabs.create({url: optionsUrl});
};


var btnQuantiModoLogoCorrelateClick = function () {
    chrome.tabs.create({url: "https://app.quantimo.do/correlate/"});
};


// registration button clicked
var onRegisterAClicked = function () {
    chrome.tabs.create({url: "https://app.quantimo.do/api/v2/auth/register"});
};

// facebook button clicked
var onQmFacebookButtonClicked = function () {
    chrome.tabs.create({url: "https://app.quantimo.do/api/v2/auth/social/webLogin?provider=facebook"});
};

// google button clicked
var onQmGoogleButtonClicked = function () {
    chrome.tabs.create({url: "https://app.quantimo.do/api/v2/auth/social/webLogin?provider=google"});
};

// Simple Sign In button clicked
var onQmSignButtonClicked = function () {
    chrome.tabs.create({url: "https://app.quantimo.do/api/v2/auth/login"});
};


var onQmButtonClicked = function () {
    chrome.tabs.create({url: "https://app.quantimo.do/analyze"});
};
var onCloseButtonClicked = function () {
    window.close();
};


/**
 * Desc:
 */

var onEdtButtonClicked = function () {
    // Create an array of measurements
    var name = $("#edt-addmeasurement-variable-name").val();
    var unit = $("#addmeasurement-variable-unit").val();
    var value = $("#addmeasurement-variable-value").val();
    var valueCategory = $("#addmeasurement-variable-category").val();
    var combineOp = $("#combineOperation").val();
    var datetimeString = $("#addmeasurement-variable-date").val();

    datetimeString = datetimeString.replace("AM", "");
    datetimeString = datetimeString.replace("PM", "");

    var hour = $('#addmeasurement-variable-timeh').val();
    var min = $('#addmeasurement-variable-timem').val();
    var ap = $('#addmeasurement-variable-timeap').val();
    var datetime = new Date(datetimeString);

    /*
     alert (datetime) ;
     alert (Math.floor(datetime.getTime()  / 1000));
     /*datetime.setHours(parseInt(hour) + (ap * 12));
     datetime.setMinutes(min);
     datetime.setSeconds(0);
     */

    if (name == '') {
        alert("Please enter the variable name.");
        return;
    }
    if (value == '') {
        alert("Please enter the value.");
        return;
    }

    //var variable = getVariableWithName(name);
    var measurements = [
        {
            timestamp: Math.floor(datetime.getTime() / 1000),
            value: value
        }
    ];
    //alert ( measurements ) ;
    // Add it to a request, payload is what we'll send to QuantiModo
    var request = {
        message: "uploadMeasurements",
        payload: [
            {
                measurements: measurements,
                name: name,
                source: "QuantiModo",
                category: valueCategory,
                combinationOperation: combineOp,
                unit: unit
            }
        ]

    };


    chrome.extension.sendMessage(request, function (responseText) {
        var response = $.parseJSON(responseText);
        //alert (response) ;
        if (response.success == true) {
            //save measurement to pre-populate this values next time
            localCache.setSubmittedMeasurement(name, value, unit);
            document.getElementById('addmeasurement-variable-value').value = "";
            //document.getElementById('edt-addmeasurement-variable-value').value = "";
            window.close();
        }
        else {
            alert("Adding a measurement failed.");
            console.log(responseText);
        }
    });

    clearNotifications();
};


var onAddButtonClicked = function () {
    // Create an array of measurements
    var name = $("#add-addmeasurement-variable-name").val();
    var unit = $("#add-addmeasurement-variable-unit").val();
    var value = $("#add-addmeasurement-variable-value").val();
    var valueCategory = $("#addmeasurement-variable-category").val();
    var combineOp = $("#combineOperation").val();
    var datetimeString = $("#add-addmeasurement-variable-date").val();

    //alert (Date.parse(datetimeString)) ;
    datetimeString = datetimeString.replace("AM", "");
    datetimeString = datetimeString.replace("PM", "");
    //


    //year, month, day, hours, minutes, seconds, milliseconds
    var hour = $('#add-addmeasurement-variable-timeh').val();
    var min = $('#add-addmeasurement-variable-timem').val();
    var ap = $('#add-addmeasurement-variable-timeap').val();
    var datetime = new Date(datetimeString);

    /*
     datetime.setHours(parseInt(hour) + (ap * 12));
     datetime.setMinutes(min);
     datetime.setSeconds(0);
     */

    if (name == '') {
        alert("Please enter the variable name.");
        return;
    }
    if (value == '') {
        alert("Please enter the value.");
        return;
    }
    //var variable = getVariableWithName(name);
    var measurements = [
        {
            timestamp: Math.floor(datetime.getTime() / 1000),
            value: value
        }
    ];
    // Add it to a request, payload is what we'll send to QuantiModo
    var request = {
        message: "uploadMeasurements",
        payload: [
            {
                measurements: measurements,
                name: name,
                source: "QuantiModo",
                category: valueCategory,
                combinationOperation: combineOp,
                unit: unit
            }
        ]

    };
    chrome.extension.sendMessage(request, function (responseText) {
        var response = $.parseJSON(responseText);
        if (response.success == true) {

            localCache.setSubmittedMeasurement(name, value, unit);

            document.getElementById('addmeasurement-variable-value').value = "";
            document.getElementById('add-addmeasurement-variable-value').value = "";
            window.close();
        }
        else {
            alert("Adding a measurement failed.");
            console.log(responseText);
        }
    });

    clearNotifications();
};

var onVariableNameInputFocussed = function () {
    $("#snd_gap").height('100px');
    //document.getElementById('sectionMeasurementInput').style.opacity="0.2";
};
var onVariableNameInputUnfocussed = function () {
    //$("#snd_gap").height('10px');
    //document.getElementById('sectionMeasurementInput').style.opacity="1";
};

var getVariableWithName = function (variableName) {
    var filteredVars = jQuery.grep(variables, function (variable, i) {
        return variable.name == variableName;
    });
    if (filteredVars.length > 0) return filteredVars[0];
    return null;
};

var getUnitWithAbbriatedName = function (unitAbbr) {
    var filteredUnits = jQuery.grep(units, function (unit, i) {
        return unit.abbreviatedName == unitAbbr;
    });

    if (filteredUnits.length > 0) return filteredUnits[0];
    return null;
};


var loadVariableCategories = function () {
    var request = {message: "getVariableCategories", params: {}};

    chrome.extension.sendMessage(request, function (response) {

        handleResponse(response, function (variableCategories) {
            variables = variableCategories;
            var varnames = [];
            var categories = [];
            variableCategorySelect = document.getElementById('addmeasurement-variable-category');

            if (variables.length) {
                $.each(variables.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                }), function (_, variable) {
                    //varnames.push({label: variable.name, category: variable.category});
                    varnames.push(variable.name);
                    categories.push(variable.name);
                });
            }

            if (categories.length) {
                categories.sort();
                for (var i = 0; i < categories.length; i++)
                    variableCategorySelect.options[variableCategorySelect.options.length] = new Option(categories[i], categories[i]);
            }

        });

    });
};


var loadVariables = function () {
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _renderMenu: function (ul, items) {
            var that = this,
                currentCategory = "";
            $.each(items, function (index, item) {
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                that._renderItemData(ul, item);
            });

        }
    });

    var request = {message: "getVariables", params: {}};

    chrome.extension.sendMessage(request, function (response) {

        handleResponse(response, function (variables) {

            variables = variables;
            var varnames = [];
            var categories = [];
            variableCategorySelect = document.getElementById('addmeasurement-variable-category');

            if (variables.length) {
                $.each(variables.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                }), function (_, variable) {
                    varnames.push(variable.name);
                });
            }

        });

        $("#addmeasurement-variable-name").autocomplete({
            source: function (req, resp) {
                $.ajax({
                    method: 'GET',
                    url: 'https://app.quantimo.do/api/variables/search/' + $("#addmeasurement-variable-name").val() + '?includePublic=true',
                    success: function (data) {
                        variables = data;
                        resp($.map(data, function (variable) {
                            return {
                                label: variable.name,
                                value: variable.name,
                                variable: variable
                            }
                        }));
                    }
                })
            },
            minLength: 2,
            select: function (event, ui) {

                document.getElementById("addmeasurement-variable-value").focus();
                //var variable = getVariableWithName(ui.item.label);
                var variable = ui.item.variable;
                $("input[name='combineOperation'][value='" + variable.combinationOperation + "']").prop('checked', true);
                if (variable == null) return;
                $("#addmeasurement-variable-category").val(variable.category);

                var variableUnit = null;
                var variableValue = '';
                var lastMeasurementForVariable = localCache.getSubmittedMeasurement(variable.name);

                if (lastMeasurementForVariable) {

                    variableUnit = getUnitWithAbbriatedName(lastMeasurementForVariable.unit);
                    variableValue = lastMeasurementForVariable.value;

                } else {

                    if (variable.mostCommonUnit) {
                        variableUnit = getUnitWithAbbriatedName(variable.mostCommonUnit);
                    } else {
                        variableUnit = getUnitWithAbbriatedName(variable.abbreviatedUnitName);
                    }

                    if (variable.mostCommonValue) {
                        variableValue = variable.mostCommonValue;
                    }

                }

                if (variableUnit == null) return;
                $("#addmeasurement-variable-unitCategory").val(variableUnit.category).trigger('change');
                $("#addmeasurement-variable-unit").val(variableUnit.abbreviatedName);
                $("#addmeasurement-variable-value").val(variableValue);

            }
        });

    });

};


var loadVariableUnits = function () {

    var request = {message: "getVariableUnits", params: {}};
    chrome.extension.sendMessage(request, function (response) {

        handleResponse(response, function (variableUnits) {
            units = variableUnits;
            unitSelect = document.getElementById('addmeasurement-variable-unit');

            if (units.length) {
                $.each(units.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                }), function (_, unit) {
                    unitSelect.options[unitSelect.options.length] = new Option(unit.name, unit.abbreviatedName);
                });
            }

        });
    });

};

// Load option for the Distance

var loadAddVariableUnits = function () {


    var request = {message: "getVariableUnits", params: {}};
    chrome.extension.sendMessage(request, function (response) {

        handleResponse(response, function (variableUnits) {
            units = variableUnits;
            unitSelect = document.getElementById('add-addmeasurement-variable-unit');

            if (units.length) {
                $.each(units.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                }), function (_, unit) {
                    unitSelect.options[unitSelect.options.length] = new Option(unit.name, unit.abbreviatedName);
                });
            }

        });

    });
};

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}


var loadDateTime = function () {

    $('#addmeasurement-variable-date').datetimepicker({
        dayOfWeekStart: 1,
        lang: 'en',
        startDate: '1986/01/05',
        format: 'h:i A m/d/Y'
    });


    var currentTime = new Date();

    var j_years = currentTime.getFullYear();
    var j_months = currentTime.getMonth() + 1;
    var j_date = currentTime.getDate();

    var j_hours = addZero(currentTime.getHours());
    var j_minutes = addZero(currentTime.getMinutes());

    var jjj_minutes = ((currentTime.getHours() % 12) ? currentTime.getHours() % 12 : 12) + ':' + currentTime.getMinutes() + (currentTime.getHours() < 12 ? 'AM' : 'PM');

    var c_date = j_months + "/" + j_date + "/" + j_years;

    var c_date_time = jjj_minutes + " " + c_date;

    $('#addmeasurement-variable-date').datetimepicker({value: c_date_time, step: 10});

};


// Load Date Time
var loadAddDateTime = function () {
    $('#add-addmeasurement-variable-date').datetimepicker({
        dayOfWeekStart: 1,
        lang: 'en',
        startDate: '1986/01/05',
        format: 'h:i A m/d/Y',
        todayButton: true,
        inverseButton: true
    });

    var currentTime = new Date();

    var j_years = currentTime.getFullYear();
    var j_months = currentTime.getMonth() + 1;
    var j_date = currentTime.getDate();

    var j_hours = addZero(currentTime.getHours());
    var j_minutes = addZero(currentTime.getMinutes());

    var c_date = j_months + "/" + j_date + "/" + j_years;

    var jjj_minutes = ((currentTime.getHours() % 12) ? currentTime.getHours() % 12 : 12) + ':' + currentTime.getMinutes() + (currentTime.getHours() < 12 ? 'AM' : 'PM');

    var c_date_time = jjj_minutes + " " + c_date;

    $('#add-addmeasurement-variable-date').datetimepicker({value: c_date_time, step: 10});

};

var handleResponse = function (response, callback) {
    if (response.status == 401) {
        //go to login screen

        $('body').css('width', '270px');
        $('#record_a_measurement_block').hide();
        $('#edt_record_a_measurement_block').hide();
        $('#add_record_a_measurement_block').hide();

        $("#signup_block").show();

    } else {
        var parsedResponse = JSON.parse(response.responseText);
        callback(parsedResponse);
    }

};

document.addEventListener('DOMContentLoaded', function () {
    setBlockHideShow();
    setButtonListeners();


    loadVariables();
    loadVariableCategories();
    loadVariableUnits();
    loadAddVariableUnits();


    loadAddDateTime();
    loadDateTime();

    var inputField = document.getElementById("addmeasurement-variable-name");
    inputField.onfocus = onVariableNameInputFocussed;
    inputField.onblur = onVariableNameInputUnfocussed;

    setInterval(function () {
        inputField.focus();
    }, 50);

    $('#addmeasurement-variable-name').keypress(function () {
        if ($(this).val().length > 0) {
            $('#addmeasurement-variable-name').removeClass('error');
            $('.validation-holder span').text('');
        }
    })

});

var localCache = {

    setSubmittedMeasurement: function (name, value, unit) {

        var storageEntry = {
            variable: name,
            value: value,
            unit: unit
        };

        var lastSubmittedMeasurements = localStorage.getItem('lastSubmittedMeasurements');

        if (!lastSubmittedMeasurements) {
            lastSubmittedMeasurements = [];
            lastSubmittedMeasurements.push(storageEntry);
        } else {
            lastSubmittedMeasurements = JSON.parse(lastSubmittedMeasurements);

            for (var i = 0; i < lastSubmittedMeasurements.length; i++) {
                if (lastSubmittedMeasurements[i].variable == name) {
                    lastSubmittedMeasurements[i].value = value;
                    lastSubmittedMeasurements[i].unit = unit;
                    break;
                }
                if (i == lastSubmittedMeasurements.length - 1) {
                    lastSubmittedMeasurements.push(storageEntry);
                }
            }
        }

        localStorage.setItem('lastSubmittedMeasurements', JSON.stringify(lastSubmittedMeasurements));

    },

    getSubmittedMeasurement: function (name) {

        var lastSubmittedMeasurements = localStorage.getItem('lastSubmittedMeasurements');

        if (!lastSubmittedMeasurements) {
            return null;
        } else {
            lastSubmittedMeasurements = JSON.parse(lastSubmittedMeasurements);

            for (var i = 0; i < lastSubmittedMeasurements.length; i++) {
                if (lastSubmittedMeasurements[i].variable == name) {
                    return lastSubmittedMeasurements[i];
                }
            }
        }

    }

}

