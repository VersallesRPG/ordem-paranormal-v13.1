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
    // Mapeamento de ações disparadas por data-action no HTML
    actions: {
      rollAttribute: OPActorSheet.#onRollAttribute,
      rollSkill: OPActorSheet.#onRollSkill
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    // Gerenciador de arrastar e soltar para a maleta de itens
    dragDrop: [{ dragSelector: ".item-card-wrapper", dropSelector: "#suitcase-drop-zone" }]
  };

  /** * Definição modular da interface.
   * Divide a ficha em partes para atualizações parciais eficientes.
   */
  static PARTS = {
    header: { template: "systems/ordem-paranormal-v13/templates/sheet-header.hbs" },
    body: { template: "systems/ordem-paranormal-v13/templates/sheet-body.hbs" },
    inventory: { template: "systems/ordem-paranormal-v13/templates/sheet-inventory.hbs" }
  };

  /**
   * Prepara os dados para o template Handlebars.
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    // Dados validados e calculados pelo DataModel
    context.system = this.document.system; 
    context.config = CONFIG.OP;
    context.items = this.document.items; 
    
    return context;
  }

  /**
   * Lógica de renderização direta no DOM.
   */
  _onRender(context, options) {
    super._onRender(context, options);
    
    const html = this.element; 
    
    // Conecta o sistema de Drag & Drop ao elemento da ficha
    this.dragDrop.forEach(d => d.bind(html));

    // LÓGICA DE HORROR REATIVO
    const status = this.document.system.status;
    const porcSan = (status.sanidade.value / status.sanidade.max) * 100;

    html.classList.remove("state-shaken", "state-insane");

    if (porcSan <= 25) {
      html.classList.add("state-insane"); // Horror Máximo: Tremedeira e distorção
    } else if (porcSan <= 50) {
      html.classList.add("state-shaken"); // Abalado: Descoloração parcial
    }
  }

  /* -------------------------------------------- */
  /* Lógica de Rolagens (Actions)                */
  /* -------------------------------------------- */

  /**
   * Rola Atributos (FOR, AGI, INT, VIG, PRE).
   * Regra: Xd20kh (maior) ou 2d20kl (menor) se Atributo for 0.
   */
  static async #onRollAttribute(event, target) {
    const attrKey = target.dataset.attribute;
    const attrVal = this.document.system.atributos[attrKey];
    
    const formula = attrVal > 0 ? `${attrVal}d20kh` : "2d20kl";
    const roll = new Roll(formula);
    await roll.evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `<div class="op-roll-flavor">Investigando: <b>${attrKey.toUpperCase()}</b></div>`
    });
  }

  /**
   * Rola Perícias (28 opções disponíveis).
   * Regra: Atributo d20 (kh) + Bônus de treinamento.
   */
  static async #onRollSkill(event, target) {
    const skillKey = target.dataset.skill;
    const skill = this.document.system.pericias[skillKey];
    const attrVal = this.document.system.atributos[skill.atributo];
    
    // Determina se usa a mecânica normal ou a penalidade de atributo 0
    const dicePart = attrVal > 0 ? `${attrVal}d20kh` : "2d20kl";
    const formula = `${dicePart} + ${skill.bonus}`;
    
    const roll = new Roll(formula);
    await roll.evaluate();

    return roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `<div class="op-roll-flavor">Perícia: <b>${skillKey.toUpperCase()}</b></div>`
    });
  }

  /**
   * Gerencia itens soltos na ficha (Drop).
   */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Item") return;
    return super._onDrop(event);
  }
}