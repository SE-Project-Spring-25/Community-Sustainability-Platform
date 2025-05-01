from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import CustomUser

User = settings.AUTH_USER_MODEL


class TransportationEmission(models.Model):
    TRANSPORT_MODES = (
        ('car', 'Car'),
        ('bus', 'Bus'),
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateField()  # User provides the date
    distance = models.FloatField(help_text="Distance traveled in miles")
    mode = models.CharField(max_length=10, choices=TRANSPORT_MODES)

    @property
    def mode_factor(self):
        if self.mode == 'car':
            return 0.2
        elif self.mode == 'bus':
            return 0.1
        return 0.0

    @property
    def emissions(self):
        """
        CO2 (kg) = (Distance in miles × 1.60934) × mode factor (kg CO2 per miles)
        """
        miles_distance = self.distance * 1.60934
        return miles_distance * self.mode_factor

    def __str__(self):
        return f"{self.user.username} - {self.get_mode_display()} - {self.distance} miles"


class HouseholdEnergy(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateField()  # User provides the date
    energy_usage = models.FloatField(help_text="Energy usage in kWh")
    grid_emission_factor = models.FloatField(default=0.4, help_text="kg CO2 per kWh")

    @property
    def emissions(self):
        """
        CO2 (kg) = Energy Usage (kWh) × Grid Emission Factor (kg CO2/kWh)
        """
        return self.energy_usage * self.grid_emission_factor

    def __str__(self):
        return f"{self.user.username} - {self.energy_usage} kWh"


class FoodConsumption(models.Model):
    FOOD_TYPES = (
        ('plant', 'Plant-based'),
        ('meat', 'Meat-based'),
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date = models.DateField()  # User provides the date
    servings = models.PositiveIntegerField(default=1)
    food_type = models.CharField(max_length=10, choices=FOOD_TYPES)

    @property
    def emission_factor(self):
        if self.food_type == 'plant':
            return 0.5
        elif self.food_type == 'meat':
            return 2.0
        return 0.0

    @property
    def emissions(self):
        """
        Daily Food Footprint = Servings × Emission Factor
        """
        return self.servings * self.emission_factor

    def __str__(self):
        return f"{self.user.username} - {self.get_food_type_display()} - {self.servings} servings"


class TotalCarbonFootprint(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    period_start = models.DateField(help_text="Start date of the period")
    period_end = models.DateField(help_text="End date of the period")
    total_emissions = models.FloatField(help_text="Total CO2 emissions for the period (kg)")
    transportation_emissions = models.FloatField(default=0, help_text="Total transportation emissions (kg CO2)")
    energy_emissions = models.FloatField(default=0, help_text="Total household energy emissions (kg CO2)")
    food_emissions = models.FloatField(default=0, help_text="Total food consumption emissions (kg CO2)")
    computed_on = models.DateTimeField(auto_now_add=True, help_text="Timestamp when this record was computed")

    def save(self, *args, **kwargs):
        # Here we assume that total_emissions is not provided by the user.
        # You could also check explicitly for None if 0 is a valid computed value.
        if self.total_emissions is None or self.total_emissions == 0:
            self.total_emissions = (
                    self.transportation_emissions +
                    self.energy_emissions +
                    self.food_emissions
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} footprint ({self.period_start} to {self.period_end}): {self.total_emissions} kg CO2"


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    points = models.PositiveIntegerField(default=0)
    updated_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} — {self.points} SP"


class PointTransaction(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    amount = models.IntegerField(help_text="Positive = earn, Negative = spend")
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)


class Redemption(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="redemptions")
    points_redeemed = models.PositiveIntegerField()
    reward_description = models.CharField(max_length=255)
    redeemed_on = models.DateTimeField(auto_now_add=True)


# Automatic points-awarding whenever a TotalCarbonFootprint record is created
@receiver(post_save, sender=TotalCarbonFootprint)
def award_points_for_carbon_reduction(sender, instance, created, **kwargs):
    if not created:
        return

    user = instance.user

    # Fetch the last 4 periods before this one to compute baseline
    prev_periods = TotalCarbonFootprint.objects.filter(
        user=user,
        period_end__lt=instance.period_start
    ).order_by('-period_start')[:4]

    if len(prev_periods) < 4:
        # Not enough history yet
        return

    baseline = sum(p.total_emissions for p in prev_periods) / 4
    reduction = baseline - instance.total_emissions
    if reduction <= 0:
        return

    # Points per kg: 10 SP/kg
    points = int(reduction * 10)

    wallet, _ = Wallet.objects.get_or_create(user=user)
    wallet.points += points
    wallet.save()

    PointTransaction.objects.create(
        wallet=wallet,
        amount=points,
        description=f"Weekly reduction reward: {points} SP for reducing {reduction:.2f} kg CO₂"
    )
