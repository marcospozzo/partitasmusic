// login form animation between the login form and the reset password form
$('.first-pair').click(function () {
  $('.login-form').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
  $('.reset-password-form').animate(
    { height: 'toggle', opacity: 'toggle' },
    'slow'
  );
});

// login form animation between the login form and the sign up form
$('.second-pair').click(function () {
  $('.login-form').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
  $('.signup-form').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
});

$('#go-to-login').click(function () {
  window.location.href = '/login';
});

$('.logo').click(function () {
  window.location.href = '/';
});

$('#close').click(function () {
  window.close();
});

// set password form validation
$(function () {
  $('#set-form').validate({
    rules: {
      password: {
        required: true,
        minlength: 6,
      },
      confirm: {
        required: true,
        minlength: 6,
        equalTo: '#password',
      },
    },
    submitHandler: function () {
      document.forms['set-form'].submit();
    },
  });
});

// login form validation
$(function () {
  $('#login-form').validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
      },
    },
    submitHandler: function () {
      document.forms['login-form'].submit();
    },
  });
});

// reset password form validation
$(function () {
  $('#reset-password-form').validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
    },
    submitHandler: function () {
      document.forms['reset-password-form'].submit();
    },
  });
});

// signup form validation
$(function () {
  $('#signup-form').validate({
    rules: {
      name: {
        required: true,
        maxlength: 25,
      },
      email: {
        required: true,
        email: true,
      },
      whoIs: {
        required: true,
        maxlength: 500,
      },
    },
    submitHandler: function () {
      document.forms['signup-form'].submit();
    },
  });
});

// contact form validation
$(function () {
  $('#contact-form').validate({
    rules: {
      name: {
        required: true,
        maxlength: 25,
      },
      email: {
        required: true,
        email: true,
      },
      message: {
        required: true,
        maxlength: 500,
      },
    },
    submitHandler: function () {
      document.forms['contact-form'].submit();
    },
  });
});

// login modal
// when the user clicks on the button, open the modal
$('#myBtn').click(function () {
  $('#myModal').show();
});

// when the user clicks on <span> (x), close the modal
$('.close').click(function () {
  $('#myModal').hide();
});

// when the user clicks anywhere outside of the modal, close it
const modal = document.getElementById('myModal');
$(window).click(function (event) {
  if (event.target == modal) {
    $('#myModal').hide();
  }
});

// when the user presses esc key, close the modal
$(document).keyup(function (e) {
  if (e.keyCode === 27) $('#myModal').hide(); // esc key
});
