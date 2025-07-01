import pandas as pd
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email account details
SMTP_SERVER = "smtp.gmail.com"  # e.g., 'smtp.gmail.com'
SMTP_PORT = 587  # or 465 for SSL
EMAIL_ADDRESS = "farouk@spydr.dev"
EMAIL_PASSWORD = (
    "ulci dzfz dreq iagt"  # Use environment vars or secrets manager in production
)

# Load CSV
df = pd.read_csv("storage.csv")

# Email content
SUBJECT = "What made you interested in Spydr? (+ exciting update inside)."
BODY_TEMPLATE = """Hey {name},

I promise I don't plan on spamming haha. Thanks for signing up for Spydr, I'm reaching out personally because I'd like to figure out where the friction lies for new users. Spydr started out as a way to connect your content across different AI clients, but now it's evolving into something a bit more personalized.

I'd love to hear from you:
- What made you sign up in the first place?
- Did you try uploading anything? What felt annoying or unclear?
- What would make Spydr something you'd use every day or even every week?
- What social platforms do you use most? (Twitter/X, Pinterest, YouTube, LinkedIn, etc.)
- Would you find value in that information being instantly available to your AI assistants?

What's coming next:
I'm building out a new feature called Feeds, automatic data streams from your social accounts that get structured and made instantly searchable by your AI assistants. Imagine Claude or ChatGPT knowing your Twitter likes, Pinterest boards, and YouTube history without you having to manually upload anything. If you're open to it, I'd love to hop on a 5-10 min call or just hear your raw thoughts by reply.

Really appreciate your time!
- Farouk @ Spydr

P.S. Early users who help shape this get first access to Feeds and a free premium account for more storage :)
"""


def send_email(recipient_name, recipient_email):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = recipient_email
    msg["Subject"] = SUBJECT

    body = BODY_TEMPLATE.format(name=recipient_name.split()[0])
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, recipient_email, msg.as_string())

    print(f"Email sent to {recipient_name} <{recipient_email}>")


# Loop through each contact
for index, row in df.iterrows():
    send_email(row["full_name"], row["email"])
