import calendar
from datetime import date

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from utilities.models import TotalCarbonFootprint
from utilities.utils import get_total_carbon_footprint

User = get_user_model()


class Command(BaseCommand):
    help = "Generate TotalCarbonFootprint for each user for the previous month"

    def handle(self, *args, **options):
        today = date.today()
        # Determine the previous month
        if today.month == 1:
            year, month = today.year - 1, 12
        else:
            year, month = today.year, today.month - 1

        start = date(year, month, 1)
        end = date(year, month, calendar.monthrange(year, month)[1])

        self.stdout.write(f"Generating footprints for {start} → {end}")

        for user in User.objects.filter(is_active=True):
            total, t, e, f = get_total_carbon_footprint(user, start, end)
            # Only create if there was data or you want zeros too
            TotalCarbonFootprint.objects.create(
                user=user,
                period_start=start,
                period_end=end,
                transportation_emissions=t,
                energy_emissions=e,
                food_emissions=f,
                total_emissions=total
            )
            self.stdout.write(f" • {user.email}: {total:.2f} kg CO₂")

        self.stdout.write(self.style.SUCCESS("Done."))
