import os
import httpx
from jinja2 import Template
from pathlib import Path

# Carrega variáveis de ambiente (crie .env depois)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "gsk_xxx")  # Substitua ou use .env
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Dados fixos do vendedor (substitua depois por DB)
VENDEDOR = {
    "nome": "Joana",
    "anos_experiencia": 10,
    "bio": "Especialista em planos para famílias, com foco em transparência e atendimento humanizado"
}

def carregar_prompt() -> str:
    prompt_path = Path("prompts/gerar_resposta.txt")
    return prompt_path.read_text(encoding="utf-8")

def substituir_variaveis(prompt: str, lead: dict) -> str:
    # Mapeia respostas para descrições legíveis
    perfil_desc = {
        "individual": "individual",
        "casal": "casal",
        "familia": "família",
        "corporativo": "empresa"
    }
    idade_desc = {
        "ate_30": "até 30 anos",
        "31_45": "31 a 45 anos",
        "46_60": "46 a 60 anos",
        "acima_60": "acima de 60 anos"
    }
    copart_desc = {
        "sim": "quer coparticipação (valor mais baixo)",
        "nao": "não quer coparticipação (tudo incluso)"
    }
    
    dados = {
        "nome_vendedor": VENDEDOR["nome"],
        "anos_experiencia": VENDEDOR["anos_experiencia"],
        "bio": VENDEDOR["bio"],
        "perfil": lead["respostas"].get("perfil", ""),
        "perfil_descricao": perfil_desc.get(lead["respostas"].get("perfil"), "não informado"),
        "idade_descricao": idade_desc.get(lead["respostas"].get("idade"), "não informado"),
        "copart_descricao": copart_desc.get(lead["respostas"].get("coparticipacao"), "não informado")
    }
    
    template = Template(prompt)
    return template.render(**dados)

async def gerar_resposta_com_ia(lead: dict) -> str:
    try:
        prompt = carregar_prompt()
        prompt_final = substituir_variaveis(prompt, lead)
        
        print("📨 Enviando para Groq...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "messages": [{"role": "user", "content": prompt_final}],
                    "model": "llama-3.1-70b-versatile",
                    "temperature": 0.4,
                    "max_tokens": 250
                }
            )
        
        if response.status_code != 200:
            print(f"❌ Erro Groq: {response.status_code} - {response.text}")
            return "Desculpe, tive um probleminha técnico. A Joana vai te responder em breve!"
        
        data = response.json()
        resposta = data["choices"][0]["message"]["content"].strip()
        print("✅ Resposta gerada com sucesso.")
        return resposta
    
    except Exception as e:
        print(f"⚠️  Erro ao gerar resposta: {str(e)}")
        return "Estou analisando suas preferências... A Joana entrará em contato em breve!"

# Função de teste (execute diretamente)
if __name__ == "__main__":
    # Simula um lead
    lead_exemplo = {
        "respostas": {
            "perfil": "familia",
            "idade": "31_45",
            "coparticipacao": "nao"
        }
    }
    
    import asyncio
    resposta = asyncio.run(gerar_resposta_com_ia(lead_exemplo))
    print("\n📝 Resposta final:\n")
    print(resposta)