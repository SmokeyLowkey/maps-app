from django.http import JsonResponse
from django.conf import settings

def token_authentication(get_response):
    def middleware(request):

         # Bypass token check for admin panel access
        if request.path.startswith('/admin'):
            return get_response(request)
        
        # Check for the 'Authorization' header in the request
        request_token = request.headers.get('Authorization')
        expected_token = settings.API_TOKEN  # Ensure API_TOKEN is defined in settings.py

        # If the token doesn't match, return an unauthorized response
        if request_token != expected_token:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        # Otherwise, continue processing the request
        response = get_response(request)
        return response

    return middleware