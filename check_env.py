
import os
import json

keys = {k: len(v) for k, v in os.environ.items() if "KEY" in k or "AI" in k}
print(json.dumps(keys, indent=2))
