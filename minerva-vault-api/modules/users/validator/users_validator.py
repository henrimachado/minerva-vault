from rest_framework import serializers

class UpdateUserValidator(serializers.Serializer):
    user_id = serializers.UUIDField(
        required=True, 
        error_messages={
            'required': 'O id do usuário é obrigatório',
            'invalid': 'O id do usuário deve ser um UUID válido'
        }
    )
    
    first_name = serializers.CharField(
        required=False,
        allow_blank=False,  
        min_length=1,       
        max_length=150,
        error_messages={
            'blank': 'O nome não pode estar em branco',
            'min_length': 'O nome deve ter pelo menos 1 caractere',
            'max_length': 'O nome deve ter no máximo 150 caracteres'
        }
    )
    last_name = serializers.CharField(
        required=False,
        allow_blank=False, 
        min_length=1,       
        max_length=150,
        error_messages={
            'blank': 'O sobrenome não pode estar em branco',
            'min_length': 'O sobrenome deve ter pelo menos 1 caractere',
            'max_length': 'O sobrenome deve ter no máximo 150 caracteres'
        }
    )
    is_active = serializers.BooleanField(
        required=False,
        error_messages={
            'invalid': 'O campo is_active deve ser um booleano'
        }
    )
    
class ChangePasswordValidator(serializers.Serializer):
    user_id = serializers.UUIDField(
        required=True, 
        error_messages={
            'required': 'O id do usuário é obrigatório',
            'invalid': 'O id do usuário deve ser um UUID válido'
        }
    )
    current_password = serializers.CharField(
        required=True,
        error_messages={
            'required': 'A senha atual é obrigatória'
        }
    )
    new_password = serializers.CharField(
        required=True,
        min_length=8,
        error_messages={
            'required': 'A nova senha é obrigatória',
            'min_length': 'A senha deve ter pelo menos 8 caracteres'
        }
    )
    
    def validate_new_password(self, value):
        if value.isdigit():
            raise serializers.ValidationError('A senha não pode conter apenas números')
        
        if not any (char in "!@#$%^&*(),.?\":{}|" for char in value):
            raise serializers.ValidationError('A senha deve conter pelo menos um caracter especial')
        
        if not any (char.isdigit() for char in value):
            raise serializers.ValidationError('A senha deve conter pelo menos um número')
        
        if not any (char.isupper() for char in value):
            raise serializers.ValidationError('A senha deve conter pelo menos uma letra maiúscula')
        
        if not any (char.islower() for char in value):
            raise serializers.ValidationError('A senha deve conter pelo menos uma letra minúscula')
        
        return value
    
