# views.py in your 'data' app

from rest_framework import generics
from .models import BranchData
from .serializers import BranchDataSerializer

class BranchDataList(generics.ListCreateAPIView):
    queryset = BranchData.objects.all()
    serializer_class = BranchDataSerializer

class BranchDataDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = BranchData.objects.all()
    serializer_class = BranchDataSerializer
    lookup_field = 'code'  # Using 'code' as the lookup field instead of the default 'id'
