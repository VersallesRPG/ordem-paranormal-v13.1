const { ItemSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class OPItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["ordem-paranormal", "sheet", "item"],
    position: { width: 500, height: 600 },
    form: { submitOnChange: true }
  };

  static PARTS = {
    header: { template: "systems/ordem-paranormal-v13/templates/item-header.hbs" },
    body: { template: "systems/ordem-paranormal-v13/templates/item-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system = this.document.system;
    return context;
  }
}