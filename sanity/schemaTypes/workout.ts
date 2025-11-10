import { defineField, defineType, defineArrayMember } from 'sanity'

export const workout = defineType({
  type: 'document',
  name: 'workout',
  title: 'Workout',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'The Clerk ID of the user who performed this workout',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Workout Date',
      description: 'The date and time when the workout was performed',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      description: 'The total duration of the workout in seconds',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      description: 'List of exercises performed in this workout with their details',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workoutExercise',
          title: 'Workout Exercise',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              description: 'Reference to the exercise being performed',
              type: 'reference',
              to: [{ type: 'exercise' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description: 'Track reps and weight for each set of this exercise',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'set',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Reps',
                      description: 'Number of repetitions completed in this set',
                      type: 'number',
                      validation: (rule) => rule.required().positive(),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      description: 'The weight used for this set',
                      type: 'number',
                      validation: (rule) => rule.positive(),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      description: 'The unit of measurement for the weight',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Pounds (lbs)', value: 'lbs' },
                          { title: 'Kilograms (kg)', value: 'kg' },
                        ],
                        layout: 'radio',
                      },
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      unit: 'weightUnit',
                    },
                    prepare(selection) {
                      const { reps, weight, unit } = selection
                      return {
                        title: `Set: ${reps} reps`,
                        subtitle: weight ? `${weight} ${unit}` : 'Bodyweight',
                      }
                    },
                  },
                }),
              ],
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              exerciseName: 'exercise.name',
              sets: 'sets',
            },
            prepare(selection) {
              const { exerciseName, sets } = selection
              const setsCount = Array.isArray(sets) ? sets.length : 0
              return {
                title: exerciseName || 'Unnamed Exercise',
                subtitle: `${setsCount} ${setsCount === 1 ? 'set' : 'sets'}`,
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      userId: 'userId',
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
    },
    prepare(selection) {
      const { userId, date, duration, exercises } = selection
      const exerciseCount = Array.isArray(exercises) ? exercises.length : 0
      const formattedDate = date
        ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'No date'
      const durationMinutes = Math.round((duration || 0) / 60)
      return {
        title: `Workout - ${formattedDate}`,
        subtitle: `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'} • ${durationMinutes} min • User: ${userId}`,
      }
    },
  },
})
