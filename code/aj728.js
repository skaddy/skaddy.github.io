$(document).ready(function() {
	var response = jQuery.ajax({
         url:    '/objects/script/728.js',
         success: function(data) {
                    	var scriptText = '<pre><code class="javascript">'+data+'</code></pre>';
						$('#content').html(scriptText);
						hljs.initHighlightingOnLoad();
                  },
         async:   false
    });          
    var scriptText = '<pre><code class="javascript">'+response.responseText+'</code></pre>';
	$('#content').html(scriptText);
	hljs.initHighlightingOnLoad();
});