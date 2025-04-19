from rest_framework import serializers

from .models import (
    TransportationEmission,
    HouseholdEnergy,
    FoodConsumption,
    TotalCarbonFootprint
)


class TransportationEmissionSerializer(serializers.ModelSerializer):
    emissions = serializers.FloatField(read_only=True)

    class Meta:
        model = TransportationEmission
        fields = ['id', 'user', 'date', 'distance', 'mode', 'emissions']
        extra_kwargs = {'user': {'read_only': True}}


class HouseholdEnergySerializer(serializers.ModelSerializer):
    emissions = serializers.FloatField(read_only=True)

    class Meta:
        model = HouseholdEnergy
        fields = ['id', 'user', 'date', 'energy_usage', 'grid_emission_factor', 'emissions']
        extra_kwargs = {'user': {'read_only': True}}


class FoodConsumptionSerializer(serializers.ModelSerializer):
    emissions = serializers.FloatField(read_only=True)

    class Meta:
        model = FoodConsumption
        fields = ['id', 'user', 'date', 'servings', 'food_type', 'emissions']
        extra_kwargs = {'user': {'read_only': True}}


class TotalCarbonFootprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = TotalCarbonFootprint
        fields = [
            'id',
            'user',
            'period_start',
            'period_end',
            'transportation_emissions',
            'energy_emissions',
            'food_emissions',
            'total_emissions',
            'computed_on'
        ]
        extra_kwargs = {
            'user': {'read_only': True},
            'transportation_emissions': {'read_only': True},
            'energy_emissions': {'read_only': True},
            'food_emissions': {'read_only': True},
            'total_emissions': {'read_only': True},
            'computed_on': {'read_only': True},
        }
