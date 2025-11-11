from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from subscriptions.permissions import EsSuscriptorActivo
from .chatbot_service import ChatbotService


class ChatBotView(APIView):
    """
    POST /api/chatbot/chat/
    Procesa mensajes del usuario y devuelve respuestas del asistente IA
    """
    permission_classes = [permissions.IsAuthenticated, EsSuscriptorActivo]

    def post(self, request):
        """
        Espera: {"message": "texto del usuario"}
        Retorna: {"response": "respuesta del bot", "movies": [lista de películas] o null}
        """
        message = request.data.get('message', '').strip()

        if not message:
            return Response(
                {'error': 'El mensaje no puede estar vacío'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Inicializar el servicio de chatbot
            chatbot = ChatbotService()

            # Generar respuesta usando Gemini con contexto de películas
            result = chatbot.generate_response(message)

            return Response({
                'response': result['response'],
                'movies': result['movies']
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Error al procesar la solicitud: {str(e)}',
                'response': 'Lo siento, tuve un problema técnico. Por favor intenta de nuevo.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
