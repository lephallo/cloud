from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2.extras import RealDictCursor
import random
import string
import os
from datetime import datetime
from difflib import SequenceMatcher
from functools import wraps
from decimal import Decimal
import matplotlib.pyplot as plt
import numpy as np

app = Flask(__name__)
app.secret_key = 'super_secret_key_123'

# PostgreSQL connection URL (Neon)
DATABASE_URL = 'postgresql://neondb_owner:npg_xaQpmTG4b7nd@ep-odd-butterfly-a4zffcdm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

# Ensure static/images directory exists
for category in ['RAM', 'Hard Drive', 'Motherboard']:
    if not os.path.exists(f'static/images/{category}'):
        os.makedirs(f'static/images/{category}')

# Login Required Decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'loggedin' not in session:
            flash('Please login to access this page.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Helper Functions
def generate_mfa_code():
    return ''.join(random.choices(string.digits, k=6))

def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()

# Routes

@app.route('/')
def home():
    loggedin = 'loggedin' in session
    role = session.get('role', '')
    return render_template('index.html', loggedin=loggedin, role=role)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        phone = request.form['phone']
        role = request.form['role']

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if username or email exists
        cursor.execute('SELECT * FROM users WHERE username = %s OR email = %s', (username, email))
        account = cursor.fetchone()

        if account:
            flash('Account already exists!', 'error')
            cursor.close()
            conn.close()
            return render_template('register.html')

        # Limit role count
        if role in ['sales', 'finance', 'developer']:
            cursor.execute('SELECT COUNT(*) FROM users WHERE role = %s', (role,))
            count = cursor.fetchone()['count']
            if count >= 3:
                flash(f'Maximum of 3 {role} users allowed.', 'error')
                cursor.close()
                conn.close()
                return render_template('register.html')

        hashed_password = generate_password_hash(password)
        cursor.execute(
            'INSERT INTO users (username, password, email, phone, role) VALUES (%s, %s, %s, %s, %s)',
            (username, hashed_password, email, phone, role)
        )
        conn.commit()
        cursor.close()
        conn.close()
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
        account = cursor.fetchone()

        if account and check_password_hash(account['password'], password):
            session['mfa_user_id'] = account['id']
            session['mfa_role'] = account['role']
            mfa_code = generate_mfa_code()
            cursor.execute('UPDATE users SET mfa_code = %s WHERE id = %s', (mfa_code, account['id']))
            conn.commit()
            cursor.close()
            conn.close()
            session['mfa_code'] = mfa_code
            return redirect(url_for('mfa'))
        cursor.close()
        conn.close()
        flash('Invalid credentials.', 'error')
        return render_template('login.html')
    return render_template('login.html')


@app.route('/mfa', methods=['GET', 'POST'])
def mfa():
    if 'mfa_user_id' not in session:
        flash('Please login first.', 'error')
        return redirect(url_for('login'))
    mfa_code = session.get('mfa_code', '')
    if request.method == 'POST':
        code = request.form['mfa_code']
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = %s AND mfa_code = %s', (session['mfa_user_id'], code))
        account = cursor.fetchone()
        if account:
            session['loggedin'] = True
            session['id'] = account['id']
            session['username'] = account['username']
            session['role'] = account['role']
            cursor.execute('UPDATE users SET mfa_code = NULL WHERE id = %s', (account['id'],))
            conn.commit()
            cursor.close()
            conn.close()
            session.pop('mfa_code', None)
            if account['role'] == 'sales':
                return redirect(url_for('sales'))
            elif account['role'] == 'finance':
                return redirect(url_for('income'))
            elif account['role'] == 'developer':
                return redirect(url_for('developer'))
            elif account['role'] == 'investor':
                return redirect(url_for('income'))
            elif account['role'] == 'partner':
                return redirect(url_for('partner'))
            else:
                return redirect(url_for('home'))
        cursor.close()
        conn.close()
        flash('Invalid MFA code.', 'error')
        return render_template('mfa.html', mfa_code=mfa_code)
    return render_template('mfa.html', mfa_code=mfa_code)


@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'success')
    return redirect(url_for('home'))


