import uuid from "uuid";

export default class Environment {
  constructor(params = {}) {
    this.id = params.id || uuid.v4();
    this.class = "Environment";
    this.oxygen = params.oxygen || 0.209;
    //>0.2 is normal, <0.20 adverse physiological effects, but may not be noticable, <0.19 Impare thinking and attention, <0.15 Poor Judgement, <0.12 Fainting, nausea, and vomiting, <0.1 Unable to move, immediate fainting, convulsions, death
    this.nitrogen = params.nitrogen || 0.78;
    this.trace = params.trace || 0.01;
    this.pressure = params.pressure || 14.7;
    this.temperature = params.temperature || 22.2;
    this.humidity = params.humidity || 0.45;
    this.gravity = params.gravity || 1;
    this.carbonDioxide = params.carbonDioxide || 0.001;
    //<0.001 is normal, <0.002 is poor air, <0.005 nausea, >0.04 brain damage, coma, and death
    this.water = params.water || 1;
    this.waste = params.waste || 0;
    this.waterToWaste = params.waterToWaste || 0;
    this.filtration = params.filtration || 0;
    this.purification = params.purification || 0;
    this.humidification = params.humidification || 0;
    this.electrolysis = params.electrolysis || 0;
    this.oxygenInjector = params.oxygenInjector || 0;
    this.nitrogenInjector = params.nitrogenInjector || 0;
    this.c02Scrubber = params.c02Scrubber || 0;
    this.heater = params.heater || 0;
  }
  update({
    oxygen,
    nitrogen,
    trace,
    pressure,
    temperature,
    humidity,
    gravity,
    carbonDioxide,
    water,
    waste,
    waterToWaste,
    filtration,
    purification,
    humidification,
    electrolysis,
    oxygenInjector,
    nitrogenInjector,
    c02Scrubber,
    heater,
  }) {
    if (oxygen || oxygen === 0) this.oxygen = oxygen;
    if (nitrogen || nitrogen === 0) this.nitrogen = nitrogen;
    if (trace || trace === 0) this.trace = trace;
    if (pressure || pressure === 0) this.pressure = pressure;
    if (temperature || temperature === 0) this.temperature = temperature;
    if (humidity || humidity === 0) this.humidity = humidity;
    if (gravity || gravity === 0) this.gravity = gravity;
    if (carbonDioxide || carbonDioxide === 0)
      this.carbonDioxide = carbonDioxide;
    if (water || water === 0) this.water = water;
    if (waste || waste === 0) this.waste = waste;
    if (waterToWaste || waterToWaste === 0) this.waterToWaste = waterToWaste;
    if (filtration || filtration === 0) this.filtration = filtration;
    if (purification || purification === 0) this.purification = purification;
    if (humidification || humidification === 0)
      this.humidification = humidification;
    if (electrolysis || electrolysis === 0) this.electrolysis = electrolysis;
    if (oxygenInjector || oxygenInjector === 0)
      this.oxygenInjector = oxygenInjector;
    if (nitrogenInjector || nitrogenInjector === 0)
      this.nitrogenInjector = nitrogenInjector;
    if (c02Scrubber || c02Scrubber === 0) this.c02Scrubber = c02Scrubber;
    if (heater || heater === 0) this.heater = heater;
  }
}
