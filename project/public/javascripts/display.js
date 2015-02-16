function buttonClick(n) {
	$("#li" + n).addClass("active");
	for (var i = 1; i <= 5; i++) {
		if (i != n) {
			$("#li" + n).removeClass("active");
		}
	}
}

function addToProfile(formulaId) {
	console.log(formulaId);
	// $.post({
	// 	// url: '/formula/profile/add/' + formulaId,
	// 	url: null,
	// 	success: function(result) {
	// 		console.log('hey');
	// 		$('#bottom-alerts').append($.parseHTML(
	// 			'<div class="alert alert-success">Added To Your Profile</div>'
	// 		));
	// 		console.log(result);
	// 	}
	// });

	$.post('/formula/profile/add/' + formulaId, {}, function(result) {
		if (!result.error) {
			$('#bottom-alerts').append($.parseHTML(
				'<div class="alert alert-success">Added To Your Profile</div>'
			));
		}
	}, 'json');

	return false;
}

function terminate() {
	console.log("HEY");
	values = []
	for (var i = 0; i < functionMap[currentVar].prompt.length; i++) {
		values[i] = parseFloat($('#solver' + functionMap[currentVar].prompt[i]).val());
	}
	console.log(values);
	$('#solveResult').text('' + functionMap[currentVar].solve(values));
}

var currentVar = '';
function dealWith(variable) {
	currentVar = variable;
	$('#solver2').html('');
	var text = '<div class="form-group">';
	for (var i = 0; i < functionMap[variable].prompt.length; i++) {
		text += '<input type="number" id="solver' + functionMap[variable].prompt[i] + 
			'" placeholder="' + functionMap[variable].prompt[i] + ' value" >';
	}
	text += '</div>';
	text += '<br><button id="esp" class="btn btn-primary onclick="terminate()">Solve</button>';
	$('#solver2').append(text);
	$('#esp').click(terminate);
}



$(document).ready(function() {
	if (supportedVars) {
		for (var i = 0; i < supportedVars.length; i++) {
			$('#solver').append($.parseHTML(
				'<button class="btn btn-primary" onclick=dealWith("' + supportedVars[i] + '")>' + supportedVars[i] + '</button>'));
		}
	}
});