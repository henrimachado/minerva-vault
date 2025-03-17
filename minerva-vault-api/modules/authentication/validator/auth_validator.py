from rest_framework import serializers

class LoginValidator(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Username é obrigatório',
            'blank': 'Username não pode ser vazio',
        }
    )
    
    password = serializers.CharField(
        required=True,
        error_messages={
            'required': 'Password é obrigatório',
            'blank': 'Password não pode ser vazio',
        }
    )
    