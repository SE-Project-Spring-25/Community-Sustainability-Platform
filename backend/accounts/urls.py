from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, CustomTokenObtainPairView

urlpatterns = [
    # Registration endpoint
    path('register/', RegisterView.as_view(), name='register'),
    # Obtain JWT token endpoint
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Refresh JWT token endpoint
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
