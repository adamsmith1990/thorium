import {System} from "./generic";

export default class LifeSupport extends System {
  constructor(params = {}) {
    super(params);
    this.class = "LifeSupport";
    this.waterTank = params.waterTank || 10;
    this.wasteTank = params.wasteTank || 0;
    this.hydrogenTank = params.hydrogenTank || 20;
    this.oxygenTank = params.oxygenTank || 10;
    this.nitrogenTank = params.nitrogenTank || 78;
  }

  updateLifeSupport({
    waterTank,
    wasteTank,
    hydrogenTank,
    oxygenTank,
    nitrogenTank,
  }) {
    if (waterTank || waterTank === 0) {
      this.waterTank = waterTank;
    }
    if (wasteTank || wasteTank === 0) {
      this.wasteTank = wasteTank;
    }
    if (hydrogenTank || hydrogenTank === 0) {
      this.hydrogenTank = hydrogenTank;
    }
    if (oxygenTank || oxygenTank === 0) {
      this.oxygenTank = oxygenTank;
    }
    if (nitrogenTank || nitrogenTank === 0) {
      this.nitrogenTank = nitrogenTank;
    }
  }
}
