# views.py in your 'data' app
import boto3
from rest_framework import generics
import logging
from .models import BranchData
from .serializers import BranchDataSerializer
import os
import requests
from django.conf import settings
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def generate_presigned_url(request, branch_code):
    s3_client = boto3.client('s3',
                             aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                             aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                             region_name=settings.AWS_S3_REGION_NAME)
    # Construct the key for the S3 object
    object_key = f'models/{branch_code}/{branch_code}.glb'
    print("Object Key for S3:", object_key)  # Logging the object key

    presigned_url = s3_client.generate_presigned_url('get_object', Params={
        'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
        'Key': object_key}, ExpiresIn=900)
    print("Generated Presigned URL:", presigned_url)  # Logging the presigned URL
    return JsonResponse({'url': presigned_url})

def mapbox_proxy(request):
    endpoint = request.GET.get('endpoint')
    query = request.GET.get('query')
    mapbox_url = f"https://api.mapbox.com/{endpoint}/{query}.json"
    mapbox_params = {
        'access_token': os.getenv('MAPBOX_API_KEY'),
        'limit': '1'
    }
    
    response = requests.get(mapbox_url, params=mapbox_params)
    data = response.json()  # Get the JSON data from the response

    # Log the data
    logger.debug("Mapbox API response data: %s", data)

    return JsonResponse(data)

class BranchDataList(generics.ListCreateAPIView):
    queryset = BranchData.objects.all()
    serializer_class = BranchDataSerializer

class BranchDataDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = BranchData.objects.all()
    serializer_class = BranchDataSerializer
    lookup_field = 'code'  # Using 'code' as the lookup field instead of the default 'id'


