$(document).ready(function() {

	$('#viewCode').click(function() {

		var loaded = $.get("objects/728.js", function() {

			var code = "<pre><code>"+loaded.responseText+"</code></pre>";
			$('#content').html(code);
			hljs.initHighlightingOnLoad();
		});
		return false;
	});
}

