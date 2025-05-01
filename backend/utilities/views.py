import calendar
from datetime import date

from dateutil.relativedelta import relativedelta
from django.db.models import F
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    TransportationEmission,
    HouseholdEnergy,
    FoodConsumption,
    TotalCarbonFootprint, Wallet, Redemption
)
from .serializers import (
    TransportationEmissionSerializer,
    HouseholdEnergySerializer,
    FoodConsumptionSerializer,
    TotalCarbonFootprintSerializer, RedemptionSerializer, WalletSerializer
)
from .utils import get_total_carbon_footprint


class TransportationEmissionViewSet(viewsets.ModelViewSet):
    serializer_class = TransportationEmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TransportationEmission.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HouseholdEnergyViewSet(viewsets.ModelViewSet):
    serializer_class = HouseholdEnergySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HouseholdEnergy.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FoodConsumptionViewSet(viewsets.ModelViewSet):
    serializer_class = FoodConsumptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FoodConsumption.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TotalCarbonFootprintViewSet(viewsets.ModelViewSet):
    """
    When creating a TotalCarbonFootprint record, the only input required is the period_start and period_end.
    The view computes the emissions breakdown from TransportationEmission, HouseholdEnergy, and FoodConsumption models.
    """
    serializer_class = TotalCarbonFootprintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TotalCarbonFootprint.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        period_start = serializer.validated_data['period_start']
        period_end = serializer.validated_data['period_end']
        total, total_transport, total_energy, total_food = get_total_carbon_footprint(
            self.request.user, period_start, period_end
        )
        serializer.save(
            user=self.request.user,
            total_emissions=total,
            transportation_emissions=total_transport,
            energy_emissions=total_energy,
            food_emissions=total_food,
        )


class UtilitiesStatsAPIView(APIView):
    """
    Returns aggregated utilities statistics:
      - resourceConsumption: aggregated emissions in the last month
        for Household Energy, Food Consumption, and Transportation Emission.
      - monthlyEmissions: total carbon emissions per month for the past 12 months.
      - labels: month abbreviation labels corresponding to monthlyEmissions.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get today's date.
        today = date.today()

        # Calculate last month's date range.
        if today.month == 1:
            last_month_year = today.year - 1
            last_month = 12
        else:
            last_month_year = today.year
            last_month = today.month - 1

        start_last_month = date(last_month_year, last_month, 1)
        last_day = calendar.monthrange(last_month_year, last_month)[1]
        end_last_month = date(last_month_year, last_month, last_day)

        # Aggregate resource consumption for the last month.
        household_records = HouseholdEnergy.objects.filter(date__range=(start_last_month, end_last_month))
        food_records = FoodConsumption.objects.filter(date__range=(start_last_month, end_last_month))
        transportation_records = TransportationEmission.objects.filter(date__range=(start_last_month, end_last_month))

        household_total = sum(record.emissions for record in household_records)
        food_total = sum(record.emissions for record in food_records)
        transportation_total = sum(record.emissions for record in transportation_records)

        resourceConsumption = {
            "Household Energy": household_total,
            "Food Consumption": food_total,
            "Transportation Emission": transportation_total,
        }

        # Calculate monthly emissions for the past 12 months.
        monthlyEmissions = []
        labels = []
        # Start at the first day of the current month.
        current_month_date = date(today.year, today.month, 1)
        for i in range(12):
            month_start = current_month_date - relativedelta(months=i)
            # End of the month:
            last_day_of_month = calendar.monthrange(month_start.year, month_start.month)[1]
            month_end = date(month_start.year, month_start.month, last_day_of_month)

            hm = HouseholdEnergy.objects.filter(date__range=(month_start, month_end))
            fc = FoodConsumption.objects.filter(date__range=(month_start, month_end))
            te = TransportationEmission.objects.filter(date__range=(month_start, month_end))

            month_total = (
                    sum(obj.emissions for obj in hm) +
                    sum(obj.emissions for obj in fc) +
                    sum(obj.emissions for obj in te)
            )
            monthlyEmissions.append(month_total)
            # Use calendar.month_abbr for month abbreviation, e.g., "Jan", "Feb", etc.
            labels.append(calendar.month_abbr[month_start.month])

        # Reverse lists so that data is in chronological order (oldest to newest).
        monthlyEmissions.reverse()
        labels.reverse()

        data = {
            "resourceConsumption": resourceConsumption,
            "monthlyEmissions": monthlyEmissions,
            "labels": labels,
        }
        return Response(data)


class WalletView(APIView):
    """
    GET current user's wallet (balance + transactions)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        data = WalletSerializer(wallet).data
        return Response(data)


class RedemptionViewSet(viewsets.ModelViewSet):
    """
    POST to redeem points, GET to list a user's redemptions.
    """
    serializer_class = RedemptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        wallet, _ = Wallet.objects.get_or_create(user=self.request.user)
        return Redemption.objects.filter(wallet=wallet)

    def perform_create(self, serializer):
        serializer.save()


class LeaderboardAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Top 10 wallets ordered by descending points
        top_wallets = Wallet.objects.select_related('user') \
                          .order_by(F('points').desc())[:10]
        top10 = [
            {'name': w.user.first_name, 'points': w.points}
            for w in top_wallets
        ]

        # Current user's wallet (create if missing)
        wallet, _ = Wallet.objects.get_or_create(user=request.user)

        # Compute current user's rank
        rank = Wallet.objects.filter(points__gt=wallet.points).count() + 1

        current_user = {
            'name': request.user.first_name,
            'points': wallet.points,
            'rank': rank
        }

        return Response({
            'top10': top10,
            'currentUser': current_user
        })
