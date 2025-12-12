from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import logging
from datetime import datetime
from pathlib import Path

# Configuração
app = FastAPI(title="HealthBot — Webhook Mock", debug=True)
DB_PATH = Path("data/db.json")
FLUXO_PATH = Path("fluxo_saude.json")

# Modelo de entrada (simula payload do Weni/WhatsApp)
class MensagemWebhook(BaseModel):
    from_whatsapp: str  # ex: "5511999999999"
    profile_name: str   # ex: "Carlos"
    text: str           # ex: "1" ou "sim"
    timestamp: int = int(datetime.now().timestamp())

# Carrega ou inicializa DB
def carregar_db():
    if not DB_PATH.exists():
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        DB_PATH.write_text(json.dumps({"leads": []}, indent=2))
    return json.loads(DB_PATH.read_text())

def salvar_db(data):
    DB_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))

@app.post("/webhook")
async def receber_mensagem(msg: MensagemWebhook):
    leads = carregar_db()["leads"]
    
    # Busca lead existente
    lead = next((l for l in leads if l["whatsapp"] == msg.from_whatsapp), None)
    
    if not lead:
        # Novo lead
        lead = {
            "id": f"lead_{int(msg.timestamp)}",
            "whatsapp": msg.from_whatsapp,
            "nome": msg.profile_name,
            "vendedor_id": "joana_001",  # fixo por enquanto
            "etapa_atual": "inicio",
            "respostas": {},
            "historico": [],
            "criado_em": msg.timestamp
        }
        leads.append(lead)
        salvar_db({"leads": leads})
        print(f"✅ Novo lead: {msg.profile_name} ({msg.from_whatsapp})")
    
    # Registra mensagem
    lead["historico"].append({
        "tipo": "entrada",
        "conteudo": msg.text,
        "timestamp": msg.timestamp
    })
    
    # Carrega fluxo
    with open(FLUXO_PATH, "r", encoding="utf-8") as f:
        fluxo = json.load(f)
    
    # Encontra etapa atual
    etapa = next((e for e in fluxo["etapas"] if e["id"] == lead["etapa_atual"]), None)
    if not etapa:
        raise HTTPException(400, "Etapa inválida")
    
    # Processa resposta (só para etapas de escolha)
    if etapa["tipo"] == "escolha":
        try:
            idx = int(msg.text) - 1
            if 0 <= idx < len(etapa["opcoes"]):
                escolha = etapa["opcoes"][idx]
                lead["respostas"][etapa["id"]] = escolha["valor"]
                lead["etapa_atual"] = etapa["proxima"]
                print(f"   → Resposta salva: {etapa['id']} = {escolha['valor']}")
            else:
                raise ValueError("Opção fora do intervalo")
        except (ValueError, IndexError):
            return {"status": "erro", "mensagem": "Opção inválida"}
    
    # Se chegou na etapa 'resultado', dispara IA
    if lead["etapa_atual"] == "resultado":
        from scripts.gerar_resposta import gerar_resposta_com_ia
        resposta_ia = gerar_resposta_com_ia(lead)
        lead["historico"].append({
            "tipo": "saida",
            "conteudo": resposta_ia,
            "timestamp": int(datetime.now().timestamp())
        })
        lead["etapa_atual"] = "final"
    
    salvar_db({"leads": leads})
    
    # Simula resposta do bot (em produção, isso seria enviado via WhatsApp API)
    resposta_simulada = "Mensagem processada com sucesso."
    if lead["etapa_atual"] != "resultado":
        resposta_simulada = "[Resposta do bot seria enviada aqui]"
    
    return {
        "status": "ok",
        "lead_id": lead["id"],
        "etapa_atual": lead["etapa_atual"],
        "resposta_simulada": resposta_simulada
    }

@app.get("/leads")
async def listar_leads():
    return carregar_db()

if __name__ == "__main__":
    import uvicorn
    print("🚀 Webhook mock rodando em http://localhost:8000")
    print("   POST /webhook   → receber mensagem")
    print("   GET  /leads      → ver todos os leads")
    uvicorn.run(app, host="127.0.0.1", port=8000)