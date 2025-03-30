from rest_framework import serializers

def validate_password_rules(password: str) -> str:
    if password.isdigit():
        raise serializers.ValidationError('A senha não pode conter apenas números')

    if not any(char in "!@#$%^&*(),.?\":{}|" for char in password):
        raise serializers.ValidationError('A senha deve conter pelo menos um caracter especial')

    if not any(char.isdigit() for char in password):
        raise serializers.ValidationError('A senha deve conter pelo menos um número')

    if not any(char.isupper() for char in password):
        raise serializers.ValidationError('A senha deve conter pelo menos uma letra maiúscula')

    if not any(char.islower() for char in password):
        raise serializers.ValidationError('A senha deve conter pelo menos uma letra minúscula')

    return password
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
    avatar = serializers.ImageField(
        required=False,
        allow_null=True,
        allow_empty_file=False,
        error_messages={
            'invalid': 'O avatar deve ser uma imagem válida'
        }
    )
    
    
    remove_avatar = serializers.BooleanField(required=False)
    
    def validate_avatar(self, value):
        if value == 'null' or value == '':
            return None
        
        if value and not value == 'null':
            if not hasattr(value, 'content_type') or not value.content_type.startswith('image/'):
                raise serializers.ValidationError('O arquivo deve ser uma imagem válida')
        return value  
    
class ChangePasswordValidator(serializers.Serializer):
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
    
    password_confirmation = serializers.CharField(
        required=True,
        min_length=8,
        error_messages={
            'required': 'A nova senha é obrigatória',
            'min_length': 'A senha deve ter pelo menos 8 caracteres'
        }
    ) 
    
    def validate_new_password(self, value):
        return validate_password_rules(value)
    
    def validate_password_confirmation(self, value):
        return validate_password_rules(value)
    
    
class CreateUserValidator(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        allow_blank=False,
        min_length=3,
        max_length=150,
        error_messages={
            'required': 'O nome de usuário é obrigatório',
            'blank': 'O nome de usuário não pode estar em branco',
            'min_length': 'O nome de usuário deve ter pelo menos 3 caracteres',
            'max_length': 'O nome de usuário deve ter no máximo 150 caracteres'
        }
    )
    
    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'O email é obrigatório',
            'invalid': 'O email deve ser válido'
        }
    )
    
    password = serializers.CharField(
        required=True,
        min_length=8,
        error_messages={
            'required': 'A senha é obrigatória',
            'min_length': 'A senha deve ter pelo menos 8 caracteres'
        }
    )
    
    password_confirmation = serializers.CharField(
        required=True,
        error_messages={
            'required': 'A confirmação de senha é obrigatória'
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
    
    role_id = serializers.UUIDField(
        required=True,
        error_messages={
            'required': 'O id da role é obrigatório',
            'invalid': 'O id da role deve ser um UUID válido'
        }
    )
    
    avatar = serializers.ImageField(
        required=False,
        allow_empty_file = False,
        error_messages={
            'invalid': 'O avatar deve ser uma imagem'
        }
    )
    
    def validate_password(self, value):
        return validate_password_rules(value)
    
    def validate_password_confirmation(self, value):
        return validate_password_rules(value)
    
class ListUsersValidator(serializers.Serializer):
    role_id = serializers.UUIDField(
        required=True,
        error_messages={
            'required': 'O id da role é obrigatório',
            'invalid': 'O id da role deve ser um UUID válido'
        }
    )