function buttonClick(n) {
	$("#li" + n).addClass("active");
	for (var i = 1; i <= 5; i++) {
		if (i != n) {
			$("#li" + n).removeClass("active");
		}
	}
}