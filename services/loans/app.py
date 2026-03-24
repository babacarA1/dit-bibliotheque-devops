from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flasgger import Swagger
from datetime import datetime, timedelta
import requests
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'postgresql://dituser:ditpass@db:5432/ditlibrary'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SWAGGER'] = {
    'title': 'Loans Service API',
    'uiversion': 3,
    'description': 'API de gestion des emprunts — DIT Bibliothèque',
    'version': '1.0.0',
}

BOOKS_SERVICE = os.environ.get('BOOKS_SERVICE_URL', 'http://books-service:5001')
USERS_SERVICE = os.environ.get('USERS_SERVICE_URL', 'http://users-service:5002')
LOAN_DURATION_DAYS = 14

db = SQLAlchemy(app)
swagger = Swagger(app)


class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    borrowed_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    returned_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='active')

    def to_dict(self):
        now = datetime.utcnow()
        is_overdue = (
            self.status == 'active' and
            self.due_date and
            now > self.due_date
        )
        days_overdue = (now - self.due_date).days if is_overdue else 0
        return {
            'id': self.id,
            'book_id': self.book_id,
            'user_id': self.user_id,
            'borrowed_at': self.borrowed_at.isoformat() if self.borrowed_at else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'returned_at': self.returned_at.isoformat() if self.returned_at else None,
            'status': 'overdue' if is_overdue else self.status,
            'is_overdue': is_overdue,
            'days_overdue': days_overdue
        }


@app.route('/health', methods=['GET'])
def health():
    """
    Vérifie l'état du service Loans
    ---
    tags:
      - Health
    responses:
      200:
        description: Service opérationnel
        schema:
          type: object
          properties:
            status:
              type: string
              example: ok
            service:
              type: string
              example: loans-service
    """
    return jsonify({'status': 'ok', 'service': 'loans-service'})


@app.route('/api/loans', methods=['GET'])
def get_loans():
    """
    Récupère la liste des emprunts
    ---
    tags:
      - Emprunts
    parameters:
      - name: user_id
        in: query
        type: integer
        required: false
        description: Filtrer par utilisateur
      - name: book_id
        in: query
        type: integer
        required: false
        description: Filtrer par livre
      - name: status
        in: query
        type: string
        required: false
        enum: [active, returned]
        description: Filtrer par statut
    responses:
      200:
        description: Liste des emprunts
        schema:
          type: array
          items:
            $ref: '#/definitions/Loan'
    definitions:
      Loan:
        type: object
        properties:
          id:
            type: integer
          book_id:
            type: integer
          user_id:
            type: integer
          borrowed_at:
            type: string
          due_date:
            type: string
          returned_at:
            type: string
          status:
            type: string
          is_overdue:
            type: boolean
          days_overdue:
            type: integer
    """
    user_id = request.args.get('user_id')
    book_id = request.args.get('book_id')
    status = request.args.get('status')

    query = Loan.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if book_id:
        query = query.filter_by(book_id=book_id)
    if status == 'active':
        query = query.filter(Loan.status == 'active')
    elif status == 'returned':
        query = query.filter(Loan.status == 'returned')

    loans = query.order_by(Loan.borrowed_at.desc()).all()
    loan_dicts = []
    for loan in loans:
        d = loan.to_dict()
        try:
            book_resp = requests.get(f'{BOOKS_SERVICE}/api/books/{loan.book_id}', timeout=3)
            if book_resp.status_code == 200:
                d['book'] = book_resp.json()
        except Exception:
            pass
        try:
            user_resp = requests.get(f'{USERS_SERVICE}/api/users/{loan.user_id}', timeout=3)
            if user_resp.status_code == 200:
                d['user'] = user_resp.json()
        except Exception:
            pass
        loan_dicts.append(d)
    return jsonify(loan_dicts)


@app.route('/api/loans/<int:loan_id>', methods=['GET'])
def get_loan(loan_id):
    """
    Récupère un emprunt par son ID
    ---
    tags:
      - Emprunts
    parameters:
      - name: loan_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Détails de l'emprunt
        schema:
          $ref: '#/definitions/Loan'
      404:
        description: Emprunt non trouvé
    """
    loan = Loan.query.get_or_404(loan_id)
    return jsonify(loan.to_dict())


@app.route('/api/loans', methods=['POST'])
def create_loan():
    """
    Crée un nouvel emprunt
    ---
    tags:
      - Emprunts
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - book_id
            - user_id
          properties:
            book_id:
              type: integer
              example: 1
            user_id:
              type: integer
              example: 1
    responses:
      201:
        description: Emprunt créé (durée 14 jours)
        schema:
          $ref: '#/definitions/Loan'
      400:
        description: Données invalides ou livre non disponible
      409:
        description: Emprunt actif déjà existant pour ce livre/utilisateur
      503:
        description: Service livres inaccessible
    """
    data = request.get_json()
    if not data.get('book_id') or not data.get('user_id'):
        return jsonify({'error': 'book_id and user_id are required'}), 400

    existing = Loan.query.filter_by(
        book_id=data['book_id'],
        user_id=data['user_id'],
        status='active'
    ).first()
    if existing:
        return jsonify({'error': 'User already has an active loan for this book'}), 409

    try:
        resp = requests.put(
            f'{BOOKS_SERVICE}/api/books/{data["book_id"]}/availability',
            json={'action': 'borrow'},
            timeout=5
        )
        if resp.status_code != 200:
            return jsonify({'error': resp.json().get('error', 'Book not available')}), 400
    except Exception as e:
        return jsonify({'error': f'Could not reach books service: {str(e)}'}), 503

    loan = Loan(
        book_id=data['book_id'],
        user_id=data['user_id'],
        due_date=datetime.utcnow() + timedelta(days=LOAN_DURATION_DAYS)
    )
    db.session.add(loan)
    db.session.commit()
    return jsonify(loan.to_dict()), 201


@app.route('/api/loans/<int:loan_id>/return', methods=['PUT'])
def return_loan(loan_id):
    """
    Enregistre le retour d'un livre emprunté
    ---
    tags:
      - Emprunts
    parameters:
      - name: loan_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Retour enregistré
        schema:
          $ref: '#/definitions/Loan'
      400:
        description: Emprunt déjà retourné
      404:
        description: Emprunt non trouvé
    """
    loan = Loan.query.get_or_404(loan_id)
    if loan.status == 'returned':
        return jsonify({'error': 'Loan already returned'}), 400

    try:
        requests.put(
            f'{BOOKS_SERVICE}/api/books/{loan.book_id}/availability',
            json={'action': 'return'},
            timeout=5
        )
    except Exception:
        pass

    loan.returned_at = datetime.utcnow()
    loan.status = 'returned'
    db.session.commit()
    return jsonify(loan.to_dict())


@app.route('/api/loans/stats', methods=['GET'])
def get_stats():
    """
    Statistiques globales des emprunts
    ---
    tags:
      - Emprunts
    responses:
      200:
        description: Statistiques
        schema:
          type: object
          properties:
            total_loans:
              type: integer
            active_loans:
              type: integer
            returned_loans:
              type: integer
            overdue_loans:
              type: integer
    """
    now = datetime.utcnow()
    total = Loan.query.count()
    active = Loan.query.filter_by(status='active').count()
    returned = Loan.query.filter_by(status='returned').count()
    overdue = Loan.query.filter(
        Loan.status == 'active',
        Loan.due_date < now
    ).count()
    return jsonify({
        'total_loans': total,
        'active_loans': active,
        'returned_loans': returned,
        'overdue_loans': overdue
    })


with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=False)
