$('#view_source_code').click(function(evt){
	evt.preventDefault();
	$('#source_code')
		.stop()
		.animate({
			top: 0
	});
});

$('#hide_source_code').click(function(evt){
	evt.preventDefault();
	$('#source_code')
		.stop()
		.animate({
			top: -400
	});
});