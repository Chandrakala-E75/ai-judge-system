from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from document_parser import extract_text_from_pdf, extract_text_from_docx
from judge import get_initial_verdict, process_argument

load_dotenv()
app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/submit-case', methods=['POST'])
def submit_case():
    data = request.json
    side_a = data.get('sideA', '')
    side_b = data.get('sideB', '')
    case_details = data.get('caseDetails', '')
    
    verdict = get_initial_verdict(side_a, side_b, case_details)
    return jsonify({"verdict": verdict})

@app.route('/submit-argument', methods=['POST'])
def submit_argument():
    data = request.json
    conversation = data.get('conversation', '')
    argument = data.get('argument', '')
    side = data.get('side', '')
    
    response = process_argument(conversation, argument, side)
    return jsonify({"response": response})

@app.route('/upload-file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    filename = file.filename.lower()
    
    try:
        if filename.endswith('.pdf'):
            text = extract_text_from_pdf(file)
        elif filename.endswith('.docx'):
            text = extract_text_from_docx(file)
        elif filename.endswith('.txt'):
            text = file.read().decode('utf-8')
        else:
            return jsonify({"error": "Unsupported file type"}), 400
        
        return jsonify({"text": text, "filename": file.filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)