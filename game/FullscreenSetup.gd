extends Node

# This script forces fullscreen mode at game startup

func _ready():
	# Wait for one frame to ensure scene is fully loaded
	yield(get_tree(), "idle_frame")
	
	# First ensure window position is at top-left corner (0,0)
	OS.window_position = Vector2(0, 0)
	
	print("Setting window position to top-left and enabling fullscreen mode...")
	
	# First method - using project settings value
	OS.window_fullscreen = true
	
	# For some systems that may need a specific call
	if not OS.window_fullscreen:
		print("First method failed, trying alternative method...")
		OS.set_window_fullscreen(true)
	
	# Let's print debug info for troubleshooting
	print("Window fullscreen status: " + str(OS.window_fullscreen))
	
	# Let's try one more time after a short delay
	yield(get_tree().create_timer(0.5), "timeout")
	OS.window_fullscreen = true
	print("Final fullscreen status: " + str(OS.window_fullscreen))
	
	# If it's still not fullscreen, at least ensure it's in top-left corner
	if not OS.window_fullscreen:
		OS.window_maximized = false  # Don't maximize
		OS.window_position = Vector2(0, 0)  # Position at top-left
		print("Fullscreen not available, positioning window at top-left corner.")
