import os
import smtplib
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from dotenv import load_dotenv
import traceback

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

SERVER_URL = os.getenv("SERVER_URL")

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = SMTP_USERNAME
        msg["To"] = to_email
        msg["Date"] = formatdate(localtime = True)
        msg["Message-ID"] = make_msgid(domain = SMTP_USERNAME.split("@")[-1])
        msg["Reply-To"] = f"TranscriptX Admin <admin@{SMTP_USERNAME.split('@')[-1]}"        
        msg.set_content(body)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(msg)

        return True
    except Exception as e:
        print(traceback.format_exc())
        return False


def send_verification_email(email: str, token: str):
    subject = "Email Verification - TranscriptX"
    body = f"""\
    Hi,

    Thank you for joining TranscriptX — we're excited to have you on board!

    To activate your account, please confirm your email address by clicking the link below:
    https://{SERVER_URL}/api/auth/verify-email?token={token}

    If you didn’t sign up for a TranscriptX account, no further action is required — you can safely disregard this email.

    If you have any questions or need help, feel free to reach out to our support team.

    Best regards,
    The TranscriptX Team
    transcriptx.my.id
        """
    return send_email(email, subject, body)


def send_reset_password_email(email: str, token: str):
    subject = "Reset Password - TranscriptX"
    body = f"""\
Hi there,

We received a request to reset the password for your TranscriptX account.

To proceed, please use the token below:

{token}

If you did not request a password reset, please ignore this message or contact our support team.

Best regards,  
The TranscriptX Team
    """
    return send_email(email, subject, body)