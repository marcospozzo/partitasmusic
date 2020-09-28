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

// $('.form button').click(() => console.log('button pressed'));
