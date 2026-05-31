import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content
from typing import Dict, Any, Optional
from app.core.config import SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME
import logging

logger = logging.getLogger(__name__)

# Initialize SendGrid client
if SENDGRID_API_KEY:
    sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
else:
    logger.warning("SendGrid API key is missing! Email sending will fail.")
    sg = None


def send_inquiry_email(
    contact_name: str,
    contact_phone: str,
    contact_message: str,
    property_title: str,
    property_location: str,
    property_price: float,
    recipient_email: str
) -> bool:
    """
    Sends an email notification for a new property inquiry.
    
    Args:
        contact_name: Name of the person submitting the inquiry
        contact_phone: Phone number of the person submitting the inquiry
        contact_message: Message from the inquiry
        property_title: Title of the property being inquired about
        property_location: Location of the property
        property_price: Price of the property
        recipient_email: Email address to send the notification to
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    if not sg:
        logger.error("SendGrid client is not initialized. Cannot send email.")
        return False
    
    if not SENDGRID_FROM_EMAIL:
        logger.error("SENDGRID_FROM_EMAIL is not configured. Cannot send email.")
        return False
    
    try:
        # Format price to currency
        formatted_price = f"₦{property_price:,.0f}"
        
        # Create email content
        subject = f"New Property Inquiry: {property_title}"
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
                .content {{ background-color: #f9f9f9; padding: 20px; border-radius: 5px; }}
                .property-details {{ background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #4F46E5; }}
                .contact-details {{ background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #10B981; }}
                .message {{ background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #F59E0B; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                h2 {{ margin-top: 0; }}
                .label {{ font-weight: bold; color: #555; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Property Inquiry</h1>
                </div>
                <div class="content">
                    <p>You have received a new inquiry about a property on STAFIN Homes.</p>
                    
                    <div class="property-details">
                        <h2>Property Details</h2>
                        <p><span class="label">Title:</span> {property_title}</p>
                        <p><span class="label">Location:</span> {property_location}</p>
                        <p><span class="label">Price:</span> {formatted_price}</p>
                    </div>
                    
                    <div class="contact-details">
                        <h2>Contact Information</h2>
                        <p><span class="label">Name:</span> {contact_name}</p>
                        <p><span class="label">Phone:</span> {contact_phone}</p>
                    </div>
                    
                    <div class="message">
                        <h2>Message</h2>
                        <p>{contact_message}</p>
                    </div>
                    
                    <p><em>Please respond to this inquiry as soon as possible.</em></p>
                </div>
                <div class="footer">
                    <p>This email was sent from STAFIN Homes Property Management System</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create email message
        message = Mail(
            from_email=Email(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
            to_emails=To(recipient_email),
            subject=subject,
            html_content=Content("text/html", html_content)
        )
        
        # Send email
        response = sg.send(message)
        
        if response.status_code in [200, 202]:
            logger.info(f"Inquiry email sent successfully to {recipient_email}")
            return True
        else:
            logger.error(f"Failed to send inquiry email. Status code: {response.status_code}")
            logger.error(f"Response body: {response.body}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending inquiry email: {str(e)}")
        return False


def send_test_email(recipient_email: str) -> bool:
    """
    Sends a test email to verify SendGrid configuration.
    
    Args:
        recipient_email: Email address to send the test email to
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    if not sg:
        logger.error("SendGrid client is not initialized. Cannot send test email.")
        return False
    
    if not SENDGRID_FROM_EMAIL:
        logger.error("SENDGRID_FROM_EMAIL is not configured. Cannot send test email.")
        return False
    
    try:
        subject = "STAFIN Homes - SendGrid Test Email"
        html_content = """
        <html>
        <body>
            <h2>SendGrid Test Email</h2>
            <p>This is a test email from STAFIN Homes to verify that SendGrid is configured correctly.</p>
            <p>If you received this email, your SendGrid integration is working!</p>
            <p><strong>Time sent:</strong> """ + str(__import__('datetime').datetime.now()) + """</p>
        </body>
        </html>
        """
        
        message = Mail(
            from_email=Email(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
            to_emails=To(recipient_email),
            subject=subject,
            html_content=Content("text/html", html_content)
        )
        
        response = sg.send(message)
        
        if response.status_code in [200, 202]:
            logger.info(f"Test email sent successfully to {recipient_email}")
            return True
        else:
            logger.error(f"Failed to send test email. Status code: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending test email: {str(e)}")
        return False
