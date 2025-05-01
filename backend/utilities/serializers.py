from rest_framework import serializers

from .models import (
    TransportationEmission,
    HouseholdEnergy,
    FoodConsumption,
    TotalCarbonFootprint, PointTransaction, Wallet, Redemption
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


class PointTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointTransaction
        fields = ['id', 'amount', 'description', 'timestamp']


class WalletSerializer(serializers.ModelSerializer):
    transactions = PointTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = ['points', 'updated_on', 'transactions']


class RedemptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Redemption
        fields = ['id', 'points_redeemed', 'reward_description', 'redeemed_on']
        read_only_fields = ['redeemed_on']

    def validate_points_redeemed(self, value):
        user = self.context['request'].user
        wallet = Wallet.objects.get(user=user)
        if value > wallet.points:
            raise serializers.ValidationError("Insufficient points")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        wallet = Wallet.objects.get(user=user)
        wallet.points -= validated_data['points_redeemed']
        wallet.save()
        redemption = Redemption.objects.create(
            wallet=wallet,
            **validated_data
        )
        # Record the spending transaction
        PointTransaction.objects.create(
            wallet=wallet,
            amount=-validated_data['points_redeemed'],
            description=f"Redeemed for: {validated_data['reward_description']}"
        )
        return redemption
