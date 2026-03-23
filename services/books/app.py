from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://dituser:ditpass@db:5432/ditlibrary'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    isbn = db.Column(db.String(20), unique=True, nullable=False)
    category = db.Column(db.String(100))
    total_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    published_year = db.Column(db.Integer)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'category': self.category,
            'total_copies': self.total_copies,
            'available_copies': self.available_copies,
            'published_year': self.published_year,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'books-service'})


@app.route('/api/books', methods=['GET'])
def get_books():
    search = request.args.get('search', '')
    query = Book.query
    if search:
        query = query.filter(
            (Book.title.ilike(f'%{search}%')) |
            (Book.author.ilike(f'%{search}%')) |
            (Book.isbn.ilike(f'%{search}%'))
        )
    books = query.all()
    return jsonify([b.to_dict() for b in books])


@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify(book.to_dict())


@app.route('/api/books', methods=['POST'])
def create_book():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('author') or not data.get('isbn'):
        return jsonify({'error': 'title, author, and isbn are required'}), 400

    if Book.query.filter_by(isbn=data['isbn']).first():
        return jsonify({'error': 'ISBN already exists'}), 409

    copies = data.get('total_copies', 1)
    book = Book(
        title=data['title'],
        author=data['author'],
        isbn=data['isbn'],
        category=data.get('category'),
        total_copies=copies,
        available_copies=copies,
        published_year=data.get('published_year'),
        description=data.get('description')
    )
    db.session.add(book)
    db.session.commit()
    return jsonify(book.to_dict()), 201


@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    for field in ['title', 'author', 'isbn', 'category', 'total_copies', 'published_year', 'description']:
        if field in data:
            setattr(book, field, data[field])
    db.session.commit()
    return jsonify(book.to_dict())


@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'})


@app.route('/api/books/<int:book_id>/availability', methods=['PUT'])
def update_availability(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    action = data.get('action')
    if action == 'borrow':
        if book.available_copies <= 0:
            return jsonify({'error': 'No copies available'}), 400
        book.available_copies -= 1
    elif action == 'return':
        if book.available_copies >= book.total_copies:
            return jsonify({'error': 'All copies already returned'}), 400
        book.available_copies += 1
    else:
        return jsonify({'error': 'Invalid action'}), 400
    db.session.commit()
    return jsonify(book.to_dict())


@app.route('/api/books/stats', methods=['GET'])
def get_stats():
    total = Book.query.count()
    available = db.session.query(db.func.sum(Book.available_copies)).scalar() or 0
    borrowed = db.session.query(db.func.sum(Book.total_copies - Book.available_copies)).scalar() or 0
    return jsonify({'total_books': total, 'available_copies': available, 'borrowed_copies': borrowed})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Seed data
        if Book.query.count() == 0:
            seed_books = [
                Book(title="Clean Code", author="Robert C. Martin", isbn="978-0132350884", category="Informatique", total_copies=3, available_copies=3, published_year=2008),
                Book(title="The Pragmatic Programmer", author="Andrew Hunt", isbn="978-0201616224", category="Informatique", total_copies=2, available_copies=2, published_year=1999),
                Book(title="Design Patterns", author="Gang of Four", isbn="978-0201633610", category="Informatique", total_copies=2, available_copies=2, published_year=1994),
                Book(title="Introduction à l'IA", author="Stuart Russell", isbn="978-2744073076", category="Intelligence Artificielle", total_copies=4, available_copies=4, published_year=2021),
                Book(title="Deep Learning", author="Ian Goodfellow", isbn="978-0262035613", category="Intelligence Artificielle", total_copies=3, available_copies=3, published_year=2016),
            ]
            db.session.add_all(seed_books)
            db.session.commit()
    app.run(host='0.0.0.0', port=5001, debug=False)
