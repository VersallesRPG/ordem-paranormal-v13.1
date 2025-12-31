/**
 * Ponto de entrada principal - Ordem Paranormal: Sobrevivendo ao Horror
 * Desenvolvido para Foundry VTT Versão 13 utilizando ES Modules.
 */

// Importações dos modelos de dados e da interface visual
import { OPCharacterData, OPItemData } from "./module/data-models.js";
import { OPActorSheet } from "./module/sheets/actor-sheet.js";

/* -------------------------------------------- */
/* Inicialização do Sistema (Init Hook)        */
/* -------------------------------------------- */

/**
 * O hook 'init' é o momento vital para registrar as fundações do sistema
 * antes que qualquer dado do mundo seja carregado[cite: 132, 391].
 */
Hooks.once("init", () => {
  console.log("Ordem Paranormal V13 | Iniciando Sistema Supremo...");

  // 1. Registro de DataModels (Arquitetura de Dados Isomórfica)
  // Vincula as classes de validação e cálculo ao núcleo do Foundry[cite: 315, 378].
  CONFIG.Actor.dataModels = {
    personagem: OPCharacterData
  };

  CONFIG.Item.dataModels = {
    item: OPItemData
  };

  // 2. Registro da Ficha de Personagem (ApplicationV2)
  // Substitui a ficha padrão (core) pela nossa interface modular e performática[cite: 124, 125].
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("ordem-paranormal-v13", OPActorSheet, {
    types: ["personagem"],
    makeDefault: true,
    label: "Ficha de Sobrevivente (V13)"
  });

  // 3. Configurações Globais (Namespace CONFIG.OP)
  // Armazena strings e constantes para uso nos templates Handlebars.
  CONFIG.OP = {
    classes: {
      combatente: "Combatente",
      especialista: "Especialista",
      ocultista: "Ocultista",
      sobrevivente: "Sobrevivente"
    }
  };

  console.log("Ordem Paranormal V13 | Fundação e Interface Registradas.");
});

/* -------------------------------------------- */
/* Configurações Adicionais (Ready Hook)       */
/* -------------------------------------------- */

/**
 * O hook 'ready' dispara quando o jogo está totalmente carregado[cite: 132, 393].
 */
Hooks.once("ready", () => {
  console.log("Ordem Paranormal V13 | Sistema pronto para a investigação.");
});