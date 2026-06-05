import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

# I will find "useFrame((state) => {" and its block
lines = text.split('\n')
for i, line in enumerate(lines):
    if 'useFrame((state) => {' in line:
        start_idx = i
        break

print("Lines around end of useFrame:")
for i in range(start_idx, len(lines)):
    if 'shaderPassRef.current.uniforms.u_grain.value = effects.grain' in lines[i]:
        for j in range(i, min(len(lines), i+10)):
            print(f"{j+1}: {lines[j]}")
        break
