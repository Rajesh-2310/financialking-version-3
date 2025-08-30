from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import yfinance as yf
from database import get_user_data, add_user_data, DATABASE
import re
import os

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

app = Flask(__name__)
CORS(app)

# ---------------- GPU + Model Setup ---------------- #
# NOTE: Uses your Hugging Face token. Consider moving this to an env var in production.
# Updated to use the recommended IBM Granite model
model_id = "ibm-granite/granite-3.3-2b-instruct"
hf_token = "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"

# Device info
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[Init] Torch CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    try:
        print(f"[Init] CUDA device: {torch.cuda.get_device_name(0)}")
    except Exception:
        pass
print(f"[Init] Using device: {device}")

# Tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_id, token=hf_token)

# Quantization config (matches your original approach)
bnb_config = BitsAndBytesConfig(
    load_in_8bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

# Model (Accelerate will place it on GPU if available via device_map="auto")
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    quantization_config=bnb_config,
    token=hf_token
)

# ---------------- Rule-Based + Helpers ---------------- #
def get_user_financial_summary(user_id, profile_data, chat_history):
    """
    Retrieves and summarizes the user's financial data, profile, and chat history.
    """
    user_data = get_user_data(user_id)
    summary = ""

    # Profile
    if profile_data:
        summary += "User Profile:\n"
        for key, value in profile_data.items():
            summary += f"- {key}: {value}\n"

    # Uploads
    if user_data:
        bank_data = user_data.get('bank_account', {}).get('transactions', pd.DataFrame())
        credit_data = user_data.get('credit_card', {}).get('transactions', pd.DataFrame())

        if not bank_data.empty:
            total_expenses = bank_data[bank_data['Transaction_Type'] == 'DEBIT']['Amount'].sum()
            total_income   = bank_data[bank_data['Transaction_Type'] == 'CREDIT']['Amount'].sum()
            summary += (
                "Bank Account Summary:\n"
                f"- Total Expenses: ₹{-float(total_expenses):.2f}\n"
                f"- Total Income: ₹{float(total_income):.2f}\n"
            )

        if not credit_data.empty:
            total_credit_spending = credit_data['Debit (₹)'].sum() if 'Debit (₹)' in credit_data.columns else 0
            summary += f"Credit Card Summary:\n- Total Spending: ₹{float(total_credit_spending):.2f}\n"

    # Chat history
    if chat_history:
        summary += "Chat History:\n"
        for msg in chat_history:
            summary += f"- {msg['sender']}: {msg['text']}\n"

    return summary.strip()


def analyze_budget(user_id):
    """
    Budget summary from both bank + credit card data (income, expenses, savings, breakdown).
    Always returns a dict with 'summary' and 'data'.
    """
    user_data = get_user_data(user_id)
    if not user_data:
        return {"summary": "No financial data has been uploaded.", "data": []}

    bank_data   = user_data.get('bank_account', {}).get('transactions', pd.DataFrame())
    credit_data = user_data.get('credit_card', {}).get('transactions', pd.DataFrame())

    # Combine transactions from both sources
    frames = []
    if not bank_data.empty:
        bank_data_clean = bank_data.copy()
        bank_data_clean['Category'] = bank_data_clean['Description'].apply(lambda x: x.split(' - ')[0] if ' - ' in x else x)
        bank_data_clean['Amount'] = bank_data_clean.apply(lambda row: row['Amount'] if row['Transaction_Type'] == 'CREDIT' else -row['Amount'], axis=1)
        frames.append(bank_data_clean)
        
    if not credit_data.empty:
        credit_data_clean = credit_data.copy()
        credit_data_clean['Category'] = credit_data_clean['Description'].apply(lambda x: x.split(' - ')[0] if ' - ' in x else x)
        credit_data_clean['Amount'] = credit_data_clean.apply(lambda row: -row['Debit (₹)'] if pd.notna(row['Debit (₹)']) else row['Credit (₹)'], axis=1)
        frames.append(credit_data_clean)

    all_data = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()

    if all_data.empty:
        return {"summary": "No financial data available for budget analysis.", "data": []}

    # Spending by category (negative = spend)
    spending_only = all_data[all_data['Amount'] < 0].copy()
    if spending_only.empty:
        total_income = all_data[all_data['Amount'] > 0]['Amount'].sum()
        return {"summary": f"No expenses found. Total Income: ₹{float(total_income):.2f}", "data": []}

    # Group by category
    spending_by_category = spending_only.groupby('Category', dropna=False)['Amount'].sum().reset_index()
    spending_by_category['Amount'] = spending_by_category['Amount'].abs()

    total_expenses = float(spending_by_category['Amount'].sum())
    total_income   = float(all_data[all_data['Amount'] > 0]['Amount'].sum())
    net_savings    = total_income - total_expenses

    if total_expenses > 0:
        spending_by_category['Percentage'] = (spending_by_category['Amount'] / total_expenses) * 100.0
    else:
        spending_by_category['Percentage'] = 0.0

    summary = (
        "Your budget summary:\n"
        f"- Total Income: ₹{total_income:.2f}\n"
        f"- Total Expenses: ₹{total_expenses:.2f}\n"
        f"- Net Savings: ₹{net_savings:.2f}\n"
    )

    return {"summary": summary, "data": spending_by_category.to_dict('records')}


