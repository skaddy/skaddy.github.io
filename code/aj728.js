$(document).ready(function() {
	response = jQuery.get('/objects/script/728.js', function() {
    	var scriptText = "<pre><code class=\"javascript\">"+response.responseText+"</code></pre>";
		$('#content').html(scriptText);
		hljs.initHighlightingOnLoad();
	});
	var scriptText = "<pre><code class=\"javascript\">"+response.responseText+"</code></pre>";
	$('#content').html(scriptText);
	hljs.initHighlightingOnLoad();
});