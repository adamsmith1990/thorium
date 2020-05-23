import {System} from "./generic";

export default class LifeSupport extends System {
  constructor(simulatorId, params = {}) {
    super(params);
    this.waterTank = params.waterTank || 10;
    this.wasteTank = params.wasteTank || 0;
    this.hydrogenTank = params.hydrogenTank || 20;
    this.oxygenTank = params.oxygenTank || 10;
    this.nitrogenTank = params.nitrogenTank || 78;
    this.waterTankRate = params.waterTankRate || 0;
    this.wasteTankRate = params.wasteTankRate || 0;
    this.hydrogenTankRate = params.hydrogenTankRate || 0;
    this.oxygenTankRate = params.oxygenTankRate || 0;
    this.nitrogenTankRate = params.nitrogenTankRate || 0;
    this.oxygenTransfer = params.oxygenTransfer || 0;
    this.oxygenDirection = params.oxygenDirection || "Off";
    this.nitrogenTransfer = params.nitrogenTransfer || 0;
    this.nitrogenDirection = params.nitrogenDirection || "Off";
    this.electrolysis = params.electrolysis || 0;
    this.electrolysisDirection = params.electrolysisDirection || "Off";
    this.humidifier = params.humidifier || 0;
    this.humidifierDirection = params.humidifier || "Off";
    this.heater = params.heater || 0;
    this.heaterDirection = params.heaterDirection || "Off";
    this.filter = params.filter || 0;
    this.carbonDioxideScrubber = params.carbonDioxideScrubber || 0;
    this.cleanContaminant = params.cleanContaminant || null;
    super.simulatorId = simulatorId;
    super.class = "LifeSupport";
    super.type = "LifeSupport";
    super.name = "LifeSupport";
    super.storedDisplayName = "LifeSupport";
    super.upgradeName = "LifeSupport";
    this.activeDeck = params.activeDeck || null;
  }
  updateLifeSupport({
    waterTank,
    wasteTank,
    hydrogenTank,
    oxygenTank,
    nitrogenTank,
    waterTankRate,
    wasteTankRate,
    hydrogenTankRate,
    oxygenTankRate,
    nitrogenTankRate,
    oxygenTransfer,
    oxygenDirection,
    nitrogenTransfer,
    nitrogenDirection,
    electrolysis,
    electrolysisDirection,
    humidifier,
    humidifierDirection,
    heater,
    heaterDirection,
    filter,
    carbonDioxideScrubber,
    cleanContaminant,
    activeDeck,
  }) {
    if (waterTank || waterTank === 0) this.waterTank = waterTank;
    if (wasteTank || wasteTank === 0) this.wasteTank = wasteTank;
    if (hydrogenTank || hydrogenTank === 0) this.hydrogenTank = hydrogenTank;
    if (oxygenTank || oxygenTank === 0) this.oxygenTank = oxygenTank;
    if (nitrogenTank || nitrogenTank === 0) this.nitrogenTank = nitrogenTank;
    if (waterTankRate || waterTankRate === 0)
      this.waterTankRate = waterTankRate;
    if (wasteTankRate || wasteTankRate === 0)
      this.wasteTankRate = wasteTankRate;
    if (hydrogenTankRate || hydrogenTankRate === 0)
      this.hydrogenTankRate = hydrogenTankRate;
    if (oxygenTankRate || oxygenTankRate === 0)
      this.oxygenTankRate = oxygenTankRate;
    if (nitrogenTankRate || nitrogenTankRate === 0)
      this.nitrogenTankRate = nitrogenTankRate;
    if (oxygenTransfer || oxygenTransfer === 0)
      this.oxygenTransfer = oxygenTransfer;
    if (oxygenDirection || oxygenDirection === "Off")
      this.oxygenDirection = oxygenDirection;
    if (nitrogenTransfer || nitrogenTransfer === 0)
      this.nitrogenTransfer = nitrogenTransfer;
    if (nitrogenDirection || nitrogenDirection === "Off")
      this.nitrogenDirection = nitrogenDirection;
    if (electrolysis || electrolysis === 0) this.electrolysis = electrolysis;
    if (electrolysisDirection || electrolysisDirection === "Off")
      this.electrolysisDirection = electrolysisDirection;
    if (humidifier || humidifier === 0) this.humidifier = humidifier;
    if (humidifierDirection || humidifierDirection === "Off")
      this.humidifierDirection = humidifierDirection;
    if (heater || heater === 0) this.heater = heater;
    if (heaterDirection || heaterDirection === "Off")
      this.heaterDirection = heaterDirection;
    if (filter || filter === 0) this.filter = filter;
    if (carbonDioxideScrubber || carbonDioxideScrubber === 0)
      this.carbonDioxideScrubber = carbonDioxideScrubber;
    if (cleanContaminant || cleanContaminant === null)
      this.cleanContaminant = cleanContaminant;
    if (activeDeck || activeDeck === null) this.activeDeck = activeDeck;
  }
  reset() {
    this.waterTank = 10;
    this.wasteTank = 0;
    this.hydrogenTank = 20;
    this.oxygenTank = 10;
    this.nitrogenTank = 78;
    this.waterTankRate = 0;
    this.wasteTankRate = 0;
    this.hydrogenTankRate = 0;
    this.oxygenTankRate = 0;
    this.nitrogenTankRate = 0;
  }
}
