$(document).ready(function() {
	$.getScript("/objects/script/728.js", function(data) {
		var scriptText = "<pre><code class=\"javascript\">"+data+"</code></pre>";
		$('#content').html(scriptText);
		hljs.initHighlightingOnLoad();
	},false);
});