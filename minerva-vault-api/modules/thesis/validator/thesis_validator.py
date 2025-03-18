from rest_framework import serializers


class GetThesisValidator(serializers.Serializer):
    thesis_id = serializers.UUIDField(
        required=True,
        error_messages={
            'required': 'O ID da tese é obrigatório',
            'invalid': 'O ID da tese deve ser um UUID válido'
        }
    )
class CreateThesisValidator(serializers.Serializer):
    title = serializers.CharField(
        required=True,
        allow_blank=False,
        min_length=1,
        max_length=255,
        error_messages={
            'blank': 'O título não pode estar em branco',
            'min_length': 'O título deve ter pelo menos 1 caractere',
            'max_length': 'O título deve ter no máximo 150 caracteres'
        }
    )
    
    author_id =serializers.UUIDField(
        required=True,
        error_messages={
            'required': 'O autor é obrigatório',
            'invalid': 'O autor deve ser um UUID válido'
        }
    )
    
    advisor_id = serializers.UUIDField(
        required=True,
        error_messages={
            'required': 'O orientador é obrigatório',
            'invalid': 'O orientador deve ser um UUID válido'
        }
    )
    
    co_advisor_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        error_messages={
            'invalid': 'O coorientador deve ser um UUID válido'
        }
    )
    
    abstract = serializers.CharField(
        required=True,
        allow_blank=False,
        min_length=1,
        error_messages={
            'blank': 'O resumo não pode estar em branco',
            'min_length': 'O resumo deve ter pelo menos 1 caractere'
        }
    )
    
    keywords = serializers.CharField(
        required=True,
        allow_blank=False,
        min_length=1,
        max_length=255,
        error_messages={
            'blank': 'As palavras-chave não podem estar em branco',
            'min_length': 'As palavras-chave devem ter pelo menos 1 caractere',
            'max_length': 'As palavras-chave devem ter no máximo 255 caracteres'
        }
    )
    
    defense_date = serializers.DateField(
        required=True,
        error_messages={
            'required': 'A data de defesa é obrigatória',
            'invalid': 'A data de defesa deve ser válida'
        }
    )
    
    pdf_file = serializers.FileField(
        required=True,
        error_messages={
            'required': 'O arquivo PDF é obrigatório',
            'invalid': 'O arquivo PDF deve ser válido'
        }
    )
    
    def validate_pdf_file(self, value):
        if not value.name.endswith('.pdf'):
            raise serializers.ValidationError('O arquivo deve ser um PDF')
        return value
    
class UpdateThesisValidator(serializers.Serializer):
    thesis_id = serializers.UUIDField( 
        required=True,
        error_messages={
            'required': 'O ID da tese é obrigatório',
            'invalid': 'O ID da tese deve ser um UUID válido'
        }
    )
    
    title = serializers.CharField(
        required=False,
        allow_blank=False,
        min_length=1,
        max_length=255,
        error_messages={
            'blank': 'O título não pode estar em branco',
            'min_length': 'O título deve ter pelo menos 1 caractere',
            'max_length': 'O título deve ter no máximo 150 caracteres'
        }
    )
    
    author_id = serializers.UUIDField(
        required=False,
        error_messages={
            'invalid': 'O autor deve ser um UUID válido'
        }
    )
    
    advisor_id = serializers.UUIDField(
        required=False,
        error_messages={
            'invalid': 'O orientador deve ser um UUID válido'
        }
    )
    
    co_advisor_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        error_messages={
            'invalid': 'O coorientador deve ser um UUID válido'
        }
    )
    
    abstract = serializers.CharField(
        required=False,
        allow_blank=False,
        min_length=1,
        error_messages={
            'blank': 'O resumo não pode estar em branco',
            'min_length': 'O resumo deve ter pelo menos 1 caractere'
        }
    )
    
    keywords = serializers.CharField(
        required=False,
        allow_blank=False,
        min_length=1,
        max_length=255,
        error_messages={
            'blank': 'As palavras-chave não podem estar em branco',
            'min_length': 'As palavras-chave devem ter pelo menos 1 caractere',
            'max_length': 'As palavras-chave devem ter no máximo 255 caracteres'
        }
    )
    
    defense_date = serializers.DateField(
        required=False,
        error_messages={
            'invalid': 'A data de defesa deve ser válida'
        }
    )
    
    pdf_file = serializers.FileField(
        required=False,
        error_messages={
            'invalid': 'O arquivo PDF deve ser válido'
        }
    )
    
    status = serializers.ChoiceField(
        required=False,
        choices=['PENDING', 'APPROVED', 'REJECTED'],
        error_messages={
            'invalid_choice': 'O status deve ser PENDING, APPROVED ou REJECTED'
        }
    )
    
    def validate_pdf_file(self, value):
        if value and not value.name.endswith('.pdf'):
            raise serializers.ValidationError(
                'O arquivo deve estar no formato PDF'
            )
        return value
    
    
class ListThesisValidator(serializers.Serializer):
    title = serializers.CharField(
        required=False,
        allow_blank=False,
        min_length=3,
        error_messages={
            'blank': 'O título não pode estar em branco',
            'min_length': 'O título deve ter pelo menos 3 caracteres'
        }
    )
    author_name = serializers.CharField(
        required=False,
        allow_blank=False,
        min_length=3,
        error_messages={
            'blank': 'O nome do autor não pode estar em branco',
            'min_length': 'O nome do autor deve ter pelo menos 3 caracteres'
        }
    )
    
    advisor_name = serializers.CharField(
        required=False,
        allow_blank=False,
        min_length=3,
        error_messages={
            'blank': 'O nome do orientador não pode estar em branco',
            'min_length': 'O nome do orientador deve ter pelo menos 3 caracteres'
        }
    )
    
    co_advisor_name = serializers.CharField(
        required=False,
        allow_blank=False,
        min_length=3,
        error_messages={
            'blank': 'O nome do coorientador não pode estar em branco',
            'min_length': 'O nome do coorientador deve ter pelo menos 3 caracteres'
        }
    )
    
    defense_date = serializers.DateField(
        required=False,
        error_messages={
            'invalid': 'A data de defesa deve ser válida'
        }
    )
    
    context = serializers.CharField(
        required=False,
        allow_blank=False,
        min_length=3,
        error_messages={
            'blank': 'O contexto não pode estar em branco',
            'min_length': 'O contexto deve ter pelo menos 3 caracteres'
        }
    )
    
    order_by = serializers.ChoiceField(
        required=False,
        choices=[
            'BYAUTHORDESC',
            'BYAUTHORASC',
            'BYADVISERDESC',
            'BYADVISERASC',
            'BYDEFENSEDATEDESC',
            'BYDEFENSEDATEASC',
            'BYTITLEASC',
            'BYTITLEDESC'
        ]
    )
    page = serializers.IntegerField(
        required=False,
        min_value=1,
        default=1,
    )