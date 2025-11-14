import google.generativeai as genai
import os

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def get_initial_verdict(side_a_docs, side_b_docs, case_details):
    prompt = f"""You are an AI Judge trained on legal judgements. Analyze this case and provide a CONCISE verdict (maximum 300 words).

Side A Evidence: {side_a_docs}
Side B Evidence: {side_b_docs}
Case Details: {case_details}

Provide a structured verdict with: 1) Summary (2 sentences), 2) Analysis (3-4 sentences), 3) Final Decision (favor Side A or Side B), 4) Reasoning (3-4 sentences). Be brief and direct."""
    
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    response = model.generate_content(prompt)
    return response.text

def process_argument(conversation_history, new_argument, side):
    prompt = f"""You are an AI Judge reconsidering a case. Keep response BRIEF (maximum 200 words).

Previous conversation:
{conversation_history}

New argument from {side}: {new_argument}

Provide: 1) Response to argument (2-3 sentences), 2) Updated decision if changed (1 sentence), 3) Brief reasoning (2-3 sentences). Be concise."""
    
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    response = model.generate_content(prompt)
    return response.text