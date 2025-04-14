from datetime import datetime, timedelta
from src.models.user import Users
from src.utils.credits import reset_user_credits
from pytz import UTC


async def reset_monthly_credits():
    """Reset credits for all users if it's been a month since their last reset."""
    try:
        # find users whose credits need to be reset
        month_ago = datetime.now(UTC) - timedelta(days=30)
        users_to_reset = Users.find(
            {
                "$or": [
                    {"last_credits_reset": {"$lt": month_ago}},
                    {"last_credits_reset": None},
                ]
            }
        )

        for user in users_to_reset:
            await reset_user_credits(user["id"])

    except Exception as e:
        print(f"Error in monthly credit reset: {str(e)}")
