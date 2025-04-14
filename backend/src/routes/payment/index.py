from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import stripe
import os
from dotenv import load_dotenv
from src.routes.auth.oauth2 import manager
from src.models.user import User
from src.utils.credits import update_user_plan, reset_user_credits
from src.lib.logger.index import logger
from src.db.mongodb import get_collection

# Load environment variables
load_dotenv()

# Initialize Stripe and MongoDB
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
users_collection = get_collection("users")

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
        "cta": "Unlock Basic",
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
        "cta": "Unlock Pro",
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
async def create_checkout_session(request: CheckoutRequest, user: User = Depends(manager)):
    """Create a Stripe checkout session for a subscription"""
    try:
        logger.info(f"Creating checkout session for: {request.model_dump()}")
        
        # Get or create Stripe customer
        customer_id = user.get('stripe_customer_id')
        if not customer_id:
            # Create new customer
            customer = stripe.Customer.create(
                email=user['email'],
                metadata={'user_id': user['id']}
            )
            customer_id = customer.id
            # Save customer ID to user
            users_collection.update_one(
                {"id": user['id']},
                {"$set": {"stripe_customer_id": customer_id}}
            )
            logger.info(f"Created new Stripe customer: {customer_id}")
        
        # Get the selected tier
        tier = PRICING_TIERS.get(request.tier)
        if not tier:
            logger.error(f"Invalid tier selected: {request.tier}")
            raise HTTPException(status_code=400, detail="Invalid tier selected")

        # Check if it's a free tier
        if request.tier == "free":
            logger.info("Free tier selected, no checkout needed")
            return JSONResponse(
                status_code=200,
                content={"message": "Free tier selected, no checkout needed"},
            )

        # Get the appropriate price ID based on billing cycle
        price_id = (
            tier.get("stripe_yearly_price_id")
            if request.is_yearly
            else tier.get("stripe_monthly_price_id")
        )

        if not price_id:
            logger.error(f"No price ID found for tier {request.tier} (yearly: {request.is_yearly})")
            raise HTTPException(
                status_code=400, detail="Price ID not configured for this tier"
            )

        logger.info(f"Using price_id: {price_id} for tier: {request.tier}")

        # Create checkout session with metadata
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
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
            client_reference_id=user['id'],
            metadata={
                'tier': request.tier,
                'is_yearly': str(request.is_yearly)
            },
            allow_promotion_codes=True,
        )

        logger.info(f"Created checkout session: {checkout_session.id}")
        return {"url": checkout_session.url}

    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        logger.info("Received webhook event")
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )

        logger.info(f"Webhook event type: {event.type}")
        logger.debug(f"Full event data: {event}")

        # Handle the event
        if event.type == "checkout.session.completed":
            session = event.data.object
            logger.info(f"Checkout completed for session: {session.id}")
            logger.debug(f"Session data: {session}")

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/success")
async def handle_payment_success(
    request: Request,
    background_tasks: BackgroundTasks,
    user: User = Depends(manager)
):
    """Handle successful payment and plan upgrade"""
    try:
        logger.info("Success endpoint called")
        logger.info(f"Request headers: {request.headers}")
        logger.info(f"Request query params: {request.query_params}")

        # Get session_id from query params
        session_id = request.query_params.get("session_id")
        if not session_id:
            logger.error("No session_id provided in query params")
            return JSONResponse(
                status_code=400,
                content={"detail": "No session_id provided"}
            )

        logger.info(f"Processing successful payment for session: {session_id}")
        logger.info(f"User data: {user}")

        # Get the session details from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        logger.info(f"Retrieved session data: {session}")
        
        # Get the client reference ID to ensure it matches the user
        if session.client_reference_id != user["id"]:
            logger.error(f"User ID mismatch - Session user: {session.client_reference_id}, Current user: {user['id']}")
            return JSONResponse(
                status_code=403,
                content={"detail": "Unauthorized"}
            )
            
        # Extract plan details from metadata
        tier = session.metadata.get('tier')
        is_yearly = session.metadata.get('is_yearly') == 'true'
        
        logger.info(f"Plan details from session - Tier: {tier}, Yearly: {is_yearly}")
        
        if not tier:
            logger.error("No tier found in session metadata")
            logger.debug(f"Full session metadata: {session.metadata}")
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid session data"}
            )
        
        logger.info(f"Attempting to update plan for user {user['id']} to {tier} (yearly: {is_yearly})")
        
        # Update the user's plan
        success, error = await update_user_plan(
            user_id=user["id"],
            tier=tier,
            is_yearly=is_yearly
        )
        
        if not success:
            logger.error(f"Failed to update plan - User: {user['id']}, Error: {error}")
            return JSONResponse(
                status_code=500,
                content={"detail": f"Failed to update plan: {error}"}
            )
            
        logger.info(f"Successfully updated plan for user {user['id']}")
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Plan updated successfully",
                "plan": {
                    "tier": tier,
                    "is_yearly": is_yearly
                }
            }
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error during success handling: {str(e)}")
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )
    except Exception as e:
        logger.error(f"Unexpected error during success handling: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error traceback: {e.__traceback__}")
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@router.post("/failure")
async def handle_payment_failure(
    session_id: str,
    user: User = Depends(manager)
):
    """Handle failed payment"""
    try:
        # Get the session details from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Get the client reference ID to ensure it matches the user
        if session.client_reference_id != user["id"]:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        # Log the failure
        logger.error(f"Payment failed for user {user['id']}, session {session_id}")
        
        return {
            "status": "error",
            "message": "Payment failed. Please try again or contact support."
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in payment failure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel-subscription")
async def cancel_subscription(user: User = Depends(manager)):
    try:
        logger.info(f"Cancelling subscription for user: {user['id']}")
        
        # Get user's stripe customer ID
        customer_id = user.get('stripe_customer_id')
        if not customer_id:
            # If no stripe ID, just update plan to free
            success, error = await update_user_plan(
                user_id=user["id"],
                tier="free",
                is_yearly=False
            )
            if not success:
                return JSONResponse(status_code=500, content={"detail": f"Failed to update plan: {error}"})
            return JSONResponse(status_code=200, content={
                "status": "success",
                "message": "Your account has been updated to the free plan."
            })

        # Get active subscriptions
        subscriptions = stripe.Subscription.list(
            customer=customer_id,
            status='active',
            limit=1
        )
        
        if not subscriptions.data:
            # No active subscription, just update plan
            success, error = await update_user_plan(
                user_id=user["id"],
                tier="free",
                is_yearly=False
            )
            if not success:
                return JSONResponse(status_code=500, content={"detail": f"Failed to update plan: {error}"})
            return JSONResponse(status_code=200, content={
                "status": "success",
                "message": "Your account has been updated to the free plan."
            })
            
        # Cancel the subscription
        subscription = subscriptions.data[0]
        logger.info(f"Found subscription: {subscription.id}")
        
        cancelled = stripe.Subscription.modify(
            subscription.id,
            cancel_at_period_end=True
        )
        
        # Update user's plan
        success, error = await update_user_plan(
            user_id=user["id"],
            tier="free",
            is_yearly=False
        )
        
        if not success:
            logger.error(f"Failed to update plan: {error}")
            return JSONResponse(status_code=500, content={"detail": f"Failed to update plan: {error}"})
            
        logger.info(f"Successfully cancelled subscription for user: {user['id']}")
        
        return JSONResponse(status_code=200, content={
            "status": "success",
            "message": "Your subscription has been cancelled.",
            "cancelled_at": cancelled.cancel_at
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return JSONResponse(status_code=400, content={"detail": str(e)})
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)}) 
