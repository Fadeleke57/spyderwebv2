from datetime import datetime
from typing import Optional
from src.models.user import Users
from src.db.mongodb import get_collection
from pytz import UTC
from src.constants.credits import PLAN_CREDITS, OPERATION_COSTS


async def reset_user_credits(user_id: str) -> bool:
    """Reset a user's credits based on their subscription plan."""
    try:
        user = Users.find_one({"id": user_id})
        if not user:
            return False

        plan = user.get("subscription_plan", "free")
        credits = PLAN_CREDITS.get(plan, PLAN_CREDITS["free"])

        Users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "credits": credits,
                    "last_credits_reset": datetime.now(UTC),
                    "updated_at": datetime.now(UTC),
                }
            },
        )
        return True
    except Exception as e:
        print(f"Error resetting credits for user {user_id}: {str(e)}")
        return False


def deduct_credits(user_id: str, operation: str) -> tuple[bool, Optional[str]]:
    """
    Deduct credits for an operation.
    Returns (success, error_message)
    """
    try:
        cost = OPERATION_COSTS.get(operation, 1)
        user = Users.find_one({"id": user_id})
        plan = user.get("subscription_plan", "free")

        if not user:
            return False, "User not found"

        current_credits = user.get("credits", 0)

        if current_credits + cost > PLAN_CREDITS.get(plan, 0):
            return False, "Insufficient credits"

        Users.update_one(
            {"id": user_id},
            {"$inc": {"credits": cost}, "$set": {"updated_at": datetime.now(UTC)}},
        )

        return True, None
    except Exception as e:
        return False, str(e)


async def get_user_credits(user_id: str) -> Optional[int]:
    """Get the current credit balance for a user."""
    try:
        user = Users.find_one({"id": user_id})
        return user.get("credits", 0) if user else None
    except Exception:
        return None


async def update_user_plan(
    user_id: str, tier: str, is_yearly: bool
) -> tuple[bool, Optional[str]]:
    """
    Update a user's plan and reset their credits.
    Returns (success, error_message)
    """
    try:
        now = datetime.now(UTC)

        # Update user's subscription plan and related fields
        result = Users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "subscription_plan": tier,
                    "credits": PLAN_CREDITS[tier],
                    "is_yearly": is_yearly,
                    "last_credits_reset": now,
                    "updated_at": now,
                }
            },
        )

        if result.modified_count == 0:
            return False, "User not found"

        return True, None

    except Exception as e:
        return False, str(e)
