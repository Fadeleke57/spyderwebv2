from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import stripe
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter()

# Define pricing tiers
PRICING_TIERS = {
    "free": {
        "name": "Free",
        "price": "0",
        "description": "Perfect for personal notes",
        "features": [
            "5 GB Storage",
            "100 AI Operations/mo",
            "Basic Web Features",
            "3 Webs",
            "Community Support",
            "Mobile Access",
        ],
        "cta": "Get Started",
        "highlighted": False,
    },
    "basic": {
        "name": "Basic",
        "monthlyPrice": "10",
        "yearlyPrice": "8",
        "description": "For power users who write a lot",
        "features": [
            "50 GB Storage",
            "1,000 AI Operations/mo",
            "All Web Features",
            "15 Webs",
            "Email Support",
            "Mobile Access",
            "Version History",
            "Collaboration Tools",
        ],
        "cta": "Start Free Trial",
        "highlighted": True,
        "stripe_monthly_price_id": os.getenv("STRIPE_BASIC_MONTHLY_PRICE_ID"),
        "stripe_yearly_price_id": os.getenv("STRIPE_BASIC_YEARLY_PRICE_ID"),
    },
    "pro": {
        "name": "Pro",
        "monthlyPrice": "30",
        "yearlyPrice": "25",
        "description": "For teams and heavy AI users",
        "features": [
            "200 GB Storage",
            "5,000 AI Operations/mo",
            "All Web Features",
            "Unlimited Webs",
            "Priority Support",
            "Mobile Access",
            "Extended History",
            "Advanced Collaboration",
            "AI API Access",
        ],
        "cta": "Start Free Trial",
        "highlighted": False,
        "stripe_monthly_price_id": os.getenv("STRIPE_PRO_MONTHLY_PRICE_ID"),
        "stripe_yearly_price_id": os.getenv("STRIPE_PRO_YEARLY_PRICE_ID"),
    },
}

class CheckoutRequest(BaseModel):
    tier: str
    is_yearly: bool
    user_id: Optional[str] = None

@router.get("/tiers")
async def get_pricing_tiers():
    """Get all pricing tiers"""
    return PRICING_TIERS

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest):
    """Create a Stripe checkout session for a subscription"""
    try:
        # Get the selected tier
        tier = PRICING_TIERS.get(request.tier)
        if not tier:
            raise HTTPException(status_code=400, detail="Invalid tier selected")
        
        # Check if it's a free tier
        if request.tier == "free":
            return JSONResponse(
                status_code=200,
                content={"message": "Free tier selected, no checkout needed"}
            )
        
        # Get the appropriate price ID based on billing cycle
        price_id = tier.get("stripe_yearly_price_id") if request.is_yearly else tier.get("stripe_monthly_price_id")
        
        if not price_id:
            raise HTTPException(status_code=400, detail="Price ID not configured for this tier")
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=f"{os.getenv('NEXT_URL')}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.getenv('NEXT_URL')}/payment/cancel",
            client_reference_id=request.user_id,
            allow_promotion_codes=True,
        )
        
        return {"url": checkout_session.url}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
        
        # Handle the event
        if event.type == "checkout.session.completed":
            session = event.data.object
            # Handle successful checkout
            # You can update user subscription status here
            print(f"Checkout completed for session: {session.id}")
        
        return {"status": "success"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 