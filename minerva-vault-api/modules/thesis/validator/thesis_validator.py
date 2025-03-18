from rest_framework import serializers

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