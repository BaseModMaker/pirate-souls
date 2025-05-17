extends Node

func _ready():
	# Initialize global game settings
	# Explicitly set fullscreen mode at startup
	OS.window_fullscreen = true
	# Small delay to ensure it takes effect
	yield(get_tree().create_timer(0.1), "timeout")
	# Force fullscreen again after delay
	OS.window_fullscreen = true

func _input(event):
	# Handle fullscreen toggle (F11 or Alt+Enter)
	if Input.is_action_just_pressed("toggle_fullscreen"):
		OS.window_fullscreen = !OS.window_fullscreen
		# If coming out of fullscreen, ensure window is positioned at top-left
		if not OS.window_fullscreen:
			OS.window_position = Vector2(0, 0)
		
	# Escape key exits fullscreen mode but doesn't quit the game
	if Input.is_action_just_pressed("ui_cancel") and OS.window_fullscreen:
		OS.window_fullscreen = false
		# When exiting fullscreen with ESC, set window position to top-left
		OS.window_position = Vector2(0, 0)
