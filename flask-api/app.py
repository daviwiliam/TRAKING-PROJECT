from flask import Flask, request, jsonify
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Configuração de autenticação
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SPREADSHEET_ID = '1AHlvd83HouKAoNV1eN_iQNizcj1ochInLOcEwPizLH0'
CREDENTIALS_FILE = 'credentials.json'


# Função para obter credenciais da conta de serviço
def get_credentials():
    try:
        # Carrega as credenciais da conta de serviço do arquivo JSON
        credentials = Credentials.from_service_account_file(
            CREDENTIALS_FILE, scopes=SCOPES
        )
        return credentials
    except Exception as e:
        raise RuntimeError(f"Erro ao carregar credenciais: {e}")


# Conecta ao Google Sheets
def get_sheets_service():
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)
    return service

# Endpoint para ler os dados da planilha
@app.route('/eventos/', methods=['GET'])
def ler_eventos():
    try:
        # Conectar ao serviço Sheets
        service = get_sheets_service()
        
        # Ler os dados da planilha
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range="Página1!A:B"
        ).execute()
        
        # Extrair os dados
        values = result.get('values', [])
        
        if not values:
            return jsonify({'status': 'erro', 'mensagem': 'Nenhum dado encontrado'}), 404

        # Resposta com os dados lidos
        eventos = []
        for row in values:
            evento = {'nome': row[0], 'acao': row[1] if len(row) > 1 else ""}
            eventos.append(evento)

        return jsonify({'status': 'sucesso', 'eventos': eventos})
    
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500

# Endpoint para postar dados na planilha
@app.route('/eventos/', methods=['POST'])
def registrar_evento():
    dados = request.json
    
    # Validação dos dados
    if 'nome' not in dados or 'acao' not in dados:
        return jsonify({'status': 'erro', 'mensagem': 'Dados incompletos!'}), 400

    body = {
        'values': [[dados['nome'], dados['acao']]]
    }

    try:
        # Conectar ao serviço Sheets
        service = get_sheets_service()
        service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range='Página1!A:B',
            valueInputOption='RAW',
            body=body
        ).execute()

        return jsonify({'status': 'sucesso'})
    except Exception as e:
        return jsonify({'status': 'erro', 'mensagem': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
