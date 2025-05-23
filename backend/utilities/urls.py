from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TransportationEmissionViewSet,
    HouseholdEnergyViewSet,
    FoodConsumptionViewSet,
    TotalCarbonFootprintViewSet, UtilitiesStatsAPIView, RedemptionViewSet, WalletView, LeaderboardAPIView,
)

router = DefaultRouter()
router.register(r'transportation-emissions', TransportationEmissionViewSet, basename='transportation-emissions')
router.register(r'household-energy', HouseholdEnergyViewSet, basename='household-energy')
router.register(r'food-consumption', FoodConsumptionViewSet, basename='food-consumption')
router.register(r'total-carbon-footprint', TotalCarbonFootprintViewSet, basename='total-carbon-footprint')
router.register(r'redemptions', RedemptionViewSet, basename='redemptions')
urlpatterns = [
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('leaderboard/', LeaderboardAPIView.as_view(), name='leaderboard'),
    path('stats/', UtilitiesStatsAPIView.as_view(), name='utilities-stats'),
    path('', include(router.urls)),
]
