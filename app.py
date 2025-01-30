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

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)

#     # in prod

#     # with app.app_context():
#     #     db.create_all()
#     # app.run(debug=True)
