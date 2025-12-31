/**
 * Ficha de Personagem "Colossal" - Ordem Paranormal: Sobrevivendo ao Horror.
 * Arquitetura ApplicationV2 nativa da Versão 13 para máxima performance.
 */

const { ActorSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class OPActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  
  /** @override */
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["ordem-paranormal", "sheet", "actor"],
    position: { width: 800, height: 900 },
    // Ações mapeadas diretamente no HTML via data-action [cite: 356-358]
    actions: {
      rollAttribute: OPActorSheet.#onRollAttribute
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    // Configuração manual do DragDrop para a maleta RE4 [cite: 366-367]
    dragDrop: [{ dragSelector: ".item-card-wrapper", dropSelector: "#suitcase-drop-zone" }]
  };

  /** * Definição das partes modulares da interface[cite: 347].
   * Isso permite que o Foundry renderize apenas o necessário em cada atualização.
   */
  static PARTS = {
    header: { template: "systems/ordem-paranormal-v13/templates/sheet-header.hbs" },
    body: { template: "systems/ordem-paranormal-v13/templates/sheet-body.hbs" },
    inventory: { template: "systems/ordem-paranormal-v13/templates/sheet-inventory.hbs" }
  };

  /**
   * Prepara o contexto de dados para os templates Handlebars [cite: 50, 345-346].
   * Consome os cálculos e validações do seu DataModel [cite: 150-151].
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    // Vincula os dados calculados (PV, PE, Sanidade, Defesa) à ficha [cite: 121-122]
    context.system = this.document.system; 
    context.config = CONFIG.OP;
    context.items = this.document.items; // Puxa os itens para a maleta
    
    return context;
  }

  /**
   * Lógica executada após cada renderização do HTML [cite: 54, 354-356].
   * Utilizado para efeitos visuais de "Horror Reativo" e ativação de eventos nativos.
   */
  _onRender(context, options) {
    super._onRender(context, options);
    
    // Na V13, 'this.element' é um HTMLElement nativo [cite: 55-56, 350]
    const html = this.element; 
    
    // Ativa manualmente o sistema de Drag & Drop para a maleta [cite: 366-367]
    this.dragDrop.forEach(d => d.bind(html));

    // LÓGICA DE HORROR REATIVO (Diretor Audiovisual)
    const status = this.document.system.status;
    const porcSan = (status.sanidade.value / status.sanidade.max) * 100;

    // Remove estados anteriores para evitar conflitos de animação
    html.classList.remove("state-shaken", "state-insane");

    // Aplica filtros e tremedeiras baseados na sanidade do personagem
    if (porcSan <= 25) {
      html.classList.add("state-insane"); // Horror Máximo: Preto e Branco + Shake
    } else if (porcSan <= 50) {
      html.classList.add("state-shaken"); // Abalado: Sepia e distorção leve
    }
  }

  /* -------------------------------------------- */
  /* Lógica de Ações Privadas (Dice Roller)      */
  /* -------------------------------------------- */

  /**
   * Gerencia a rolagem de atributos do Pentagrama[cite: 358].
   * Implementa a regra: Xd20kh (maior valor) ou 2d20kl (menor) se Attr for 0.
   */
  static async #onRollAttribute(event, target) {
    const attrKey = target.dataset.attribute;
    const attrVal = this.document.system.atributos[attrKey];
    
    // Define a fórmula baseada na regra de Sobrevivendo ao Horror
    const formula = attrVal > 0 ? `${attrVal}d20kh` : "2d20kl";
    
    const roll = new Roll(formula);
    await roll.evaluate();

    // Estilização temática da mensagem de chat
    const label = attrKey.toUpperCase();
    const flavor = `<div class="op-roll-flavor">Investigando: <b>${label}</b></div>`;

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: flavor
    });
  }

  /**
   * Gerencia a recepção de itens na maleta (Drop) [cite: 366-367].
   * Preparado para integrar com os "Item Cards" que você criará.
   */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Item") return;
    
    // Executa a lógica de criação de item no ator [cite: 36, 126]
    return super._onDrop(event);
  }
}