$(document).ready(function() {
	var response = $.get("/objects/script/728.js", function(data) {
		   		console.log(data); //data returned

/*		var scriptText = "<pre><code class=\"javascript\">"+data+"</code></pre>";
		$('#content').html(scriptText);
		hljs.initHighlightingOnLoad();*/
	});

	$.getScript("/objects/script/728.js", function(data) {
   		console.log(data); //data returned
   
	});
});
/*
	var scriptText = "<pre><code class=\"javascript\">"+data+"</code></pre>";
		$('#content').html(scriptText);
		hljs.initHighlightingOnLoad();
		*/