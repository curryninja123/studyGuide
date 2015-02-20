function validateUsername(somename, callback) {
    $.post('/sessions/api/usernamecheck', {
        username: somename
    }, function(result) {
        callback(result && result.isValid);
    });
}

lastCalled = 0;
errorMessage = 'Username too short (must be at least six characters long)';

function modifyUI(success) {
    $("#userinfo").removeClass("invisible");
    if (success) {
        $("#userinfo").text("Valid Username");
        $("#userinfo").removeClass("red");
        $("#userinfo").addClass("green");
    } else {
        $("#userinfo").text(errorMessage);
        $("#userinfo").addClass("red");
        $("#userinfo").removeClass("green");
    }
}

function changeHandler() {
    if ((new Date()).getTime() - lastCalled >= 1000) {
        lastCalled = (new Date()).getTime();
        username = $('#username').val();
        if (username.length < 6) {
            errorMessage = 'Username too short (must be at least six characters long)';
            modifyUI(false);
        } else {
            validateUsername(username, function(success) {
                errorMessage = 'Username not unique';
                modifyUI(success);
            });
        }
    }
}

$(document).ready(function() {
    $("#username").change(changeHandler);
});