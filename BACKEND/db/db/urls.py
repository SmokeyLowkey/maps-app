from django.contrib import admin
from django.urls import path, include
from data.views import BranchDataList, BranchDataDetail, generate_presigned_url, mapbox_proxy

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('tinymce/', include('tinymce.urls')),
    path('branchdata/', BranchDataList.as_view(), name='branchdata-list-create'),
    path('branchdata/<str:code>/', BranchDataDetail.as_view(), name='branchdata-detail'),
    path('api/mapbox-proxy/', mapbox_proxy, name='mapbox_proxy'),
    path('api/get-signed-url/<str:branch_code>/', generate_presigned_url, name='generate-presigned-url'),
]
