from functools import wraps
from flask import (
    abort,
    url_for,
    session,
    Flask,
    render_template,
    jsonify,
    request,
    redirect,
)
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from datetime import datetime, timedelta,timezone
# from functions import *
# from image_embedding_system import ImageEmbeddingSystem
from PIL import Image
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from googleapiclient.discovery import build
from pip._vendor import cachecontrol
from sqlalchemy import DateTime
from sqlalchemy.sql import func
import os, io, base64, uuid, pathlib, google.auth.transport.requests, requests
from werkzeug.utils import secure_filename
from config.config import *


# Load environment variables from file
load_dotenv("./config/.env")

# Access environment variables
flask_secret_key = os.getenv("FLASK_SECRET_KEY")

app = Flask(__name__)
app.secret_key = flask_secret_key  # Required for session management
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["DEFAULT_PROFILE_PIC"] = DEFAULT_PROFILE_PIC

db = SQLAlchemy(app)
CORS(app)  # Enable CORS for all routes


# Add this helper function
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


#  IMPLEMENTING RAG LOGIC
# Loading the model
# MODEL CODE 

# GOOGLE LOGIN
# Add the UserProfile model
class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), unique=True)
    username = db.Column(db.String(50), unique=True)
    bio = db.Column(db.Text)
    profile_pic = db.Column(db.String(200))
    location = db.Column(db.String(100))
    date_joined = db.Column(DateTime, default=func.now())
    quizzes_played = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)
    total_points = db.Column(db.Integer, default=0)
    achievements = db.Column(db.Text)  # Store as JSON string
    favorite_categories = db.Column(db.Text)  # Store as JSON string

    # Add relationship to User model
    user = db.relationship("User", backref=db.backref("profile", uselist=False))


# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(100), unique=True)
    email = db.Column(db.String(100), unique=True)
    name = db.Column(db.String(100))
    has_completed_profile = db.Column(db.Boolean, default=False)


# Session Model
class UserSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(
        db.String(100), unique=True, default=lambda: str(uuid.uuid4())
    )
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    started_at = db.Column(DateTime, default=func.now(), nullable=False)
    last_activity = db.Column(DateTime, default=func.now(), onupdate=func.now())
    ended_at = db.Column(DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    ip_address = db.Column(db.String(45))  # IPv6 compatible
    user_agent = db.Column(db.String(255))

    # Relationship
    user = db.relationship("User", backref=db.backref("sessions", lazy=True))


def start_session(user, request):
    """
    Start a new session for a user

    Args:
        user: User object
        request: Flask request object
    Returns:
        UserSession object
    """
    # End any existing active sessions for this user
    UserSession.query.filter_by(user_id=user.id, is_active=True).update(
        {"ended_at": func.now(), "is_active": False}
    )
    db.session.commit()

    # Create new session
    new_session = UserSession(
        user_id=user.id,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string,
    )
    db.session.add(new_session)
    db.session.commit()

    return new_session


def end_session(session_id):
    """
    End a specific session

    Args:
        session_id: String session ID
    Returns:
        Boolean indicating success
    """
    session = UserSession.query.filter_by(session_id=session_id, is_active=True).first()

    if session:
        session.ended_at = func.now()
        session.is_active = False
        db.session.commit()
        return True
    return False


def end_all_user_sessions(user_id):
    """
    End all active sessions for a specific user

    Args:
        user_id: Integer user ID
    Returns:
        Number of sessions ended
    """
    result = UserSession.query.filter_by(user_id=user_id, is_active=True).update(
        {"ended_at": func.now(), "is_active": False}
    )
    db.session.commit()
    return result


def cleanup_expired_sessions(max_age_hours=24):
    """
    Clean up sessions that have been inactive for specified time

    Args:
        max_age_hours: Integer hours of inactivity before session expires
    Returns:
        Number of sessions cleaned up
    """
    expiry_time = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
    result = UserSession.query.filter(
        UserSession.is_active == True, UserSession.last_activity < expiry_time
    ).update({"ended_at": func.now(), "is_active": False})
    db.session.commit()
    return result


# Middleware to track session activity
@app.before_request
def update_session_activity():
    if "session_id" in session:
        UserSession.query.filter_by(
            session_id=session["session_id"], is_active=True
        ).update({"last_activity": func.now()})
        db.session.commit()


def login_is_required(function):
    @wraps(function)
    def decorated_function(*args, **kwargs):
        if "google_id" not in session:
            return redirect(url_for("login"))
            # abort(401)
        return function(*args, **kwargs)

    return decorated_function


# since oauth2 accepts https only , lets bypass this by setting an env coz we're in test mode
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

google_oauth_client_id = os.getenv("GOOGLE_OAUTH_CLIENT_ID")
client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "./config/client_secrets.json")

flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=[
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
    ],
    redirect_uri="http://127.0.0.1:5000/callback",
)

# ROUTES
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login-dashboard")
def login_dashboard():
    # User not logged in: direct them to login
    if "credentials" not in session:
        return redirect("/login")

    # User is logged in
    return render_template("home.html", user=session.get("user_info"))


@app.route("/login")
def login():
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)


@app.route("/callback")
def callback():
    flow.fetch_token(authorization_response=request.url)

    # FOR SECURITY PURPOSES

    credentials = flow.credentials
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = google.auth.transport.requests.Request(session=cached_session)

    # Get user info
    service = build("oauth2", "v2", credentials=credentials)
    user_info = service.userinfo().get().execute()

    # Check if user exists in database
    user = User.query.filter_by(google_id=user_info["id"]).first()
    if not user:
        user = User(
            google_id=user_info["id"], email=user_info["email"], name=user_info["name"]
        )
        db.session.add(user)
        db.session.commit()

    # Store credentials and user info in session
    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=token_request,
        audience=google_oauth_client_id,
    )

    # Start a new session for the user
    user_session = start_session(user, request)

    # Store necessary information in Flask session
    session["google_id"] = id_info.get("sub")
    session["name"] = id_info.get("name")
    session["credentials"] = id_info
    session["user_info"] = user_info
    session["session_id"] = user_session.session_id  # Store database session ID

    update_session_activity()

    # Check if user has a profile
    profile = UserProfile.query.filter_by(user_id=user.id).first()
    if not profile:
        return redirect(url_for("profile", filename="setup_profile"))

    return render_template("home.html", user=session.get("user_info"))


# Add these new routes
@app.route("/setup-profile", methods=["GET", "POST"])
@login_is_required
def setup_profile():
    user = User.query.filter_by(google_id=session["google_id"]).first()

    if request.method == "POST":
        username = request.form.get("username")
        bio = request.form.get("bio")
        location = request.form.get("location")

        # Handle profile picture upload
        if "profile_pic" in request.files:
            file = request.files["profile_pic"]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(filepath)
                profile_pic = filepath
            else:
                profile_pic = DEFAULT_PROFILE_PIC

        # Create or update profile
        profile = UserProfile.query.filter_by(user_id=user.id).first()
        if not profile:
            profile = UserProfile(
                user_id=user.id,
                username=username,
                bio=bio,
                profile_pic=profile_pic,
                location=location,
            )
            db.session.add(profile)
        else:
            profile.username = username
            profile.bio = bio
            profile.profile_pic = profile_pic
            profile.location = location

        # Mark profile as completed
        user.has_completed_profile = True
        db.session.commit()

        return redirect(url_for("profile", filename="profile"))

    return render_template("profile/setup_profile.html", user=user)


@app.route("/profile")
@login_is_required
def profile():
    user = User.query.filter_by(google_id=session["google_id"]).first()
    profile = user.profile
    return render_template("profile/profile.html", user=user, profile=profile)


@app.route("/edit-profile", methods=["GET", "POST"])
@login_is_required
def edit_profile():
    user = User.query.filter_by(google_id=session["google_id"]).first()
    profile = UserProfile.query.filter_by(user_id=user.id).first()

    # If profile doesn't exist, create it
    if not profile:
        profile = UserProfile(
            user_id=user.id,
            username="",  # Default empty values
            bio="",
            profile_pic=DEFAULT_PROFILE_PIC,
            location="",
        )
        db.session.add(profile)
        db.session.commit()

    if request.method == "POST":
        profile.username = request.form.get("username")
        profile.bio = request.form.get("bio")
        profile.location = request.form.get("location")

        if "profile_pic" in request.files:
            file = request.files["profile_pic"]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(filepath)
                profile.profile_pic = filepath

        # Mark profile as completed
        user.has_completed_profile = True
        db.session.commit()
        return redirect(url_for("profile", filename="profile"))

    return render_template("profile/edit_profile.html", user=user, profile=profile)


