// Comprehensive Exercise Library
export const exerciseLibrary = [
  // CHEST
  { id: 1, name: 'Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'barbell', difficulty: 'intermediate', description: 'Lie on a bench and press a barbell up from chest level.' },
  { id: 2, name: 'Incline Bench Press', category: 'strength', muscleGroups: ['upper chest', 'triceps', 'shoulders'], equipment: 'barbell', difficulty: 'intermediate', description: 'Bench press on an incline to target upper chest.' },
  { id: 3, name: 'Dumbbell Flyes', category: 'strength', muscleGroups: ['chest'], equipment: 'dumbbells', difficulty: 'beginner', description: 'Lie on bench with dumbbells extended, lower arms in arc motion.' },
  { id: 4, name: 'Push-ups', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'bodyweight', difficulty: 'beginner', description: 'Classic bodyweight chest exercise in prone position.' },
  { id: 5, name: 'Cable Chest Fly', category: 'strength', muscleGroups: ['chest'], equipment: 'cable', difficulty: 'beginner', description: 'Standing cable flyes for constant tension on chest.' },

  // BACK
  { id: 6, name: 'Deadlift', category: 'strength', muscleGroups: ['back', 'legs', 'core'], equipment: 'barbell', difficulty: 'advanced', description: 'Lift barbell from ground to standing position with hip hinge.' },
  { id: 7, name: 'Pull-ups', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'bodyweight', difficulty: 'intermediate', description: 'Hang from bar and pull body up until chin over bar.' },
  { id: 8, name: 'Bent Over Row', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'barbell', difficulty: 'intermediate', description: 'Bend at hips and row barbell to lower chest.' },
  { id: 9, name: 'Lat Pulldown', category: 'strength', muscleGroups: ['lats', 'biceps'], equipment: 'cable', difficulty: 'beginner', description: 'Pull cable bar down to upper chest while seated.' },
  { id: 10, name: 'Seated Cable Row', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'cable', difficulty: 'beginner', description: 'Pull cable handle to torso while seated.' },

  // LEGS
  { id: 11, name: 'Squat', category: 'strength', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: 'barbell', difficulty: 'intermediate', description: 'Lower body by bending knees with barbell on shoulders.' },
  { id: 12, name: 'Front Squat', category: 'strength', muscleGroups: ['quads', 'core'], equipment: 'barbell', difficulty: 'advanced', description: 'Squat with barbell held in front on shoulders.' },
  { id: 13, name: 'Leg Press', category: 'strength', muscleGroups: ['quads', 'glutes'], equipment: 'machine', difficulty: 'beginner', description: 'Push weight platform away with feet while seated.' },
  { id: 14, name: 'Romanian Deadlift', category: 'strength', muscleGroups: ['hamstrings', 'glutes', 'back'], equipment: 'barbell', difficulty: 'intermediate', description: 'Hip hinge movement emphasizing hamstrings.' },
  { id: 15, name: 'Leg Curl', category: 'strength', muscleGroups: ['hamstrings'], equipment: 'machine', difficulty: 'beginner', description: 'Curl legs up against resistance while lying prone.' },
  { id: 16, name: 'Leg Extension', category: 'strength', muscleGroups: ['quads'], equipment: 'machine', difficulty: 'beginner', description: 'Extend legs against resistance while seated.' },
  { id: 17, name: 'Lunges', category: 'strength', muscleGroups: ['quads', 'glutes'], equipment: 'dumbbells', difficulty: 'beginner', description: 'Step forward and lower body into lunge position.' },
  { id: 18, name: 'Bulgarian Split Squat', category: 'strength', muscleGroups: ['quads', 'glutes'], equipment: 'dumbbells', difficulty: 'intermediate', description: 'Single leg squat with rear foot elevated.' },

  // SHOULDERS
  { id: 19, name: 'Overhead Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'barbell', difficulty: 'intermediate', description: 'Press barbell overhead from shoulder height.' },
  { id: 20, name: 'Dumbbell Shoulder Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbells', difficulty: 'beginner', description: 'Press dumbbells overhead from shoulder level.' },
  { id: 21, name: 'Lateral Raises', category: 'strength', muscleGroups: ['side delts'], equipment: 'dumbbells', difficulty: 'beginner', description: 'Raise dumbbells to sides to shoulder height.' },
  { id: 22, name: 'Front Raises', category: 'strength', muscleGroups: ['front delts'], equipment: 'dumbbells', difficulty: 'beginner', description: 'Raise dumbbells forward to shoulder height.' },
  { id: 23, name: 'Face Pulls', category: 'strength', muscleGroups: ['rear delts', 'upper back'], equipment: 'cable', difficulty: 'beginner', description: 'Pull cable rope toward face for rear delts.' },

  // ARMS
  { id: 24, name: 'Barbell Curl', category: 'strength', muscleGroups: ['biceps'], equipment: 'barbell', difficulty: 'beginner', description: 'Curl barbell up by flexing biceps.' },
  { id: 25, name: 'Dumbbell Curl', category: 'strength', muscleGroups: ['biceps'], equipment: 'dumbbells', difficulty: 'beginner', description: 'Curl dumbbells alternately or together.' },
  { id: 26, name: 'Hammer Curl', category: 'strength', muscleGroups: ['biceps', 'forearms'], equipment: 'dumbbells', difficulty: 'beginner', description: 'Curl with neutral grip (palms facing).' },
  { id: 27, name: 'Tricep Dips', category: 'strength', muscleGroups: ['triceps'], equipment: 'bodyweight', difficulty: 'intermediate', description: 'Lower body by bending arms on parallel bars.' },
  { id: 28, name: 'Tricep Pushdown', category: 'strength', muscleGroups: ['triceps'], equipment: 'cable', difficulty: 'beginner', description: 'Push cable down by extending triceps.' },
  { id: 29, name: 'Skull Crushers', category: 'strength', muscleGroups: ['triceps'], equipment: 'barbell', difficulty: 'intermediate', description: 'Lower barbell to forehead and extend back up.' },

  // CORE
  { id: 30, name: 'Plank', category: 'strength', muscleGroups: ['core'], equipment: 'bodyweight', difficulty: 'beginner', description: 'Hold push-up position on forearms.' },
  { id: 31, name: 'Sit-ups', category: 'strength', muscleGroups: ['abs'], equipment: 'bodyweight', difficulty: 'beginner', description: 'Lie on back and lift torso to knees.' },
  { id: 32, name: 'Russian Twists', category: 'strength', muscleGroups: ['obliques', 'abs'], equipment: 'bodyweight', difficulty: 'beginner', description: 'Rotate torso side to side while seated.' },
  { id: 33, name: 'Hanging Leg Raises', category: 'strength', muscleGroups: ['abs'], equipment: 'bodyweight', difficulty: 'advanced', description: 'Hang from bar and raise legs to 90 degrees.' },
  { id: 34, name: 'Cable Crunches', category: 'strength', muscleGroups: ['abs'], equipment: 'cable', difficulty: 'beginner', description: 'Kneel and crunch with cable resistance.' },

  // CARDIO
  { id: 35, name: 'Running', category: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'none', difficulty: 'beginner', description: 'Outdoor or treadmill running for cardio.' },
  { id: 36, name: 'Cycling', category: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'bike', difficulty: 'beginner', description: 'Stationary or road cycling.' },
  { id: 37, name: 'Rowing', category: 'cardio', muscleGroups: ['back', 'legs', 'cardio'], equipment: 'rowing machine', difficulty: 'intermediate', description: 'Full body cardio on rowing machine.' },
  { id: 38, name: 'Jump Rope', category: 'cardio', muscleGroups: ['calves', 'cardio'], equipment: 'jump rope', difficulty: 'beginner', description: 'Continuous jumping with rope.' },
  { id: 39, name: 'Burpees', category: 'cardio', muscleGroups: ['full body', 'cardio'], equipment: 'bodyweight', difficulty: 'intermediate', description: 'Squat, push-up, jump sequence.' },
  { id: 40, name: 'Mountain Climbers', category: 'cardio', muscleGroups: ['core', 'cardio'], equipment: 'bodyweight', difficulty: 'beginner', description: 'Plank position with alternating knee drives.' },

  // OLYMPIC/POWER
  { id: 41, name: 'Clean and Jerk', category: 'strength', muscleGroups: ['full body'], equipment: 'barbell', difficulty: 'advanced', description: 'Olympic lift: clean to shoulders, jerk overhead.' },
  { id: 42, name: 'Snatch', category: 'strength', muscleGroups: ['full body'], equipment: 'barbell', difficulty: 'advanced', description: 'Pull barbell from floor to overhead in one motion.' },
  { id: 43, name: 'Power Clean', category: 'strength', muscleGroups: ['back', 'legs', 'shoulders'], equipment: 'barbell', difficulty: 'advanced', description: 'Explosive pull of barbell to shoulder height.' },
  { id: 44, name: 'Box Jumps', category: 'strength', muscleGroups: ['legs', 'power'], equipment: 'box', difficulty: 'intermediate', description: 'Jump explosively onto elevated platform.' },
  { id: 45, name: 'Kettlebell Swings', category: 'strength', muscleGroups: ['glutes', 'hamstrings', 'core'], equipment: 'kettlebell', difficulty: 'intermediate', description: 'Swing kettlebell from hips to shoulder height.' },
];

export const exerciseCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
];

export const equipmentTypes = [
  { value: 'all', label: 'All Equipment' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'cable', label: 'Cable' },
  { value: 'machine', label: 'Machine' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'none', label: 'No Equipment' },
];

export const difficultyLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];
