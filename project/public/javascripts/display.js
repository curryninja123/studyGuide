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
		console.log('hey');
		$('#bottom-alerts').append($.parseHTML(
			'<div class="alert alert-success">Added To Your Profile</div>'
		));
		console.log(result);
	}, 'json');

	return false;
}