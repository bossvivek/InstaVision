# This is the main Python file for your web application.
# @Author: Vivek Reddy Bhimavarapu 
# It uses Flask (a web framework) to create a simple website for comparing links in two HTML files.
# It also uses BeautifulSoup to extract links from HTML, and CORS to allow requests from other origins (like your frontend).

from flask import Flask, request, jsonify, render_template  # Import Flask and related modules
from flask_cors import CORS  # Import CORS to allow cross-origin requests
from bs4 import BeautifulSoup  # Import BeautifulSoup for parsing HTML

# Create a Flask web app instance
app = Flask(__name__)
# Enable CORS for this app (lets your frontend JavaScript talk to this backend)
CORS(app)

# This function takes HTML content as input and extracts all the links (<a> tags)
def extract_links_from_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')  # Parse the HTML
    links = set()  # Use a set to avoid duplicate links

    # Loop through all <a> tags that have an href attribute
    for tag in soup.find_all('a', href=True):
        href = tag['href'].strip()  # Get the link URL
        text = tag.get_text(strip=True) or href  # Get the link text, or use the URL if no text
        if href:
            # Format the link as an HTML <a> tag with target="_blank" (opens in new tab)
            formatted_link = f'<a href="{href}" target="_blank">{text}</a>'
            links.add(formatted_link)  # Add to the set

    return links  # Return the set of formatted links

# Route for the home page (shows the upload form)
@app.route('/')
def index():
    return render_template('index.html') # Render the HTML template

# Route for the how to use page (shows the page with instructions)
@app.route('/how_to_use') 
def how_to_use():
    return render_template('how_to_use.html')  # Render the "How to Use" page

# Route for comparing two uploaded files
@app.route('/compare', methods=['POST'])
def compare_files():
    try:
        # Check if both files are present in the request
        if 'fileA' not in request.files or 'fileB' not in request.files:
            return jsonify({'error': 'Both files must be uploaded.'}), 400
        file_a = request.files['fileA']
        file_b = request.files['fileB']

        # Check if files are not empty
        if file_a.filename == '' or file_b.filename == '':
            return jsonify({'error': 'One or both files are empty.'}), 400

        # Optional: Check if files are HTML by extension (basic check)
        if not (file_a.filename.lower().endswith('.html') and file_b.filename.lower().endswith('.html')):
            return jsonify({'error': 'Please upload HTML files only.'}), 400

        # Try reading and decoding the files
        try:
            html_a = file_a.read().decode('utf-8')
            html_b = file_b.read().decode('utf-8')
        except UnicodeDecodeError:
            return jsonify({'error': 'File encoding error. Please upload UTF-8 encoded HTML files.'}), 400

        # Extract links from both files
        links_a = extract_links_from_html(html_a)
        links_b = extract_links_from_html(html_b)

        # Find common links (in both files), unique to A, and unique to B
        common = sorted(links_a & links_b)
        unique_to_a = sorted(links_a - links_b)
        unique_to_b = sorted(links_b - links_a)

        # Return the results as JSON (so JavaScript can use them)
        return jsonify({
            'common': common,
            'unique_to_a': unique_to_a,
            'unique_to_b': unique_to_b
        })
    except Exception as e:
        # Catch-all for unexpected errors
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

# This runs the app if you start this file directly (not needed if you use a WSGI server)
if __name__ == '__main__':
    app.run(debug=True)  # Start the Flask app in debug mode (shows errors in browser)
