import uuid from "uuid";

export default class Environment {
  constructor(params = {}) {
    this.id = params.id || uuid.v4();
    this.class = "Environment";
    this.atmOxygen = params.atmOxygen || 21;
    this.atmNitrogen = params.atmNitrogen || 78;
    this.atmCarbonDioxide = params.atmCarbonDioxide || 0;
    this.atmHumidity = params.atmHumidity || 0.45;
    this.atmTemperature = params.atmTemperature || 70;
    this.atmPressure = params.atmPressure || 1;
    this.atmOxygenRate = params.atmOxygenRate || 0;
    this.atmNitrogenRate = params.atmNitrogenRate || 0;
    this.atmCarbonDioxideRate = params.atmCarbonDioxideRate || 0;
    this.atmHumidityRate = params.atmHumidityRate || 0;
    this.atmTemperatureRate = params.atmTemperatureRate || 0;
    this.atmPressureRate = params.atmPressureRate || 0;
    this.atmContamination = params.atmContamination || "None";
    this.percentOxygen = params.percentOxygen || 0.21;
    this.percentNitrogen = params.percentNitrogen || 0.78;
    this.percentCarbonDioxide = params.percentCarbonDioxide || 0;
  }
  update({
    atmOxygen,
    atmNitrogen,
    atmCarbonDioxide,
    atmHumidity,
    atmTemperature,
    atmPressure,
    atmOxygenRate,
    atmNitrogenRate,
    atmCarbonDioxideRate,
    atmHumidityRate,
    atmTemperatureRate,
    atmPressureRate,
    atmContamination,
    percentOxygen,
    percentNitrogen,
    percentCarbonDioxide,
  }) {
    if (atmOxygen || atmOxygen === 0) this.atmOxygen = atmOxygen;
    if (atmNitrogen || atmNitrogen === 0) this.atmNitrogen = atmNitrogen;
    if (atmCarbonDioxide || atmCarbonDioxide === 0)
      this.atmCarbonDioxide = atmCarbonDioxide;
    if (atmHumidity || atmHumidity === 0) this.atmHumidity = atmHumidity;
    if (atmTemperature || atmTemperature === 0)
      this.atmTemperature = atmTemperature;
    if (atmPressure || atmPressure === 0) this.atmPressure = atmPressure;
    if (atmOxygenRate || atmOxygenRate === 0)
      this.atmOxygenRate = atmOxygenRate;
    if (atmNitrogenRate || atmNitrogenRate === 0)
      this.atmNitrogenRate = atmNitrogenRate;
    if (atmCarbonDioxideRate || atmCarbonDioxideRate === 0)
      this.atmCarbonDioxideRate = atmCarbonDioxideRate;
    if (atmHumidityRate || atmHumidityRate === 0)
      this.atmHumidityRate = atmHumidityRate;
    if (atmTemperatureRate || atmTemperatureRate === 0)
      this.atmTemperatureRate = atmTemperatureRate;
    if (atmPressureRate || atmPressureRate === 0)
      this.atmPressureRate = atmPressureRate;
    if (atmContamination || atmContamination === "None")
      this.atmContamination = atmContamination;
    if (percentOxygen || percentOxygen === 0)
      this.percentOxygen = percentOxygen;
    if (percentNitrogen || percentNitrogen === 0)
      this.percentNitrogen = percentNitrogen;
    if (percentCarbonDioxide || percentCarbonDioxide === 0)
      this.percentCarbonDioxide = percentCarbonDioxide;
  }
  reset() {
    this.atmOxygen = 21;
    this.atmNitrogen = 78;
    this.atmCarbonDioxide = 0;
    this.atmHumidity = 0.45;
    this.atmTemperature = 70;
    this.atmPressure = 1;
    this.atmOxygenRate = 0;
    this.atmNitrogenRate = 0;
    this.atmCarbonDioxideRate = 0;
    this.atmHumidityRate = 0;
    this.atmTemperatureRate = 0;
    this.atmPressureRate = 0;
    this.atmContamination = "None";
    this.percentOxygen = 0.21;
    this.percentNitrogen = 0.78;
    this.percentCarbonDioxide = 0;
  }
}
