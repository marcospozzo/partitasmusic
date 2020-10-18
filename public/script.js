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
      whois: {
        required: true,
        maxlength: 500,
      },
    },
    submitHandler: function () {
      document.forms['signup-form'].submit();
    },
  });
});
