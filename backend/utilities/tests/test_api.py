import calendar
from datetime import date

from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from utilities.models import TransportationEmission, HouseholdEnergy, FoodConsumption


def get_last_month_range():
    today = date.today()
    if today.month == 1:
        year, month = today.year - 1, 12
    else:
        year, month = today.year, today.month - 1
    start = date(year, month, 1)
    end = date(year, month, calendar.monthrange(year, month)[1])
    return start, end


@override_settings(USE_TZ=False)
class UtilitiesAPITest(APITestCase):
    def setUp(self):
        # create and authenticate user (email is required by CustomUserManager)
        self.user = CustomUser.objects.create_user(
            email="tester@example.com",
            password="pass"
        )
        self.client.force_authenticate(user=self.user)

        self.transport_url = "/api/utilities/transportation-emissions/"
        self.energy_url = "/api/utilities/household-energy/"
        self.food_url = "/api/utilities/food-consumption/"
        self.total_url = "/api/utilities/total-carbon-footprint/"
        self.stats_url = "/api/utilities/stats/"

    def test_create_transportation_emission(self):
        data = {
            "date": "2025-04-01",
            "distance": 10.0,
            "mode": "car"
        }
        resp = self.client.post(self.transport_url, data, format="json")
        self.assertEqual(resp.status_code, 201)
        # emissions = 10 miles × 1.60934 × 0.2
        expected = 10 * 1.60934 * 0.2
        self.assertAlmostEqual(resp.data["emissions"], expected, places=5)

    def test_create_household_energy(self):
        data = {
            "date": "2025-04-01",
            "energy_usage": 25.0
        }
        resp = self.client.post(self.energy_url, data, format="json")
        self.assertEqual(resp.status_code, 201)
        # emissions = 25 kWh × 0.4
        self.assertAlmostEqual(resp.data["emissions"], 25 * 0.4, places=5)

    def test_create_food_consumption(self):
        data = {
            "date": "2025-04-01",
            "servings": 3,
            "food_type": "meat"
        }
        resp = self.client.post(self.food_url, data, format="json")
        self.assertEqual(resp.status_code, 201)
        # emissions = 3 servings × 2.0
        self.assertAlmostEqual(resp.data["emissions"], 6.0, places=5)

    def test_total_carbon_footprint_creation(self):
        # create records in March 2025
        TransportationEmission.objects.create(user=self.user, date=date(2025, 3, 5), distance=5, mode="bus")
        HouseholdEnergy.objects.create(user=self.user, date=date(2025, 3, 5), energy_usage=10)
        FoodConsumption.objects.create(user=self.user, date=date(2025, 3, 5), servings=2, food_type="plant")

        payload = {
            "period_start": "2025-03-01",
            "period_end": "2025-03-31"
        }
        resp = self.client.post(self.total_url, payload, format="json")
        self.assertEqual(resp.status_code, 201)

        # compute expected sum
        t = 5 * 1.60934 * 0.1  # bus factor = 0.1
        e = 10 * 0.4
        f = 2 * 0.5  # plant factor = 0.5
        expected_total = t + e + f
        self.assertAlmostEqual(resp.data["total_emissions"], expected_total, places=5)

    def test_stats_endpoint(self):
        # create exactly one record of each type for last month
        start, end = get_last_month_range()
        te = TransportationEmission.objects.create(user=self.user, date=start, distance=2, mode="bus")
        he = HouseholdEnergy.objects.create(user=self.user, date=start, energy_usage=5)
        fc = FoodConsumption.objects.create(user=self.user, date=start, servings=3, food_type="plant")

        resp = self.client.get(self.stats_url, format="json")
        self.assertEqual(resp.status_code, 200)
        data = resp.data

        # check resourceConsumption sums
        self.assertAlmostEqual(data["resourceConsumption"]["Transportation Emission"], te.emissions, places=5)
        self.assertAlmostEqual(data["resourceConsumption"]["Household Energy"], he.emissions, places=5)
        self.assertAlmostEqual(data["resourceConsumption"]["Food Consumption"], fc.emissions, places=5)

        # check labels and monthlyEmissions length
        self.assertEqual(len(data["labels"]), 12)
        self.assertEqual(len(data["monthlyEmissions"]), 12)
