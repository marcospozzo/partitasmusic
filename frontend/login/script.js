$('.message a').click(function () {
  $('form').animate({ height: 'toggle', opacity: 'toggle' }, 'slow');
});

$('.form button').click(() => console.log('button pressed'));
