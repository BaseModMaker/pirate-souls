extends Node2D

func _ready():
	# Set window position to top-left first
	OS.window_position = Vector2(0, 0)
	
	# Force fullscreen at scene startup
	OS.window_fullscreen = true
	
	# Wait two frames and try again if needed
	yield(get_tree(), "idle_frame")
	yield(get_tree(), "idle_frame")
	
	if not OS.window_fullscreen:
		print("World scene attempting to enforce fullscreen...")
		# Try alternative method
		OS.set_window_fullscreen(true)
		
		# If still not fullscreen, ensure window position is top-left
		if not OS.window_fullscreen:
			OS.window_position = Vector2(0, 0)
		
	# Add fullscreen toggle on keypress in this scene too
	set_process_input(true)
	
func _input(event):
	# Add F key as an additional emergency fullscreen toggle
	if event is InputEventKey and event.pressed and event.scancode == KEY_F:
		OS.window_fullscreen = true
		print("Emergency fullscreen mode triggered")
