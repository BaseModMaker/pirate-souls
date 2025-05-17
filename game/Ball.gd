extends KinematicBody2D

# Movement variables
export var move_speed = 300.0
export var acceleration = 30.0
export var friction = 10.0

# Current velocity
var velocity = Vector2.ZERO

func _physics_process(delta):
	# Get input direction
	var input_vector = Vector2.ZERO
	
	# Apply movement based on input
	if Input.is_action_pressed("ui_up"):
		input_vector.y -= 1
	if Input.is_action_pressed("ui_down"):
		input_vector.y += 1
	if Input.is_action_pressed("ui_right"):
		input_vector.x += 1
	if Input.is_action_pressed("ui_left"):
		input_vector.x -= 1
	
	# Normalize direction for consistent speed in all directions
	if input_vector.length() > 0:
		input_vector = input_vector.normalized()
		# Apply acceleration
		velocity = velocity.move_toward(input_vector * move_speed, acceleration)
	else:
		# Apply friction when no input is given
		velocity = velocity.move_toward(Vector2.ZERO, friction)
	
	# Using move_and_slide for collision handling
	velocity = move_and_slide(velocity)
