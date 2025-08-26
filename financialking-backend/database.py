import pandas as pd

# This dictionary will act as our in-memory database
# In a real application, this would be a real database like PostgreSQL or MySQL.
# We will use this to store and retrieve mock financial data.
DATABASE = {
    "user123": {
        "bank_account": pd.DataFrame({
            "Date": ["2024-07-01", "2024-07-05", "2024-07-10", "2024-07-15", "2024-07-20"],
            "Description": ["Grocery Shopping", "Salary Deposit", "Electricity Bill", "Online Subscription", "Restaurants"],
            "Category": ["Food", "Income", "Utilities", "Subscription", "Food"],
            "Amount": [-50.00, 2500.00, -80.00, -15.00, -65.00]
        }),
        "credit_card": pd.DataFrame({
            "Date": ["2024-07-02", "2024-07-08", "2024-07-12"],
            "Description": ["Travel", "Shopping", "Gas"],
            "Category": ["Travel", "Shopping", "Transport"],
            "Amount": [-300.00, -120.00, -40.00]
        })
    }
    # Add more dummy users and data here if you want to test with more profiles
}

def get_user_data(user_id):
    """
    Retrieves a user's financial data from the mock database.
    
    Args:
        user_id (str): The ID of the user.
        
    Returns:
        dict: A dictionary containing the user's financial data, or None if the user is not found.
    """
    return DATABASE.get(user_id)

def add_user_data(user_id, account_type, data):
    """
    Adds new financial data for a user.
    
    Args:
        user_id (str): The ID of the user.
        account_type (str): 'bank_account' or 'credit_card'.
        data (pd.DataFrame): The new financial data to add.
    """
    if user_id not in DATABASE:
        DATABASE[user_id] = {}
    
    if account_type in DATABASE[user_id]:
        DATABASE[user_id][account_type] = pd.concat([DATABASE[user_id][account_type], data], ignore_index=True)
    else:
        DATABASE[user_id][account_type] = data