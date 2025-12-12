import json
import time

# Carrega fluxo
with open("fluxo_saude.json", "r", encoding="utf-8") as f:
    FLUXO = json.load(f)

# Dados do vendedor (substitua com dados reais da sua beta tester)
VENDEDOR = {
    "nome": "Joana",
    "anos_experiencia": 10,
    "bio": "Especialista em planos para famílias, com foco em transparência e atendimento humanizado"
}

# Estado da conversa
estado = {
    "etapa_atual": "inicio",
    "respostas": {}
}

def mostrar_etapa(etapa_id):
    etapa = next(e for e in FLUXO["etapas"] if e["id"] == etapa_id)
    
    if etapa["tipo"] == "mensagem":
        msg = etapa["conteudo"].replace("{{nome_vendedor}}", VENDEDOR["nome"])
        print(f"\n🤖 Assistente: {msg}")
        return etapa["proxima"]
    
    elif etapa["tipo"] == "escolha":
        print(f"\n🤖 {etapa['pergunta']}")
        for i, op in enumerate(etapa["opcoes"], 1):
            print(f"{i}. {op['rotulo']}")
        return etapa["id"]  # permanece na mesma etapa até escolher
    
    elif etapa["tipo"] == "executar" and etapa["acao"] == "gerar_resposta_ia":
        # Simula chamada à IA (substitua depois por Groq)
        print("\n🤖 Gerando recomendação personalizada...")
        time.sleep(1.2)
        
        # Substituições para o prompt
        perfil_val = estado["respostas"].get("perfil", "")
        perfil_map = {
            "individual": "individual",
            "casal": "casal",
            "familia": "família",
            "corporativo": "empresa"
        }
        copart_map = {
            "sim": "quer coparticipação (valor mais baixo)",
            "nao": "não quer coparticipação (tudo incluso)"
        }
        
        resposta_simulada = (
            f"Ótimo! Para {perfil_map.get(perfil_val, 'você')}, recomendo:\n"
            "• Unimed Família Plus: rede ampla, cobertura nacional e sem carência para emergência.\n"
            "• SulAmérica Light: plano mais econômico, com acomodação em quarto privativo.\n\n"
            f"Quer que eu mostre um comparativo em imagem ou agendar uma call com {VENDEDOR['nome']}?"
        )
        print(f"\n🤖 {resposta_simulada}")
        return etapa["proxima"]
    
    return None

def executar_fluxo():
    print("🚀 Iniciando simulador HealthBot (modo offline)")
    print("Digite 'sair' a qualquer momento.\n")
    
    while estado["etapa_atual"]:
        proxima = mostrar_etapa(estado["etapa_atual"])
        
        if proxima != estado["etapa_atual"]:  # avança etapa
            estado["etapa_atual"] = proxima
            continue
        
        # Aguarda entrada do usuário
        entrada = input("\n💬 Você: ").strip()
        
        if entrada.lower() in ["sair", "exit"]:
            print("Até logo! 👋")
            break
        
        # Processa escolha numérica
        etapa_atual = next(e for e in FLUXO["etapas"] if e["id"] == estado["etapa_atual"])
        if etapa_atual["tipo"] == "escolha":
            try:
                idx = int(entrada) - 1
                if 0 <= idx < len(etapa_atual["opcoes"]):
                    escolha = etapa_atual["opcoes"][idx]
                    estado["respostas"][etapa_atual["id"]] = escolha["valor"]
                    print(f"✅ Selecionado: {escolha['rotulo']}")
                    estado["etapa_atual"] = etapa_atual["proxima"]
                else:
                    print("⚠️  Opção inválida. Escolha um número da lista.")
            except ValueError:
                print("⚠️  Digite o número da opção (ex: 1, 2, 3).")

if __name__ == "__main__":
    executar_fluxo()