from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://dituser:ditpass@db:5432/ditlibrary'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

USER_TYPES = ['Etudiant', 'Professeur', 'Personnel administratif']


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(512))
    user_type = db.Column(db.String(50), nullable=False, default='Etudiant')
    student_id = db.Column(db.String(50), unique=True)
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'user_type': self.user_type,
            'student_id': self.student_id,
            'phone': self.phone,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'users-service'})


@app.route('/api/users', methods=['GET'])
def get_users():
    user_type = request.args.get('type')
    query = User.query
    if user_type:
        query = query.filter_by(user_type=user_type)
    users = query.all()
    return jsonify([u.to_dict() for u in users])


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    required = ['name', 'email', 'user_type']
    for f in required:
        if not data.get(f):
            return jsonify({'error': f'{f} is required'}), 400

    if data['user_type'] not in USER_TYPES:
        return jsonify({'error': f'user_type must be one of {USER_TYPES}'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    user = User(
        name=data['name'],
        email=data['email'],
        user_type=data['user_type'],
        student_id=data.get('student_id'),
        phone=data.get('phone')
    )
    if data.get('password'):
        user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    for field in ['name', 'email', 'user_type', 'student_id', 'phone', 'is_active']:
        if field in data:
            setattr(user, field, data[field])
    if 'password' in data:
        user.set_password(data['password'])
    db.session.commit()
    return jsonify(user.to_dict())


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'})


@app.route('/api/users/stats', methods=['GET'])
def get_stats():
    total = User.query.count()
    by_type = {}
    for t in USER_TYPES:
        by_type[t] = User.query.filter_by(user_type=t).count()
    return jsonify({'total_users': total, 'by_type': by_type})


@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and (not user.password_hash or user.check_password(data.get('password', ''))):
        return jsonify({'user': user.to_dict(), 'message': 'Login successful'})
    return jsonify({'error': 'Invalid credentials'}), 401


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if User.query.count() == 0:
            seed_users = [
                User(name='Amadou Diallo', email='amadou@dit.sn', user_type='Etudiant', student_id='DIT2024001', phone='+221771234567'),
                User(name='Fatou Sow', email='fatou@dit.sn', user_type='Etudiant', student_id='DIT2024002', phone='+221772345678'),
                User(name='Dr. Moussa Traoré', email='moussa@dit.sn', user_type='Professeur', phone='+221773456789'),
                User(name='Aïssatou Ba', email='aissatou@dit.sn', user_type='Personnel administratif', phone='+221774567890'),
            ]
            db.session.add_all(seed_users)
            db.session.commit()
    app.run(host='0.0.0.0', port=5002, debug=False)
