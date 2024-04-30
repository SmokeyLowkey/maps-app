# views.py in your 'data' app

from rest_framework import generics
from .models import BranchData
from .serializers import BranchDataSerializer
import os
import requests
from django.http import JsonResponse

class BranchDataList(generics.ListCreateAPIView):
    queryset = BranchData.objects.all()
    serializer_class = BranchDataSerializer

class BranchDataDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = BranchData.objects.all()
    serializer_class = BranchDataSerializer
    lookup_field = 'code'  # Using 'code' as the lookup field instead of the default 'id'

# Django view for handling Mapbox API requests
def mapbox_proxy(request):
    # Extract query parameters from frontend request
    endpoint = request.GET.get('endpoint')  # e.g., 'geocoding/v5/mapbox.places'
    query = request.GET.get('query')  # e.g., the address to geocode

    mapbox_url = f"https://api.mapbox.com/{endpoint}/{query}.json"
    mapbox_params = {
        'access_token': os.getenv('MAPBOX_API_KEY'),
        'limit': '1'
    }

    response = requests.get(mapbox_url, params=mapbox_params)
    return JsonResponse(response.json())

