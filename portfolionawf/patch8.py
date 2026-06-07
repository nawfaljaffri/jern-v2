import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# Replace the neural net project
old_neural = """      {
        name: 'neural-net-arch',
        type: 'project',
        date: '2024-03-15',
        lang: 'Python / PyTorch',
        status: 'ONLINE',
        desc: 'Neural architecture search experiments. Explores evolutionary algorithms to optimize network topologies for low-power edge devices.',
        links: '[GitHub] [Live Demo]'
      },"""

new_neural = """      {
        name: 'neural-net-arch',
        type: 'project',
        date: '2024-03-15',
        lang: 'Python / PyTorch',
        status: 'ONLINE',
        desc: 'Neural architecture search experiments. Explores evolutionary algorithms to optimize network topologies for low-power edge devices.',
        links: '[GitHub] [Live Demo]',
        asciiArt: [
          "       _.._",
          "     .'    '.",
          "    /        \\\\",
          "   |  o -- o  |",
          "   |  | \\\\/ |  |",
          "    \\\\ o -- o /",
          "     '.    .'",
          "       '--'"
        ]
      },"""
content = content.replace(old_neural, new_neural)

old_noter = """      {
        name: 'noter-app',
        type: 'project',
        date: '2024-01-20',
        lang: 'TypeScript / React',
        status: 'DEPRECATED',
        desc: 'A minimal note-taking PWA. Features offline-first sync using IndexedDB and CRDTs for conflict resolution.',
        links: '[GitHub]'
      },"""

new_noter = """      {
        name: 'noter-app',
        type: 'project',
        date: '2024-01-20',
        lang: 'TypeScript / React',
        status: 'DEPRECATED',
        desc: 'A minimal note-taking PWA. Features offline-first sync using IndexedDB and CRDTs for conflict resolution.',
        links: '[GitHub]',
        asciiArt: [
          "    .------.",
          "   | ====== |",
          "   | ====== |",
          "   | ====== |",
          "   | ====== |",
          "   |        |",
          "   '--------'"
        ]
      },"""
content = content.replace(old_noter, new_noter)

old_port = """      {
        name: 'portfolio-site',
        type: 'project',
        date: '2024-06-01',
        lang: 'Next.js / WebGL',
        status: 'ACTIVE',
        desc: 'This very website. Swiss Punk graphic design meets high-performance React architecture.',
        links: '[GitHub] [Live Demo]'
      },"""
new_port = """      {
        name: 'portfolio-site',
        type: 'project',
        date: '2024-06-01',
        lang: 'Next.js / WebGL',
        status: 'ACTIVE',
        desc: 'This very website. Swiss Punk graphic design meets high-performance React architecture.',
        links: '[GitHub] [Live Demo]',
        asciiArt: [
          "   +--------+",
          "   |  >_    |",
          "   |        |",
          "   |████████|",
          "   +--------+"
        ]
      },"""
content = content.replace(old_port, new_port)

old_game = """      {
        name: 'game-engine',
        type: 'project',
        date: '2024-04-10',
        lang: 'C++ / OpenGL',
        status: 'ARCHIVED',
        desc: 'Custom 2D game engine built from scratch. Implements an Entity Component System (ECS) and custom physics solvers.',
        links: '[GitHub]'
      }"""
new_game = """      {
        name: 'game-engine',
        type: 'project',
        date: '2024-04-10',
        lang: 'C++ / OpenGL',
        status: 'ARCHIVED',
        desc: 'Custom 2D game engine built from scratch. Implements an Entity Component System (ECS) and custom physics solvers.',
        links: '[GitHub]',
        asciiArt: [
          "      +---+",
          "     /   /|",
          "    +---+ |",
          "    |   | +",
          "    +---+/"
        ]
      }"""
content = content.replace(old_game, new_game)

old_poster = """      {
        name: 'poster-series-1',
        type: 'project',
        date: '2024-05-12',
        lang: 'Illustrator / PS',
        status: 'PUBLISHED',
        desc: 'A series of brutalist posters exploring the dichotomy of brutalism and digital noise. Exhibited at Dubai Design Week.',
        links: '[Behance]'
      },"""
new_poster = """      {
        name: 'poster-series-1',
        type: 'project',
        date: '2024-05-12',
        lang: 'Illustrator / PS',
        status: 'PUBLISHED',
        desc: 'A series of brutalist posters exploring the dichotomy of brutalism and digital noise. Exhibited at Dubai Design Week.',
        links: '[Behance]',
        asciiArt: [
          "   .--------.",
          "   |        |",
          "   |  /\\\\   |",
          "   | /  \\\\  |",
          "   |        |",
          "   '--------'"
        ]
      },"""
content = content.replace(old_poster, new_poster)

old_3d = """      {
        name: '3d-renders-v2',
        type: 'project',
        date: '2023-11-05',
        lang: 'Blender / Cycles',
        status: 'ARCHIVED',
        desc: 'Explorations in procedural materials and volumetric lighting using Blender Cycles engine.',
        links: '[Instagram]'
      }"""
new_3d = """      {
        name: '3d-renders-v2',
        type: 'project',
        date: '2023-11-05',
        lang: 'Blender / Cycles',
        status: 'ARCHIVED',
        desc: 'Explorations in procedural materials and volumetric lighting using Blender Cycles engine.',
        links: '[Instagram]',
        asciiArt: [
          "      /\\\\",
          "     /  \\\\",
          "    /____\\\\",
          "   /      \\\\",
          "  /________\\\\"
        ]
      }"""
content = content.replace(old_3d, new_3d)

# Now inject the rendering logic
old_render_proj = """                let offsetP = 3;
                writeUI(pStartX, pStartY + offsetP++, `DATE: ${child.date}`, 3);
                writeUI(pStartX, pStartY + offsetP++, `TECH: ${child.lang}`, 3);
                writeUI(pStartX, pStartY + offsetP++, `STAT: ${child.status}`, 3);
                offsetP++;
                
                const words = child.desc.split(' ');"""

new_render_proj = """                let offsetP = 3;
                
                if (child.asciiArt) {
                    child.asciiArt.forEach((line: string) => {
                        writeUI(pStartX + 4, pStartY + offsetP++, line, 2);
                    });
                    offsetP++;
                }
                
                writeUI(pStartX, pStartY + offsetP++, `DATE: ${child.date}`, 3);
                writeUI(pStartX, pStartY + offsetP++, `TECH: ${child.lang}`, 3);
                writeUI(pStartX, pStartY + offsetP++, `STAT: ${child.status}`, 3);
                offsetP++;
                
                const words = child.desc.split(' ');"""

content = content.replace(old_render_proj, new_render_proj)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 8 applied.")
