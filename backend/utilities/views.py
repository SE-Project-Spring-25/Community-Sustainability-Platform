from rest_framework import viewsets, permissions

from .models import (
    TransportationEmission,
    HouseholdEnergy,
    FoodConsumption,
    TotalCarbonFootprint
)
from .serializers import (
    TransportationEmissionSerializer,
    HouseholdEnergySerializer,
    FoodConsumptionSerializer,
    TotalCarbonFootprintSerializer
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
