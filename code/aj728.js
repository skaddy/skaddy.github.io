$(document).ready(function() {
	var response = $.get("/objects/script/728.js", function() {
		var scriptText = "<pre><code class=\"javascript\">"+response.responseText+"</code></pre>";
		$('#content').html(scriptText);
		hljs.initHighlightingOnLoad();
	});
});