import redis
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import secrets
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

load_dotenv('.env.local')

# Initialize Redis connection
redis_client = redis.Redis.from_url(
    f"redis://{os.getenv('REDIS_URL')}",
    password=os.getenv('REDIS_PASSWORD'),
    decode_responses=True
)

def send_magic_link(email: str, token: str):
    """Send magic link via email"""
    sender_email = os.getenv('SMTP_FROM_EMAIL')
    sender_name = os.getenv('SMTP_FROM_NAME')
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = f"{sender_name} <{sender_email}>"
    msg['To'] = email
    msg['Subject'] = "Your Magic Link for SpeechScribe"
    
    # Create the magic link
    magic_link = f"{os.getenv('APP_URL')}/verify?token={token}"
    
    # HTML body
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Welcome to SpeechScribe!</h2>
            <p>Click the button below to sign in:</p>
            <a href="{magic_link}" 
               style="background-color: #4CAF50; color: white; padding: 14px 25px; 
                      text-align: center; text-decoration: none; display: inline-block; 
                      border-radius: 4px;">
                Sign In to SpeechScribe
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p>{magic_link}</p>
            <p>This link will expire in 30 minutes.</p>
        </body>
    </html>
    """
    
    msg.attach(MIMEText(html, 'html'))
    
    # Send email
    with smtplib.SMTP(os.getenv('SMTP_SERVER'), int(os.getenv('SMTP_PORT'))) as server:
        server.starttls()
        server.login(os.getenv('SMTP_USERNAME'), os.getenv('SMTP_PASSWORD'))
        server.send_message(msg)

def generate_magic_link(email: str) -> str:
    """Generate a magic link token and store in Redis"""
    token = secrets.token_urlsafe(32)
    expiry = 1800  # 30 minutes
    
    # Store token in Redis with expiry
    redis_client.setex(f"magic_link:{token}", expiry, email)
    
    return token

def verify_magic_link(token: str) -> str:
    """Verify magic link token and return associated email"""
    key = f"magic_link:{token}"
    email = redis_client.get(key)
    
    if email:
        redis_client.delete(key)
        return email
    return None

def create_user(email: str, name: str) -> dict:
    """Create a new user pending admin approval"""
    user = {
        'email': email,
        'name': name,
        'status': 'pending',  # pending, approved, rejected
        'created_at': datetime.now().isoformat(),
        'approved_at': None,
        'last_login': None
    }
    
    redis_client.hset(f"user:{email}", mapping=user)
    return user

def get_user(email: str) -> dict:
    """Get user details from Redis"""
    user = redis_client.hgetall(f"user:{email}")
    return user if user else None

def approve_user(email: str, admin_email: str) -> bool:
    """Approve a pending user"""
    if admin_email != os.getenv('ADMIN_EMAIL'):
        return False
        
    user = get_user(email)
    if user and user['status'] == 'pending':
        user['status'] = 'approved'
        user['approved_at'] = datetime.now().isoformat()
        redis_client.hset(f"user:{email}", mapping=user)
        
        # Send approval notification
        token = generate_magic_link(email)
        send_magic_link(email, token)
        return True
    return False

def update_last_login(email: str):
    """Update user's last login timestamp"""
    user = get_user(email)
    if user:
        user['last_login'] = datetime.now().isoformat()
        redis_client.hset(f"user:{email}", mapping=user)

def list_pending_users() -> list:
    """List all pending users for admin review"""
    pending_users = []
    for key in redis_client.scan_iter("user:*"):
        user = redis_client.hgetall(key)
        if user['status'] == 'pending':
            pending_users.append(user)
    return pending_users

def is_admin(email: str) -> bool:
    """Check if user is admin"""
    return email == os.getenv('ADMIN_EMAIL')