def analyze_insights(user_id):
    """
    Insights & suggestions from combined transactions.
    """
    user_data = get_user_data(user_id)
    if not user_data:
        return "No financial data uploaded yet."

    bank_data   = user_data.get('bank_account', {}).get('transactions', pd.DataFrame())
    credit_data = user_data.get('credit_card', {}).get('transactions', pd.DataFrame())

    frames = []
    if not bank_data.empty:
        bank_data_clean = bank_data.copy()
        bank_data_clean['Category'] = bank_data_clean['Description'].apply(lambda x: x.split(' - ')[0] if ' - ' in x else x)
        bank_data_clean['Amount'] = bank_data_clean.apply(lambda row: row['Amount'] if row['Transaction_Type'] == 'CREDIT' else -row['Amount'], axis=1)
        frames.append(bank_data_clean)
        
    if not credit_data.empty:
        credit_data_clean = credit_data.copy()
        credit_data_clean['Category'] = credit_data_clean['Description'].apply(lambda x: x.split(' - ')[0] if ' - ' in x else x)
        credit_data_clean['Amount'] = credit_data_clean.apply(lambda row: -row['Debit (₹)'] if pd.notna(row['Debit (₹)']) else row['Credit (₹)'], axis=1)
        frames.append(credit_data_clean)
    
    all_data = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()

    if all_data.empty:
        return "No transactions available for insights."

    spending_only = all_data[all_data['Amount'] < 0]
    if spending_only.empty:
        return "No expenses found for insights."

    group = spending_only.groupby('Category')['Amount'].sum()
    top_category = group.idxmin()
    top_amount   = -float(group.min())

    return (
        f"Your highest spending category is **{top_category}** with total spending of ₹{top_amount:.2f}. "
        "Consider reducing discretionary expenses in this category."
    )


# ---- Stocks: Indian tickers under a given price (₹). Real prices via yfinance. ---- #
CANDIDATE_TICKERS = [
    "YESBANK.NS", "SUZLON.NS", "IDEA.NS", "NHPC.NS", "IOC.NS",
    "PNB.NS", "SOUTHBANK.NS", "UCOBANK.NS", "SAIL.NS", "GAIL.NS",
    "ONGC.NS", "COALINDIA.NS", "BHEL.NS", "BANKBARODA.NS", "ZEEL.NS",
    "CANBK.NS", "UNIONBANK.NS", "IDFCFIRSTB.NS", "NLCINDIA.NS", "NBCC.NS"
]

