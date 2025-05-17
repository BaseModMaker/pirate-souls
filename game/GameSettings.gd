extends Node

func _ready():
	# Initialize global game settings
	if OS.get_name() != "HTML5":
		# Explicitly set fullscreen mode at startup for desktop platforms
		OS.window_fullscreen = true
		# Small delay to ensure it takes effect
		yield(get_tree().create_timer(0.1), "timeout")
		# Force fullscreen again after delay
		OS.window_fullscreen = true
	else:
		# Web builds use a different approach for fullscreen
		# JS will handle fullscreen toggling
		JavaScript.eval("document.documentElement.requestFullscreen = document.documentElement.requestFullscreen || document.documentElement.mozRequestFullscreen || document.documentElement.webkitRequestFullscreen || document.documentElement.msRequestFullscreen;", true)

func _input(event):
	# Handle fullscreen toggle (F11 or Alt+Enter)
	if Input.is_action_just_pressed("toggle_fullscreen"):
		if OS.get_name() != "HTML5":
			OS.window_fullscreen = !OS.window_fullscreen
			# If coming out of fullscreen, ensure window is positioned at top-left
			if not OS.window_fullscreen:
				OS.window_position = Vector2(0, 0)
		else:
			# Toggle fullscreen in browser using JavaScript
			JavaScript.eval("if(document.fullscreenElement){document.exitFullscreen();}else{document.documentElement.requestFullscreen();}", true)
	
	# Escape key exits fullscreen mode but doesn't quit the game
	if Input.is_action_just_pressed("ui_cancel"):
		if OS.get_name() != "HTML5" and OS.window_fullscreen:
			OS.window_fullscreen = false
			# When exiting fullscreen with ESC, set window position to top-left
			OS.window_position = Vector2(0, 0)
		elif OS.get_name() == "HTML5":
			# Exit fullscreen in browser if in fullscreen mode
			JavaScript.eval("if(document.fullscreenElement){document.exitFullscreen();}", true)
