import pptxgen from 'pptxgenjs';
import { Editor } from '@tiptap/react';
import { slideThemes } from '@/components/editor/presentation/presentation-themes';

interface ExportOptions {
  title?: string;
  theme?: keyof typeof slideThemes;
  includeNotes?: boolean;
}

export async function exportToPowerPoint(editor: Editor, options: ExportOptions = {}) {
  const pptx = new pptxgen();
  const theme = slideThemes[options.theme || 'default'];

  // Set presentation properties
  pptx.author = 'Loomity';
  pptx.company = 'Loomity';
  pptx.revision = '1';
  pptx.subject = options.title || 'Presentation';
  pptx.title = options.title || 'Presentation';

  // Define master slide
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: theme.background.replace('bg-', '') },
    objects: [
      {
        placeholder: {
          options: { name: 'body', type: 'body', x: 0.5, y: 0.5, w: 9, h: 5 },
          text: '',
        },
      },
    ],
  });

  // Get all slides
  const slides = editor.view.dom.querySelectorAll('[data-type="slide"]');

  // Convert each slide
  slides.forEach((slideElement) => {
    const slide = pptx.addSlide();
    const content = slideElement.querySelector('.ProseMirror')?.innerHTML || '';
    const notes = slideElement.getAttribute('data-notes') || '';
    const template = slideElement.getAttribute('data-template') || 'default';

    // Add content based on template
    switch (template) {
      case 'title':
        slide.addText(content, {
          x: '10%',
          y: '40%',
          w: '80%',
          h: '20%',
          fontSize: 44,
          color: theme.text.replace('text-', ''),
          align: 'center',
        });
        break;
      
      case 'two-column':
        const columns = content.split('<div class="column">');
        if (columns.length > 1) {
          slide.addText(columns[0], { x: '5%', y: '10%', w: '45%', h: '80%' });
          slide.addText(columns[1], { x: '50%', y: '10%', w: '45%', h: '80%' });
        }
        break;
      
      default:
        slide.addText(content, {
          x: '10%',
          y: '10%',
          w: '80%',
          h: '80%',
          fontSize: 18,
          color: theme.text.replace('text-', ''),
        });
    }

    // Add notes if enabled
    if (options.includeNotes && notes) {
      slide.addNotes(notes);
    }
  });

  // Save the presentation
  const fileName = `${options.title || 'presentation'}_${new Date().toISOString().split('T')[0]}.pptx`;
  await pptx.writeFile({ fileName });
}
