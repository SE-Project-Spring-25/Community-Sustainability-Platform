from .models import TransportationEmission, HouseholdEnergy, FoodConsumption


def get_total_carbon_footprint(user, start_date, end_date):
    transport_records = TransportationEmission.objects.filter(user=user, date__range=(start_date, end_date))
    energy_records = HouseholdEnergy.objects.filter(user=user, date__range=(start_date, end_date))
    food_records = FoodConsumption.objects.filter(user=user, date__range=(start_date, end_date))

    total_transport = sum(record.emissions for record in transport_records)
    total_energy = sum(record.emissions for record in energy_records)
    total_food = sum(record.emissions for record in food_records)

    total = total_transport + total_energy + total_food
    return total, total_transport, total_energy, total_food
