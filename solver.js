var supportedVars = ['x', 'v', 'theta'];
var functionMap = {
	'x' : {
		prompt: ['v', 'theta'],
		solve: function(arr) {
			return arr[0] * arr[0] * Math.sin(2 * arr[1]) / 9.806;
		}
	},
	'v' : {
		prompt: ['x', 'theta'],
		solve: function(arr) {
			return Math.sqrt(arr[0] * 9.806 / sin(2 * arr[1]));
		}
	},
	'theta' : {
		prompt: ['x', 'v'],
		solve: function(arr) {
			return .5 * Math.asin(arr[0] * 9.806 / arr[1] / arr[1]);
		}
	}
};

// http://localhost:8000/formula/display/54e0c221ab3501c5e6a198c6