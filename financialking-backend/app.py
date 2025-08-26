from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import pandas as pd
from database import get_user_data, add_user_data

app = Flask(__name__)
CORS(app)

# Load a pre-trained generative AI model from Hugging Face
# You can change this to a larger model later if needed (e.g., "microsoft/DialoGPT-medium")
chatbot_model = pipeline("text-generation", model="microsoft/DialoGPT-small")

# --- Helper functions for data analysis ---
def analyze_spending_habits(transactions):
    """Analyzes transaction data to provide insights."""
    if transactions.empty:
        return "No spending data available for analysis."

    # Calculate total expenses and income
    total_expenses = transactions[transactions['Amount'] < 0]['Amount'].sum()
    total_income = transactions[transactions['Amount'] > 0]['Amount'].sum()

    summary = f"Your total expenses this month are ${-total_expenses:.2f} and your total income is ${total_income:.2f}.\n"

    # Find top spending categories
    spending_only = transactions[transactions['Amount'] < 0]
    category_spending = spending_only.groupby('Category')['Amount'].sum().sort_values()
    
    if not category_spending.empty:
        top_category = category_spending.index[0]
        top_amount = -category_spending.iloc[0]
        summary += f"Your top spending category is '{top_category}' with a total of ${top_amount:.2f}.\n"
    
    return summary

# --- API Endpoints ---
@app.route('/api/upload_data', methods=['POST'])
def upload_data():
    """
    Endpoint to receive and process user's financial data.
    """
    data = request.json
    user_id = data.get('user_id')
    bank_data = data.get('bank_account')
    credit_data = data.get('credit_card')

    if not user_id:
        return jsonify({"message": "User ID is required."}), 400

    if bank_data:
        df_bank = pd.DataFrame(bank_data)
        add_user_data(user_id, 'bank_account', df_bank)
        
    if credit_data:
        df_credit = pd.DataFrame(credit_data)
        add_user_data(user_id, 'credit_card', df_credit)
        
    return jsonify({"message": "Financial data uploaded successfully!"})

@app.route('/api/chatbot', methods=['POST'])
def chatbot_response():
    """
    Handles a user's message, analyzes financial data, and provides a personalized response.
    """
    data = request.json
    user_id = data.get('user_id')
    user_message = data.get('message')

    if not user_id or not user_message:
        return jsonify({"response": "Please provide a user ID and a message."}), 400

    # Get the user's financial data from our mock database
    user_data = get_user_data(user_id)
    financial_insights = ""

    if user_data:
        # Generate a financial summary based on the uploaded data
        bank_summary = analyze_spending_habits(user_data.get('bank_account', pd.DataFrame()))
        credit_summary = analyze_spending_habits(user_data.get('credit_card', pd.DataFrame()))
        
        financial_insights = f"Based on your financial data:\n{bank_summary}\n{credit_summary}\n"

    # Now, combine the user's query with the financial insights
    # This acts as the "prompt" for our Hugging Face model
    full_prompt = f"User: {user_message}\nFinancial Data: {financial_insights}\nAI:"

    # Generate a response using the Hugging Face model
    response = chatbot_model(full_prompt, max_length=150, num_return_sequences=1)
    bot_response = response[0]['generated_text'].split("AI:")[1].strip()

    # The model might be a bit too conversational.
    # You may need to fine-tune it or use a more specific model for financial advice.
    return jsonify({"response": bot_response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)