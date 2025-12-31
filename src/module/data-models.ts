/**
 * Modelos de Dados - Ordem Paranormal: Sobrevivendo ao Horror
 * Arquitetura baseada em DataModel da V13 para validação e integridade[cite: 15, 310].
 */

import { TypeDataModel } from "foundry.abstract";

/**
 * Modelo de Dados para Personagens (Atores).
 * Gerencia atributos, status, perícias e cálculos de classe[cite: 37, 314].
 */
export class OPCharacterData extends TypeDataModel {
  
  /** @override [cite: 19, 318-321] */
  static defineSchema() {
    const { SchemaField, NumberField, StringField, HTMLField } = foundry.data.fields;
    
    // Função auxiliar para padronizar a criação de perícias [cite: 24]
    const skill = (attr) => new SchemaField({
      bonus: new NumberField({ initial: 0, integer: true }),
      atributo: new StringField({ initial: attr })
    });

    return {
      // Atributos base (FOR, AGI, INT, VIG, PRE) [cite: 19, 321]
      atributos: new SchemaField({
        forca: new NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        agilidade: new NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        intelecto: new NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        vigor: new NumberField({ required: true, integer: true, initial: 1, min: 0 }),
        presenca: new NumberField({ required: true, integer: true, initial: 1, min: 0 })
      }),
      
      // Status vitais com suporte a valor atual e máximo [cite: 24, 321]
      status: new SchemaField({
        pv: new SchemaField({
          value: new NumberField({ initial: 20 }),
          max: new NumberField({ initial: 20 })
        }),
        pe: new SchemaField({
          value: new NumberField({ initial: 2 }),
          max: new NumberField({ initial: 2 })
        }),
        sanidade: new SchemaField({
          value: new NumberField({ initial: 12 }),
          max: new NumberField({ initial: 12 })
        })
      }),

      // LISTA COMPLETA DE PERÍCIAS [cite: 24, 321]
      pericias: new SchemaField({
        // Agilidade
        acrobacia: skill("agilidade"), crime: skill("agilidade"), furtividade: skill("agilidade"),
        iniciativa: skill("agilidade"), pilotagem: skill("agilidade"), pontaria: skill("agilidade"), 
        reflexos: skill("agilidade"),
        // Força
        atletismo: skill("forca"), luta: skill("forca"),
        // Intelecto
        atualidades: skill("intelecto"), ciencias: skill("intelecto"), investigacao: skill("intelecto"),
        medicina: skill("intelecto"), ocultismo: skill("intelecto"), profissao: skill("intelecto"),
        sobrevivencia: skill("intelecto"), tatica: skill("intelecto"), tecnologia: skill("intelecto"),
        // Presença
        adestramento: skill("presenca"), artes: skill("presenca"), diplomacia: skill("presenca"),
        enganacao: skill("presenca"), intimidacao: skill("presenca"), intuicao: skill("presenca"),
        percepcao: skill("presenca"), religiao: skill("presenca"), vontade: skill("presenca"),
        // Vigor
        fortitude: skill("vigor")
      }),
      
      // Detalhes de progressão e biografia [cite: 24, 321]
      detalhes: new SchemaField({
        classe: new StringField({ 
          initial: "combatente", 
          choices: ["combatente", "especialista", "ocultista", "sobrevivente"] 
        }),
        origem: new StringField({ initial: "" }),
        nex: new NumberField({ initial: 5, min: 0, max: 99 }),
        estagio: new NumberField({ initial: 1, min: 1 }) // Exclusivo para Sobreviventes (SaH)
      })
    };
  }

  /**
   * Executa cálculos de lógica de negócio sempre que os dados mudam[cite: 109, 121, 327].
   * Garante a retroatividade de PV, PE e Sanidade baseada nas fórmulas do sistema.
   */
  prepareDerivedData() {
    const { atributos, status, detalhes } = this;
    const nex = detalhes.nex;
    const classe = detalhes.classe;
    
    // Nível calculado (5% NEX = Nível 1)
    const nivel = Math.max(1, Math.floor(nex / 5));
    const nexAdicional = nivel - 1;

    // 1. Cálculos de PV, PE e Sanidade por Classe (Retroativo) [cite: 122]
    switch (classe) {
      case "combatente":
        status.pv.max = (20 + atributos.vigor) + (nexAdicional * (4 + atributos.vigor));
        status.pe.max = (2 + atributos.presenca) + (nexAdicional * (2 + atributos.presenca));
        status.sanidade.max = 12 + (nexAdicional * 3);
        break;

      case "especialista":
        status.pv.max = (16 + atributos.vigor) + (nexAdicional * (3 + atributos.vigor));
        status.pe.max = (3 + atributos.presenca) + (nexAdicional * (3 + atributos.presenca));
        status.sanidade.max = 16 + (nexAdicional * 4);
        break;

      case "ocultista":
        status.pv.max = (12 + atributos.vigor) + (nexAdicional * (2 + atributos.vigor));
        status.pe.max = (4 + atributos.presenca) + (nexAdicional * (4 + atributos.presenca));
        status.sanidade.max = 20 + (nexAdicional * 5);
        break;

      case "sobrevivente":
        const estagioAdicional = detalhes.estagio - 1;
        status.pv.max = (8 + atributos.vigor) + (estagioAdicional * 2);
        status.pe.max = (2 + atributos.presenca) + (estagioAdicional * 1);
        status.sanidade.max = 8 + (estagioAdicional * 2);
        break;
    }

    // 2. Limite de PE por Turno [cite: 122, 330]
    this.limitePE = classe === "sobrevivente" ? 1 : Math.max(1, Math.floor(nex / 5));

    // 3. Classe de Dificuldade (DT) para Rituais e Habilidades [cite: 330]
    this.dtRituais = 10 + this.limitePE + atributos.presenca;

    // 4. Defesa Passiva Base [cite: 330]
    this.defesa = 10 + atributos.agilidade;
  }
}

/**
 * Modelo de Dados para Itens.
 * Gerencia o tamanho físico para a maleta estilo RE4 [cite: 321, 366-367].
 */
export class OPItemData extends TypeDataModel {
  
  /** @override [cite: 321] */
  static defineSchema() {
    const { NumberField, HTMLField } = foundry.data.fields;
    
    return {
      descricao: new HTMLField({ initial: "" }),
      // Ocupação de inventário (1 a 4 espaços conforme solicitado)
      espacos: new NumberField({ 
        required: true, 
        integer: true, 
        initial: 1, 
        min: 1, 
        max: 4 
      }),
      // Dimensões para o grid visual da maleta
      largura: new NumberField({ initial: 1, min: 1, max: 2 }),
      altura: new NumberField({ initial: 1, min: 1, max: 2 }),
      peso: new NumberField({ initial: 1, min: 0 })
    };
  }
}