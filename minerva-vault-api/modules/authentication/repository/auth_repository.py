from django.contrib.auth import authenticate   

class AuthRepository:
    def authenticate_user(self, username: str, password: str):
        return authenticate(username=username, password=password)
    