extends Control

func _ready():
	# Set window to top-left corner first (will matter when not in fullscreen)
	OS.window_position = Vector2(0, 0)
	
	# Force fullscreen immediately
	OS.window_fullscreen = true
	
	# Display brief loading message
	print("Booting game in fullscreen mode...")
	
	# Wait a moment to ensure fullscreen takes effect
	yield(get_tree().create_timer(0.5), "timeout")
	
	# Force it again just to be sure
	OS.window_fullscreen = true
	
	# Then transition to the main scene
	get_tree().change_scene("res://World.tscn")