def get_top_stocks_under(price_limit=500, count=10):
    """
    Returns up to `count` Indian tickers with current price <= price_limit.
    """
    results = []
    for t in CANDIDATE_TICKERS:
        try:
            price = yf.Ticker(t).history(period="1d")['Close'].iloc[-1]
            if price <= price_limit:
                results.append({"ticker": t, "price": round(price, 2)})
        except Exception:
            continue

    results.sort(key=lambda x: x["price"])
    return results[:count]


def parse_stock_request(message: str):
    """
    Extract desired count and price limit from message.
    Defaults: count=10, price_limit=500 (₹).
    """
    msg = message.lower()
    # count: e.g., "give 5 stocks", "top 7 stocks", "suggest 3 ..."
    m_count = re.search(r'\b(?:top|give|suggest|list)\s+(\d+)\b', msg)
    count = int(m_count.group(1)) if m_count else 10

    # price: e.g., "under 100", "below 250"
    m_price = re.search(r'\b(?:under|below|<=?)\s*(\d+)', msg)
    price_limit = int(m_price.group(1)) if m_price else 500

    return count, price_limit


def looks_like_stock_query(message: str) -> bool:
    msg = message.lower()
    return ("stock" in msg or "stocks" in msg) and ("under" in msg or "below" in msg or re.search(r'\b\d+\b', msg))


# ---- Model response (Student/Professional) with structured output ---- #
def generate_ai_response(user_message, context_data, user_mode):
    # This function is now used as a post-processor to clean up LLM output
    if user_mode == 'professional':
        tone_prompt = "You are a professional financial advisor. Provide detailed, well-structured guidance using appropriate financial terminology."
    else:
        tone_prompt = "You are a friendly and encouraging financial tutor. Keep explanations simple, actionable, and easy to understand."

    # Intercept stock queries → answer from data, not the LLM
    if looks_like_stock_query(user_message):
        count, price_limit = parse_stock_request(user_message)
        stock_list_data = get_top_stocks_under(price_limit=price_limit, count=count)
        if not stock_list_data:
            return f"I'm sorry, I could not find any Indian stocks under ₹{price_limit} right now."

        # Format the response into a clean list
        lines = [f"{i+1}. {s['ticker']} — Current Price: ₹{s['price']}" for i, s in enumerate(stock_list_data)]
        return "\n".join(lines)

    # For all other requests, use the LLM with a strict prompt
    # Adjusted prompt for the IBM Granite model's conversational format
    full_prompt = (
        f"<|start_of_role|>system<|end_of_role|>\n"
        f"You are a helpful AI assistant. {tone_prompt}\n"
        f"Rules:\n"
        f"• ALWAYS answer as a numbered or bulleted list (no long paragraphs).\n"
        f"• Base your advice ONLY on the provided context; do not invent data.\n"
        f"• If giving budget advice, be specific and actionable.\n"
        f"• Keep answers concise and clear.\n"
        f"<|end_of_text|>\n"
        f"<|start_of_role|>user<|end_of_role|>\n"
        f"Context:\n{context_data}\n\n"
        f"Question: {user_message}\n"
        f"<|end_of_text|>\n"
        f"<|start_of_role|>assistant<|end_of_role|>"
    )

    # Ensure tensors go to the same device as the model
    input_ids = tokenizer(full_prompt, return_tensors="pt").to(model.device)

    try:
        outputs = model.generate(
            **input_ids,
            max_new_tokens=250,
            num_return_sequences=1,
            do_sample=False
        )
        decoded_output = tokenizer.decode(outputs[0], skip_special_tokens=True)

        response_start_marker = "<|start_of_role|>assistant<|end_of_role|>"
        bot_response = decoded_output.split(response_start_marker)[-1].strip()
        bot_response = re.sub(r'System: .*', '', bot_response, flags=re.DOTALL).strip()
        
        # Post-processing to ensure bullet points/list format
        if "\n" not in bot_response and not bot_response.startswith(('-', '*')):
             bot_response = "- " + bot_response

        return bot_response
    except Exception as e:
        return f"Sorry, I'm having trouble with my AI service. Error: {e}"


