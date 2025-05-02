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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = date.today()

        # Last-month range
        if today.month == 1:
            lm_year, lm_month = today.year - 1, 12
        else:
            lm_year, lm_month = today.year, today.month - 1
        start_last = date(lm_year, lm_month, 1)
        end_last = date(lm_year, lm_month, calendar.monthrange(lm_year, lm_month)[1])

        # Only this user’s records
        household_records = HouseholdEnergy.objects.filter(user=request.user, date__range=(start_last, end_last))
        food_records = FoodConsumption.objects.filter(user=request.user, date__range=(start_last, end_last))
        transportation_records = TransportationEmission.objects.filter(user=request.user,
                                                                       date__range=(start_last, end_last))

        household_total = sum(r.emissions for r in household_records)
        food_total = sum(r.emissions for r in food_records)
        transportation_total = sum(r.emissions for r in transportation_records)

        resourceConsumption = {
            "Household Energy": household_total,
            "Food Consumption": food_total,
            "Transportation Emission": transportation_total,
        }

        # Past 12 months
        monthlyEmissions = []
        labels = []
        current_month = date(today.year, today.month, 1)
        for i in range(12):
            m_start = current_month - relativedelta(months=i)
            m_end = date(m_start.year, m_start.month, calendar.monthrange(m_start.year, m_start.month)[1])

            hm = HouseholdEnergy.objects.filter(user=request.user, date__range=(m_start, m_end))
            fc = FoodConsumption.objects.filter(user=request.user, date__range=(m_start, m_end))
            te = TransportationEmission.objects.filter(user=request.user, date__range=(m_start, m_end))

            monthlyEmissions.append(
                sum(o.emissions for o in hm) +
                sum(o.emissions for o in fc) +
                sum(o.emissions for o in te)
            )
            labels.append(calendar.month_abbr[m_start.month])

        monthlyEmissions.reverse()
        labels.reverse()

        return Response({
            "resourceConsumption": resourceConsumption,
            "monthlyEmissions": monthlyEmissions,
            "labels": labels,
        })


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
