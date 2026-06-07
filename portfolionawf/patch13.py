import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# Fix the broken ctx.restore() block left by fuzzy matching
broken_block = """    buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);

        ctx.restore();
    }

    textureRef.current.needsUpdate = true"""

fixed_block = """    buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);

    textureRef.current.needsUpdate = true"""

content = content.replace(broken_block, fixed_block)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 13 applied.")
