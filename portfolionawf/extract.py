import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

# CRTShader
start = text.find("export const CRTShader = {")
end = text.find("class TextBuffer {")

shader_text = text[start:end].strip()

with open('app/coding/CRTShader.ts', 'w') as f:
    f.write(shader_text)

