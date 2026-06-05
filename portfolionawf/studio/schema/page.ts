import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'object',
          name: 'mediaDistortion',
          title: 'Media Distortion (WebGL)',
          fields: [
            { name: 'image', type: 'image', title: 'Image' },
            { name: 'effect', type: 'string', title: 'Effect Type', options: { list: ['halftone', 'rgb-split', 'glitch'] } }
          ]
        },
        {
          type: 'object',
          name: 'canvasEmbed',
          title: 'Canvas Embed',
          fields: [
            { name: 'type', type: 'string', title: 'Canvas Type', options: { list: ['ascii-particles', 'math-distortion'] } }
          ]
        }
      ],
    }),
  ],
})