# ---------------- API Endpoints ---------------- #
@app.route('/api/upload_data', methods=['POST'])
def upload_data():
    data = request.json
    user_id      = data.get('user_id')
    bank_data    = data.get('bank_account')
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


@app.route('/api/guidance', methods=['POST'])
def get_guidance():
    data = request.json
    user_id      = data.get('user_id')
    user_message = data.get('message', 'Provide general financial guidance.')
    user_mode    = data.get('user_mode', 'student')
    profile_data = data.get('profile_data', {})
    chat_history = data.get('chat_history', [])

    summary  = get_user_financial_summary(user_id, profile_data, chat_history)
    response = generate_ai_response(user_message, summary, user_mode)
    return jsonify({"response": response})


@app.route('/api/budget', methods=['POST'])
def get_budget():
    data = request.json
    user_id      = data.get('user_id')
    user_mode    = data.get('user_mode', 'student')
    profile_data = data.get('profile_data', {})
    chat_history = data.get('chat_history', [])

    budget_analysis = analyze_budget(user_id)
    context_data    = get_user_financial_summary(user_id, profile_data, chat_history)

    ai_response = generate_ai_response(
        "Summarize my budget and highlight 3 key actions to improve savings.",
        f"{context_data}\n\nSpending by category data:\n{budget_analysis['data']}",
        user_mode
    )

    return jsonify({"response": ai_response, "chart_data": budget_analysis['data'], "summary": budget_analysis['summary']})


@app.route('/api/insights', methods=['POST'])
def get_insights():
    data = request.json
    user_id      = data.get('user_id')
    user_mode    = data.get('user_mode', 'student')
    profile_data = data.get('profile_data', {})
    chat_history = data.get('chat_history', [])

    insights     = analyze_insights(user_id)
    context_data = get_user_financial_summary(user_id, profile_data, chat_history)

    response = generate_ai_response(
        f"Provide spending insights. Here is the main insight: {insights}",
        f"{context_data}\n\n{insights}",
        user_mode
    )

    return jsonify({"response": response})


@app.route('/api/chatbot', methods=['POST'])
def chatbot_response():
    data = request.json
    user_id      = data.get('user_id')
    user_message = data.get('message')
    user_mode    = data.get('user_mode', 'student')
    profile_data = data.get('profile_data', {})
    chat_history = data.get('chat_history', [])

    if not user_id or not user_message:
        return jsonify({"response": "Please provide a user ID and a message."}), 400

    financial_summary = get_user_financial_summary(user_id, profile_data, chat_history)
    context_data = financial_summary if financial_summary else (
        "Chat History:\n" + "\n".join([f"{msg['sender']}: {msg['text']}" for msg in chat_history])
    )

    bot_response = generate_ai_response(user_message, context_data, user_mode)
    return jsonify({"response": bot_response})


@app.route('/api/fetch_transactions', methods=['POST'])
def fetch_transactions():
    data = request.json
    user_id = data.get('user_id')
    account_type = data.get('account_type')
    details = data.get('details')

    if not user_id or not account_type or not details:
        return jsonify({"message": "Invalid request parameters."}), 400

    user_data = get_user_data(user_id)
    if not user_data:
        return jsonify({"message": "User not found."}), 404
        
    if account_type == 'bank_account':
        stored_details = user_data.get('bank_account', {}).get('account_details', {})
        # Note: We must compare keys and values correctly
        if all(item in stored_details.items() for item in details.items()):
            transactions = user_data['bank_account']['transactions']
            return jsonify({"success": True, "transactions": transactions.to_dict('records')})
        else:
            return jsonify({"success": False, "message": "Invalid bank account details."}), 400
            
    elif account_type == 'credit_card':
        stored_details = user_data.get('credit_card', {}).get('card_details', {})
        if all(item in stored_details.items() for item in details.items()):
            transactions = user_data['credit_card']['transactions']
            return jsonify({"success": True, "transactions": transactions.to_dict('records')})
        else:
            return jsonify({"success": False, "message": "Invalid credit card details."}), 400
            
    return jsonify({"success": False, "message": "Invalid account type."}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000)
