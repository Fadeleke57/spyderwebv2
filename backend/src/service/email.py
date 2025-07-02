from src.lib.logger.index import logger


class EmailService:
    def __init__(self):
        self.support_email = "support@spydr.dev"
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.personal_email = "farouk@spydr.dev"
