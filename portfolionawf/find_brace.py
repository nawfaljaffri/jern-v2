import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

# Let's write a simple TS parser using standard tokenization
import tokenize
from io import BytesIO

stack = []
tokens = []
try:
    # This is a hacky way to use python tokenizer on TS, it handles strings and comments mostly ok
    for tok in tokenize.tokenize(BytesIO(text.encode('utf-8')).readline):
        if tok.type == tokenize.OP:
            if tok.string == '{':
                stack.append(tok.start)
            elif tok.string == '}':
                if stack:
                    stack.pop()
                else:
                    print(f"Extra }} at {tok.start}")
        elif tok.type == tokenize.ERRORTOKEN:
            pass
except Exception as e:
    print("Tokenize error", e)

for s in stack:
    print(f"Unclosed {{ at {s}")