# Add these helper functions for tracking user progress
def update_user_stats(user_id, quiz_completed=False, correct_answer=False, points=0):
    profile = UserProfile.query.filter_by(user_id=user_id).first()
    if quiz_completed:
        profile.quizzes_played += 1
    if correct_answer:
        profile.correct_answers += 1
    profile.total_points += points
    db.session.commit()


@app.route("/logout")
def logout():
    try:
        # End the database session if it exists
        if "session_id" in session:
            end_session(session["session_id"])

        # Clear the Flask session
        session.clear()

        return redirect("/index")
    except Exception as e:
        # Log the error and handle gracefully
        app.logger.error(f"Logout error: {str(e)}")
        session.clear()  # Still try to clear session
        return redirect("/index")


#  ROUTE FOR  HOME

@app.route("/home", methods=["GET", "POST"])
@login_is_required
def home():
    update_session_activity()
    try:
        if request.method == "GET":
            return render_template("home.html", user=session.get("user_info"))

        elif request.method == "POST":
            # Handle the API search request
            data = request.json
            if not data:
                return jsonify({"error": "No data provided"}), 400

            query = data.get("query")

            if not query:
                return jsonify({"error": "No query provided"}), 400

            # Use your existing search function

            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/game/<module>")
@login_is_required
def game(module):
    user = User.query.filter_by(google_id=session["google_id"]).first()
    # After completing a quiz or game:
    update_user_stats(user.id, quiz_completed=True, correct_answer=True, points=5)
    return render_template("game.html", module=module)




@app.route("/games")
@login_is_required
def games():
    # Your logic for handling the game module
    update_session_activity()
    return render_template("games.html")

@app.route("/csw24")
@login_is_required
def csw24():
    # Your logic for handling the game module
    update_session_activity()
    return render_template("csw24.html")

@app.route("/csw_24_modules")
@login_is_required
def csw_24_modules():
    # Your logic for handling the game module
    update_session_activity()
    return render_template("csw_24_modules.html")

@app.route("/modules")
@login_is_required
def modules():
    # Your logic for handling the game module
    update_session_activity()
    return render_template("modules.html")



@app.route("/users")
def get_users():
    users = User.query.all()
    user_data = []
    for user in users:
        user_data.append(
            {
                "id": user.id,
                "google_id": user.google_id,
                "name": user.name,
                "email": user.email,
            }
        )
    return {"users": user_data}


@app.route("/user-sessions")
def get_user_sessions():
    user_sessions = UserSession.query.all()
    user_session_data = []
    for user in user_sessions:
        user_session_data.append(
            {
                "session_id": user.session_id,
                "user_id": user.user_id,
                "ip_address": user.ip_address,
                "user_agent": user.user_agent,
                "started_at": user.started_at,
                "last_activity": user.last_activity,
                "ended_at": user.ended_at,
                "is_active": user.is_active,
            }
        )
    return {"user_sessions": user_session_data}


@app.route("/user-profiles")
def get_user_profiles():
    user_profiles = UserProfile.query.all()
    user_profile_data = []
    for user in user_profiles:
        user_profile_data.append(
            {
                "user_id": user.user_id,
                "username": user.username,
                "bio": user.bio,
                "profile_pic": user.profile_pic,
                "location": user.location,
                "date_joined": user.date_joined,
                "quizzes_played": user.quizzes_played,
                "correct_answers": user.correct_answers,
                "total_points": user.total_points,
                "achievements": user.achievements,
                "favorite_categories": user.favorite_categories,
            }
        )
    return {"user_profiles": user_profile_data}


if __name__ == "__main__":
    app.run(debug=True)

    # in prod

    # with app.app_context():
    #     db.create_all()
    # app.run(debug=True)
