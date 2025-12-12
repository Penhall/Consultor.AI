from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import textwrap

def criar_comparativo(
    plano1: str = "Unimed Família Plus",
    vantagens1: list = ["Rede ampla", "Cobertura nacional", "Sem carência emergência"],
    plano2: str = "SulAmérica Light",
    vantagens2: list = ["Valor mais baixo", "Quarto privativo", "Atendimento 24h"],
    vendedor: str = "Joana"
):
    # Cria imagem branca
    largura, altura = 800, 600
    img = Image.new("RGB", (largura, altura), "white")
    draw = ImageDraw.Draw(img)
    
    # Fontes (use fontes do sistema ou baixe .ttf)
    try:
        font_titulo = ImageFont.truetype("arialbd.ttf", 28)
        font_texto = ImageFont.truetype("arial.ttf", 18)
        font_destaque = ImageFont.truetype("arialbd.ttf", 20)
    except:
        font_titulo = ImageFont.load_default()
        font_texto = ImageFont.load_default()
        font_destaque = ImageFont.load_default()
    
    # Título
    draw.text((40, 30), "📊 Comparativo Personalizado", fill="black", font=font_titulo)
    draw.text((40, 70), f"Preparado para você por {vendedor}", fill="#555", font=font_texto)
    
    # Linha divisor
    draw.line((40, 110, 760, 110), fill="#ccc", width=2)
    
    # Plano 1
    draw.text((60, 140), plano1, fill="#2E8B57", font=font_destaque)
    for i, vant in enumerate(vantagens1):
        draw.text((80, 180 + i*30), f"✓ {vant}", fill="black", font=font_texto)
    
    # Plano 2
    draw.text((420, 140), plano2, fill="#1E90FF", font=font_destaque)
    for i, vant in enumerate(vantagens2):
        draw.text((440, 180 + i*30), f"✓ {vant}", fill="black", font=font_texto)
    
    # CTA
    cta = "Quer agendar uma call gratuita com a consultora?"
    draw.text((40, 400), cta, fill="black", font=font_destaque)
    draw.rounded_rectangle((40, 440, 760, 500), radius=10, outline="#1E90FF", width=2)
    draw.text((60, 455), "💬 Clique aqui para agendar", fill="#1E90FF", font=font_destaque)
    
    # Rodapé
    draw.text((40, 540), "healthbot.app | Assistente virtual de consultores de saúde", fill="#999", font=font_texto)
    
    # Salva
    output_path = Path("data/comparativo.png")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path)
    print(f"✅ Imagem salva em: {output_path.absolute()}")
    return output_path

if __name__ == "__main__":
    criar_comparativo()