extends Node

func _ready():
	# Handle web-specific configurations and workarounds
	if OS.get_name() == "HTML5":
		# Add event listener for going back to prevent accidental navigation away
		JavaScript.eval("""
			window.addEventListener('beforeunload', function(e) {
				// This will show a confirmation dialog when trying to navigate away/refresh
				e.preventDefault();
				e.returnValue = '';
				return '';
			});
		""", true)
		
		# Focus the canvas on start to ensure input works correctly
		JavaScript.eval("window.addEventListener('load', function() { setTimeout(function() { document.getElementById('canvas').focus(); }, 200); });", true)
		
		# Handle browser going to fullscreen and back
		JavaScript.eval("""
			document.addEventListener('fullscreenchange', function() {
				if (document.fullscreenElement) {
					// Browser entered fullscreen
					console.log('Browser entered fullscreen mode');
				} else {
					// Browser exited fullscreen
					console.log('Browser exited fullscreen mode');
				}
			});
		""", true)
