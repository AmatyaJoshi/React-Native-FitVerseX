import { defineField, defineType } from 'sanity'

export const exercise = defineType({
  type: 'document',
  name: 'exercise',
  title: 'Exercise',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'The name of the exercise (e.g., Push-ups, Squats, Plank)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'A detailed explanation of how to perform the exercise correctly and safely',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      description: 'Select the difficulty level of this exercise',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'A visual reference image showing the exercise',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility and SEO purposes',
        }),
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'Link to a video demonstration of the exercise',
      type: 'string',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          try {
            new URL(value)
            return true
          } catch {
            return 'Please enter a valid URL (e.g., https://www.youtube.com/watch?v=...)'
          }
        }),
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      description: 'Toggle to show or hide this exercise from the app',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      difficulty: 'difficulty',
      media: 'image',
    },
    prepare(selection) {
      const { title, difficulty, media } = selection
      return {
        title,
        subtitle: difficulty ? `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` : 'No difficulty set',
        media,
      }
    },
  },
})