@app.route('/products')
@login_required
def products():
    category = request.args.get('category', 'all')
    conn = get_db_connection()
    cursor = conn.cursor()
    if category == 'all':
        cursor.execute('SELECT * FROM products')
    else:
        cursor.execute('SELECT * FROM products WHERE category = %s', (category,))
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    # Convert Decimal to float for JSON serialization
    products = [
        {key: float(value) if isinstance(value, Decimal) else value for key, value in product.items()}
        for product in products
    ]
    return jsonify(products)


@app.route('/buy', methods=['POST'])
@login_required
def buy():
    data = request.get_json()
    product_id = data['product_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM products WHERE id = %s', (product_id,))
    product = cursor.fetchone()
    if product:
        cursor.execute(
            'INSERT INTO sales (product_id, user_id, amount, sale_date) VALUES (%s, %s, %s, %s)',
            (product_id, session['id'], product['price'], datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Purchase successful'})
    cursor.close()
    conn.close()
    return jsonify({'message': 'Product not found'}), 404


@app.route('/query', methods=['GET', 'POST'])
@login_required
def query():
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']
        cursor.execute(
            'INSERT INTO queries (name, email, message, status, date_submitted) VALUES (%s, %s, %s, %s, %s)',
            (name, email, message, 'pending', datetime.now())
        )
        conn.commit()

        # Check for similar past queries
        cursor.execute('SELECT * FROM queries WHERE status = %s', ('complete',))
        past_queries = cursor.fetchall()
        for past_query in past_queries:
            if similarity(message.lower(), past_query['message'].lower()) > 0.8:
                cursor.execute(
                    'UPDATE queries SET status = %s, response = %s WHERE id = %s',
                    ('complete', past_query['response'], past_query['id'])
                )
                conn.commit()
                break
        flash('Query submitted successfully.', 'success')

    # Fetch pending queries
    cursor.execute('SELECT * FROM queries WHERE status = %s', ('pending',))
    pending_queries = cursor.fetchall()

    # Query Status Pie Chart
    try:
        cursor.execute('SELECT status, COUNT(*) as count FROM queries GROUP BY status')
        query_data = cursor.fetchall()
        statuses = [d['status'] for d in query_data]
        counts = [d['count'] for d in query_data]
        plt.figure(figsize=(6, 6))
        plt.pie(counts, labels=statuses, autopct='%1.1f%%', colors=['#ff9999', '#66b3ff'])
        plt.title('Query Status Distribution')
        plt.savefig('static/query_status.png')
        plt.close()
        query_status_img = '/static/query_status.png'
    except ImportError:
        query_status_img = None

    cursor.close()
    conn.close()
    return render_template('query.html', pending_queries=pending_queries, query_status_img=query_status_img)


@app.route('/respond_query', methods=['POST'])
@login_required
def respond_query():
    query_id = request.form['query_id']
    response = request.form['response']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE queries SET status = %s, response = %s WHERE id = %s',
                   ('complete', response, query_id))
    conn.commit()
    cursor.close()
    conn.close()
    flash('Response submitted successfully.', 'success')
    return redirect(url_for('query'))


@app.route('/sales')
@login_required
def sales():
    if session['role'] != 'sales':
        flash('Unauthorized access.', 'error')
        return redirect(url_for('home'))
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT s.*, p.name, p.category FROM sales s JOIN products p ON s.product_id = p.id WHERE s.user_id = %s', (session['id'],))
    sales = cursor.fetchall()

    # Query Status Pie Chart
    try:
        cursor.execute('SELECT status, COUNT(*) as count FROM queries GROUP BY status')
        query_data = cursor.fetchall()
        statuses = [d['status'] for d in query_data]
        counts = [d['count'] for d in query_data]
        plt.figure(figsize=(6, 6))
        plt.pie(counts, labels=statuses, autopct='%1.1f%%', colors=['#ff9999', '#66b3ff'])
        plt.title('Query Status Distribution')
        plt.savefig('static/query_status_sales.png')
        plt.close()
        query_status_img = '/static/query_status_sales.png'
    except ImportError:
        query_status_img = None

    # Sales by Category Bar Chart
    try:
        cursor.execute('SELECT p.category, SUM(s.amount) as total FROM sales s JOIN products p ON s.product_id = p.id GROUP BY p.category')
        category_data = cursor.fetchall()
        categories = [d['category'] for d in category_data]
        totals = [float(d['total']) for d in category_data]
        plt.figure(figsize=(8, 6))
        plt.bar(categories, totals, color='green')
        plt.title('Sales by Category')
        plt.xlabel('Category')
        plt.ylabel('Total Sales (M)')
        plt.grid(True)
        plt.savefig('static/sales_category.png')
        plt.close()
        sales_category_img = '/static/sales_category.png'
    except ImportError:
        sales_category_img = None

    cursor.close()
    conn.close()
    return render_template('sales.html', sales=sales, queries=queries, query_status_img=query_status_img, sales_category_img=sales_category_img)


@app.route('/income')
@login_required
def income():
    if session['role'] not in ['finance', 'investor']:
        flash('Unauthorized access.', 'error')
        return redirect(url_for('home'))
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT EXTRACT(MONTH FROM sale_date) AS month, SUM(amount) AS total FROM sales GROUP BY month')
    sales_data = cursor.fetchall()

    # Income Statement Bar Chart
    try:
        months = [int(d['month']) for d in sales_data]
        totals = [float(d['total']) for d in sales_data]
        plt.figure(figsize=(8, 6))
        plt.bar(months, totals, color='blue')
        plt.title('Monthly Income Statement')
        plt.xlabel('Month')
        plt.ylabel('Income (M)')
        plt.grid(True)
        plt.savefig('static/income_statement.png')
        plt.close()
        income_statement_img = '/static/income_statement.png'
    except ImportError:
        income_statement_img = None

    cursor.close()
    conn.close()
    return render_template('income.html', sales_data=sales_data, income_statement_img=income_statement_img)


@app.route('/developer')
@login_required
def developer():
    if session['role'] != 'developer':
        flash('Unauthorized access.', 'error')
        return redirect(url_for('home'))
    return render_template('developer.html')


@app.route('/partner')
@login_required
def partner():
    if session['role'] != 'partner':
        flash('Unauthorized access.', 'error')
        return redirect(url_for('home'))
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM products')
    products = cursor.fetchall()
    cursor.execute('SELECT * FROM sales')
    sales = cursor.fetchall()

    # Product Popularity Bar Chart
    try:
        cursor.execute('SELECT p.name, COUNT(s.id) as count FROM sales s JOIN products p ON s.product_id = p.id GROUP BY p.id ORDER BY count DESC LIMIT 5')
        product_data = cursor.fetchall()
        names = [d['name'][:20] for d in product_data]
        counts = [d['count'] for d in product_data]
        plt.figure(figsize=(8, 6))
        plt.bar(names, counts, color='purple')
        plt.title('Top 5 Products by Sales')
        plt.xlabel('Product')
        plt.ylabel('Number of Sales')
        plt.xticks(rotation=45)
        plt.grid(True)
        plt.savefig('static/product_popularity.png')
        plt.close()
        product_popularity_img = '/static/product_popularity.png'
    except ImportError:
        product_popularity_img = None

    cursor.close()
    conn.close()
    return render_template('partner.html', products=products, sales=sales, sales_data=None, product_popularity_img=product_popularity_img)

if __name__ == '__main__':
    app.run(debug=True)