from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
# Allow all origins in production
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
# In production, store the database in the user's home directory
if os.environ.get('FLASK_ENV') == 'production':
    db_path = os.path.expanduser('~/product_manager.db')
else:
    db_path = os.path.join(basedir, 'products.db')

print(f"Using database at: {db_path}")
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Product Model
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'description': self.description
        }

# Create database tables
with app.app_context():
    db.create_all()

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    
    # Basic validation
    if not data or 'name' not in data or 'price' not in data:
        return jsonify({'error': 'Name and price are required'}), 400
    
    new_product = Product(
        name=data['name'],
        price=float(data['price']),
        description=data.get('description', '')
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify(new_product.to_dict()), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)