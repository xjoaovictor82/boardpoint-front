/** Miniatura que acompanha o card sob o mouse em um carrossel. */
export class PreviewCarrossel {
    constructor(carrossel) {
        const preview = document.createElement("div");
        preview.className = "carrossel-preview";
        preview.innerHTML = '<img alt="">';
        carrossel.appendChild(preview);
        const imagem = preview.querySelector("img");
        let escondendo;
        carrossel.querySelectorAll(".card").forEach((card) => {
            card.addEventListener("mouseenter", () => {
                clearTimeout(escondendo);
                const imagemDoCard = card.querySelector("img");
                if (!imagemDoCard)
                    return;
                imagem.src = imagemDoCard.src;
                // Alinha a miniatura ao card, dentro da largura visível do carrossel.
                const posicao = card.offsetLeft - carrossel.scrollLeft;
                preview.style.left = posicao + card.offsetWidth / 2 + "px";
                preview.classList.add("visivel");
            });
            card.addEventListener("mouseleave", () => {
                escondendo = setTimeout(() => preview.classList.remove("visivel"), 80);
            });
        });
        // Some ao rolar, para não ficar "grudada" entre produtos.
        carrossel.addEventListener("scroll", () => preview.classList.remove("visivel"));
    }
}
