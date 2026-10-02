const campoTarefa = document.getElementById("campo-tarefa");
const botaoAdicionar = document.getElementById("botao-adicionar");
const listaTarefas = document.getElementById("lista-tarefas");
const contadorTarefas = document.getElementById("contador-tarefas");
const botaoModoEscuro = document.getElementById("botao-modo-escuro");
const mensagemVazia = document.getElementById("mensagem-vazia");

const botoesFiltro = document.querySelectorAll(".filtro");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";

/* =========================
   MOSTRAR TAREFAS
========================= */

function mostrarTarefas() {

    listaTarefas.innerHTML = "";

    let tarefasFiltradas = [...tarefas];

    if (filtroAtual === "pendentes") {
        tarefasFiltradas = tarefas.filter(
            tarefa => !tarefa.concluida
        );
    }

    if (filtroAtual === "concluidas") {
        tarefasFiltradas = tarefas.filter(
            tarefa => tarefa.concluida
        );
    }

    /* Prioridades aparecem primeiro */
    tarefasFiltradas.sort((a, b) => {

        if (a.prioritaria === b.prioritaria) {
            return 0;
        }

        return a.prioritaria ? -1 : 1;
    });

    /* Mostrar mensagem quando não houver tarefas */

    if (tarefasFiltradas.length === 0) {

        mensagemVazia.style.display = "block";

        if (filtroAtual === "concluidas" && tarefas.length > 0) {

            mensagemVazia.querySelector("h2").textContent =
                "Nenhuma tarefa concluída";

            mensagemVazia.querySelector("p").textContent =
                "Conclua uma tarefa para ela aparecer aqui.";

        } else if (filtroAtual === "pendentes" && tarefas.length > 0) {

            mensagemVazia.querySelector("h2").textContent =
                "Tudo em dia! 🎉";

            mensagemVazia.querySelector("p").textContent =
                "Você não possui tarefas pendentes.";

        } else {

            mensagemVazia.querySelector("h2").textContent =
                "Tudo pronto! ✨";

            mensagemVazia.querySelector("p").textContent =
                "Adicione uma nova tarefa para começar.";
        }

    } else {

        mensagemVazia.style.display = "none";
    }

    /* Criar tarefas */

    tarefasFiltradas.forEach(tarefa => {

        const item = document.createElement("li");

        item.className = "item-tarefa";

        if (tarefa.concluida) {
            item.classList.add("concluida");
        }

        if (tarefa.prioritaria) {
            item.classList.add("prioritaria");
        }

        item.innerHTML = `

            <button
                class="botao-prioridade"
                title="Marcar como prioridade"
                onclick="alternarPrioridade(${tarefa.id})"
            >
                <i class="fa-solid fa-star"></i>
            </button>

            <div class="conteudo-tarefa">

                <span>
                    ${escaparHTML(tarefa.texto)}
                </span>

                <small class="data-tarefa">
                    <i class="fa-regular fa-calendar"></i>
                    ${tarefa.data}
                </small>

            </div>

            <div class="acoes-tarefa">

                <button
                    class="botao-acao"
                    title="${tarefa.concluida ? "Desmarcar" : "Concluir"}"
                    onclick="alternarConclusao(${tarefa.id})"
                >
                    <i class="fa-solid ${
                        tarefa.concluida
                            ? "fa-rotate-left"
                            : "fa-check"
                    }"></i>
                </button>

                <button
                    class="botao-acao excluir"
                    title="Excluir tarefa"
                    onclick="excluirTarefa(${tarefa.id})"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>
        `;

        listaTarefas.appendChild(item);
    });

    atualizarContador();

    salvarTarefas();
}

/* =========================
   ADICIONAR
========================= */

function adicionarTarefa() {

    const texto = campoTarefa.value.trim();

    if (texto === "") {

        campoTarefa.focus();

        return;
    }

    const agora = new Date();

    const dataFormatada = agora.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

    const novaTarefa = {

        id: Date.now(),

        texto: texto,

        concluida: false,

        prioritaria: false,

        data: dataFormatada
    };

    tarefas.push(novaTarefa);

    campoTarefa.value = "";

    mostrarTarefas();

    campoTarefa.focus();
}

/* =========================
   CONCLUIR
========================= */

function alternarConclusao(id) {

    tarefas = tarefas.map(tarefa => {

        if (tarefa.id === id) {
            tarefa.concluida = !tarefa.concluida;
        }

        return tarefa;
    });

    mostrarTarefas();
}

/* =========================
   PRIORIDADE
========================= */

function alternarPrioridade(id) {

    tarefas = tarefas.map(tarefa => {

        if (tarefa.id === id) {
            tarefa.prioritaria = !tarefa.prioritaria;
        }

        return tarefa;
    });

    mostrarTarefas();
}

/* =========================
   EXCLUIR
========================= */

function excluirTarefa(id) {

    tarefas = tarefas.filter(
        tarefa => tarefa.id !== id
    );

    mostrarTarefas();
}

/* =========================
   FILTROS
========================= */

botoesFiltro.forEach(botao => {

    botao.addEventListener("click", () => {

        botoesFiltro.forEach(b => {
            b.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        filtroAtual = botao.dataset.filtro;

        mostrarTarefas();
    });

});

/* =========================
   CONTADOR COMPLETO
========================= */

function atualizarContador() {

    const total = tarefas.length;

    const concluidas = tarefas.filter(
        tarefa => tarefa.concluida
    ).length;

    const pendentes = total - concluidas;

    if (total === 0) {

        contadorTarefas.textContent =
            "0 tarefas";

        return;
    }

    contadorTarefas.textContent =
        `${total} tarefa${total !== 1 ? "s" : ""} • ` +
        `${concluidas} concluída${concluidas !== 1 ? "s" : ""} • ` +
        `${pendentes} pendente${pendentes !== 1 ? "s" : ""}`;
}

/* =========================
   SALVAR
========================= */

function salvarTarefas() {

    localStorage.setItem(
        "tarefas",
        JSON.stringify(tarefas)
    );
}

/* =========================
   PROTEGER TEXTO
========================= */

function escaparHTML(texto) {

    const elemento = document.createElement("div");

    elemento.textContent = texto;

    return elemento.innerHTML;
}

/* =========================
   MODO ESCURO
========================= */

botaoModoEscuro.addEventListener("click", () => {

    document.body.classList.toggle("modoescuro");

    const icone =
        botaoModoEscuro.querySelector("i");

    if (
        document.body.classList.contains(
            "modoescuro"
        )
    ) {

        icone.classList.remove("fa-moon");

        icone.classList.add("fa-sun");

    } else {

        icone.classList.remove("fa-sun");

        icone.classList.add("fa-moon");
    }
});

/* =========================
   ADICIONAR
========================= */

botaoAdicionar.addEventListener(
    "click",
    adicionarTarefa
);

/* ENTER */

campoTarefa.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            adicionarTarefa();
        }

    }
);

/* =========================
   INICIAR
========================= */

mostrarTarefas();