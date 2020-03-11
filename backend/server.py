import os
import uuid
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def store_print():
    fname = uuid.uuid4()
    with open(f"to_print/{fname.hex}", 'w') as of:
        of.write(json.dumps(request.json))
    return "we'll get right on that"

@app.before_first_request
def create_dirs():
    for path in ['to_print', 'printed']:
        if not os.path.exists(path):
            os.mkdir(path)

