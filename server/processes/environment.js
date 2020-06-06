import App from "../app";
import {pubsub} from "../helpers/subscriptionManager";
import throttle from "../helpers/throttle";
import uuid from "uuid";
//import uuid from "uuid";

const EnvironmentProcess = () => {
  //Setting the initial Active Deck to Deck 1
  App.flights.forEach(f => {
    f.simulators
      .map(s => App.simulators.find(sim => sim.id === s))
      .forEach(sim => {
        const lifeSupport = sim.lifeSupport;
        const firstDeck = App.decks
          .filter(s => s.simulatorId === sim.id)
          .find(d => d.number === 1).id;
        if (!lifeSupport.activeDeck) {
          lifeSupport.activeDeck = firstDeck;
        }
      });
  });

  App.flights
    .filter(f => f.running === true)
    .forEach(f => {
      //Make an array of all the simulators that are in use
      f.simulators
        .map(s => App.simulators.find(sim => sim.id === s))
        .forEach(sim => {
          //Setup Error Checking
          let warning = false;

          //Gather Simulator Variables
          const simId = sim.id;
          const currentSimulator = App.simulators.find(a => a.id === simId);
          const lifeSupport = sim.lifeSupport;
          const currentAlert = currentSimulator.alertLevel;
          const activeDeck = lifeSupport.activeDeck;
          const deckCount = App.decks.filter(s => s.simulatorId === simId)
            .length;

          //Amount of People
          const bridgeCrew = currentSimulator.ship.bridgeCrew;
          currentSimulator.ship.extraPeople = 10;
          const extraPeople = currentSimulator.ship.extraPeople;
          const crewCount = App.crew.filter(a => a.simulatorId === simId)
            .length;
          const totalPersonCount = bridgeCrew + crewCount + extraPeople;
          const personCapacityRatio =
            totalPersonCount / (bridgeCrew + crewCount);

          //Gather Environment Specific Variables

          //Flight Director Adjustment Rates. Basically they just input in how much they want to increase or decrease each second
          const waterTank = lifeSupport.waterTank;
          const wasteTank = lifeSupport.wasteTank;
          const hydrogenTank = lifeSupport.hydrogenTank;
          const oxygenTank = lifeSupport.oxygenTank;
          const nitrogenTank = lifeSupport.nitrogenTank;
          const waterTankRate = lifeSupport.waterTankRate;
          const wasteTankRate = lifeSupport.wasteTankRate;
          const hydrogenTankRate = lifeSupport.hydrogenTankRate;
          const oxygenTankRate = lifeSupport.oxygenTankRate;
          const nitrogenTankRate = lifeSupport.nitrogenTankRate;

          //Panel Rates
          const oxygenTransfer = lifeSupport.oxygenTransfer / 60; //It takes 1 minute to restore breathable levels to an entire deck
          const oxygenDirection = lifeSupport.oxygenDirection;
          const nitrogenTransfer = lifeSupport.nitrogenTransfer / 7.7; //It takes 1 minute to restore breathable levels to an entire deck
          const nitrogenDirection = lifeSupport.nitrogenDirection;
          const electrolysis = lifeSupport.electrolysis / 60;
          const electrolysisDirection = lifeSupport.electrolysisDirection;
          const humidifier = lifeSupport.humidifier / 60;
          const humidifierDirection = lifeSupport.humidifierDirection;
          const heater = lifeSupport.heater / 60;
          const heaterDirection = lifeSupport.heaterDirection;
          const filter = lifeSupport.filter / 120;
          const carbonDioxideScrubber = lifeSupport.carbonDioxideScrubber / 600;

          //Calculate Waste and Water
          let waterConsumptionRate = 0.005; //Complete water loss in about 30 minutes
          waterConsumptionRate *= personCapacityRatio;
          //(Anything else that should affect water consumption?)

          const waterTankMax = 10;
          const wasteTankMax = 4; //If waste is not processed, water will be lost after 10 minutes
          const hydrogenTankMax = 30;
          const oxygenTankMax = 10;
          const nitrogenTankMax = 78;

          let electrolysisRate;
          if (electrolysisDirection === "Forward") {
            electrolysisRate = 1;
          } else if (electrolysisDirection === "Reverse") {
            electrolysisRate = -1;
          } else electrolysisRate = 0;

          let humidifierRate;
          if (humidifierDirection === "Forward") {
            humidifierRate = 1;
          } else if (humidifierDirection === "Reverse") {
            humidifierRate = -1;
          } else humidifierRate = 0;

          let oxygenRate;
          if (oxygenDirection === "Forward") {
            oxygenRate = 1;
          } else if (oxygenDirection === "Reverse") {
            oxygenRate = -1;
          } else oxygenRate = 0;

          let nitrogenRate;
          if (nitrogenDirection === "Forward") {
            nitrogenRate = 1;
          } else if (nitrogenDirection === "Reverse") {
            nitrogenRate = -1;
          } else nitrogenRate = 0;

          let heaterRate;
          if (heaterDirection === "Forward") {
            heaterRate = 1;
          } else if (heaterDirection === "Reverse") {
            heaterRate = -1;
          } else heaterRate = 0;

          let newWaterTank =
            waterTank -
            waterConsumptionRate -
            (humidifier * humidifierRate -
              filter -
              electrolysis * electrolysisRate) +
            waterTankRate;
          let newWasteTank =
            wasteTank + waterConsumptionRate - filter + wasteTankRate;
          let newHydrogenTank =
            hydrogenTank -
            electrolysis * electrolysisRate * 2 +
            hydrogenTankRate;
          let newOxygenTank =
            oxygenTank -
            (electrolysis * electrolysisRate + oxygenTransfer * oxygenRate) +
            oxygenTankRate;
          let newNitrogenTank =
            nitrogenTank - nitrogenTransfer * nitrogenRate + nitrogenTankRate;

          if (newWaterTank < 0) {
            newWaterTank = 0;
          } else if (newWaterTank > waterTankMax) {
            newWaterTank = waterTankMax;
          }
          lifeSupport.updateLifeSupport({waterTank: newWaterTank});

          if (newWasteTank < 0) {
            newWasteTank = 0;
          } else if (newWasteTank > wasteTankMax) {
            newWasteTank = wasteTankMax;
          }
          lifeSupport.updateLifeSupport({wasteTank: newWasteTank});

          if (newHydrogenTank < 0) {
            newHydrogenTank = 0;
          } else if (newHydrogenTank > hydrogenTankMax) {
            newHydrogenTank = hydrogenTankMax;
          }
          lifeSupport.updateLifeSupport({hydrogenTank: newHydrogenTank});

          if (newOxygenTank < 0) {
            newOxygenTank = 0;
          } else if (newOxygenTank > oxygenTankMax) {
            newOxygenTank = oxygenTankMax;
          }
          lifeSupport.updateLifeSupport({oxygenTank: newOxygenTank});

          if (newNitrogenTank < 0) {
            newNitrogenTank = 0;
          } else if (newNitrogenTank > nitrogenTankMax) {
            newNitrogenTank = nitrogenTankMax;
          }
          lifeSupport.updateLifeSupport({nitrogenTank: newNitrogenTank});

          pubsub.publish("lifeSupportUpdate", sim);

          //Get the decks on the active simulators to adjust the atmosphere
          App.decks
            .filter(d => d.simulatorId === simId)
            .forEach(d => {
              let environment = d.environment;
              let deckCrewCount = App.crew.filter(c => c.location === d.id)
                .length;

              let activeRate;
              if (activeDeck === d.id) {
                activeRate = 1;
              } else {
                activeRate = 0;
              }

              const atmOxygen = environment.atmOxygen;
              const atmNitrogen = environment.atmNitrogen;
              const atmCarbonDioxide = environment.atmCarbonDioxide;
              const atmHumidity = environment.atmHumidity;
              const atmTemperature = environment.atmTemperature;

              //Flight Director Controls
              const atmOxygenRate = environment.atmOxygenRate;
              const atmNitrogenRate = environment.atmNitrogenRate;
              const atmCarbonDioxideRate = environment.atmCarbonDioxideRate;
              const atmHumidityRate = environment.atmHumidityRate;
              const atmTemperatureRate = environment.atmTemperatureRate * 100;
              const atmPressureRate = environment.atmPressureRate;

              let oxygenConsumptionRate = 0.1 / (600 * 2); //C02 reachs 0.1 and problems start after 20 minutes. Need to check this, doesn't seem to be accurate
              oxygenConsumptionRate *= personCapacityRatio;
              oxygenConsumptionRate *=
                (deckCrewCount * deckCount) / totalPersonCount; //Each deck will consume oxygen based on the number of people
              //Taking Damage

              if (currentAlert === 1) {
                oxygenConsumptionRate *= 1.01;
              }
              if (currentAlert === 2) {
                oxygenConsumptionRate *= 1.006;
              }
              if (currentAlert === 3) {
                oxygenConsumptionRate *= 1.003;
              }
              if (currentAlert === 4) {
                oxygenConsumptionRate *= 1.001;
              }

              let oxygenTankEmpty;
              if (oxygenTank <= 0 && oxygenRate === 1) {
                oxygenTankEmpty = 0;
              } else {
                oxygenTankEmpty = 1;
              }
              let nitrogenTankEmpty;
              if (nitrogenTank <= 0 && nitrogenRate === 1) {
                nitrogenTankEmpty = 0;
              } else {
                nitrogenTankEmpty = 1;
              }
              let noCarbonDioxide;
              if (atmCarbonDioxide <= 0) {
                noCarbonDioxide = 0;
              } else {
                noCarbonDioxide = 1;
              }

              let newAtmOxygen =
                atmOxygen -
                oxygenConsumptionRate +
                (oxygenTransfer * oxygenRate * oxygenTankEmpty +
                  carbonDioxideScrubber * noCarbonDioxide) *
                  activeRate +
                atmOxygenRate;
              //Need to take into account fires on the ship
              let newAtmNitrogen =
                atmNitrogen +
                nitrogenTransfer *
                  nitrogenRate *
                  activeRate *
                  nitrogenTankEmpty +
                atmNitrogenRate;
              let newAtmCarbonDioxide =
                atmCarbonDioxide +
                oxygenConsumptionRate -
                carbonDioxideScrubber * activeRate * noCarbonDioxide +
                atmCarbonDioxideRate;

              const oldPressure =
                (newAtmOxygen + newAtmCarbonDioxide + newAtmNitrogen) / 100;
              const pressureRate =
                (oldPressure + atmPressureRate) / oldPressure;

              newAtmOxygen = newAtmOxygen * pressureRate;
              newAtmCarbonDioxide = newAtmCarbonDioxide * pressureRate;
              newAtmNitrogen = newAtmNitrogen * pressureRate;

              const newAtmPressure =
                (newAtmOxygen + newAtmCarbonDioxide + newAtmNitrogen) / 100;

              const totalAtmosphere =
                newAtmOxygen + newAtmNitrogen + newAtmCarbonDioxide;

              let newAtmHumidity =
                atmHumidity +
                humidifier * humidifierRate * activeRate +
                atmHumidityRate;
              let newAtmTemperature =
                atmTemperature +
                heater * heaterRate * activeRate +
                atmTemperatureRate; //Maybe more to either randomly affect it, or affected by humidity

              let percentOxygen = newAtmOxygen / totalAtmosphere;
              let percentNitrogen = newAtmNitrogen / totalAtmosphere;
              let percentCarbonDioxide = newAtmCarbonDioxide / totalAtmosphere;

              if (newAtmOxygen < 0) {
                newAtmOxygen = 0;
              }
              d.environment.update({atmOxygen: newAtmOxygen});
              if (newAtmNitrogen < 0) {
                newAtmNitrogen = 0;
              }
              d.environment.update({atmNitrogen: newAtmNitrogen});
              if (newAtmCarbonDioxide < 0) {
                newAtmCarbonDioxide = 0;
              }
              d.environment.update({atmCarbonDioxide: newAtmCarbonDioxide});

              if (newAtmHumidity < 0) {
                newAtmHumidity = 0;
              } else if (newAtmHumidity > 1) {
                newWasteTank = newWasteTank + 0.01;
                if (newWasteTank < 0) {
                  newWasteTank = 0;
                } else if (newWasteTank > wasteTankMax) {
                  newWasteTank = wasteTankMax;
                }
                lifeSupport.updateLifeSupport({wasteTank: newWasteTank});
                newAtmHumidity = 1;
              }
              d.environment.update({percentOxygen: percentOxygen});
              d.environment.update({
                percentCarbonDioxide: percentCarbonDioxide,
              });
              d.environment.update({percentNitrogen: percentNitrogen});
              d.environment.update({atmTemperature: newAtmTemperature});
              d.environment.update({atmPressure: newAtmPressure});
              d.environment.update({atmHumidity: newAtmHumidity});

              if (percentOxygen < 0.2 || percentOxygen > 0.22) {
                warning = true;
              }
              if (percentCarbonDioxide > 0.001) {
                warning = true;
              }
              if (percentNitrogen < 0.78 || percentNitrogen > 0.8) {
                warning = true;
              }
              if (newAtmTemperature < 65 || newAtmTemperature > 80) {
                warning = true;
              }
              if (newAtmPressure < 0.8 || newAtmPressure > 1.2) {
                warning = true;
              }
              if (newAtmHumidity < 0.3 || newAtmHumidity > 0.7) {
                warning = true;
              }
              if (d.environment.atmContamination !== "None") {
                warning = true;
              }
            });
          let allLifeSupports = [];
          App.simulators.forEach(s => {
            allLifeSupports.push(s.lifeSupport);
          });
          pubsub.publish("decksUpdate", App.decks);
          pubsub.publish("lifeSupportUpdate", allLifeSupports);
          const currentLifeSupport = allLifeSupports.find(
            l => l.simulatorId === sim.id,
          );
          if (warning === true) {
            triggerWarning(currentLifeSupport)(currentLifeSupport);
          }
        });
    });
  setTimeout(EnvironmentProcess, 1000);
};

/*
const EnvironmentWarning = () => {
  let warningLevel1 = [];
  let warningLevel2 = [];
  let warningLevel3 = [];
  let warningLevel4 = [];
  let warningLevel5 = [];

  App.flights
    .filter(f => f.running === true)
    .forEach(f => {
      f.simulators
        .map(s => App.simulators.find(sim => sim.id === s))
        .forEach(s => {
          App.decks
            .filter(d => d.simulatorId === s.id)
            .forEach(d => {
              let oxygenLevel = d.environment.atmOxygen;
              if (oxygenLevel < 0.1) {
                warningLevel5.push(d.number);
                //Will occur after 10 minutes of no life support
              } else if (oxygenLevel < 0.12) {
                warningLevel4.push(d.number);
                //Will occur after 21 minutes of no life support
              } else if (oxygenLevel < 0.15) {
                warningLevel3.push(d.number);
                //Will occur after 66 minutes of no life support
              } else if (oxygenLevel < 0.19) {
                warningLevel2.push(d.number);
                //Will occur after 99 minutes of no life support
              } else if (oxygenLevel < 0.2) {
                warningLevel1.push(d.number);
                //Will occur after 121 minutes of no life support
              }
            });

          warningLevel1.sort(function(a, b) {
            return a - b;
          });

          warningLevel2.sort(function(a, b) {
            return a - b;
          });

          warningLevel3.sort(function(a, b) {
            return a - b;
          });

          warningLevel4.sort(function(a, b) {
            return a - b;
          });

          warningLevel5.sort(function(a, b) {
            return a - b;
          });

          if (warningLevel1.length !== 0) {
            console.log(
              "Oxygen levels detrimental to long term health on deck(s):",
            );
            console.log(warningLevel1.join(", "));

            
                        const stations = s.stations.filter(s =>
                            s.cards.find(c => c.component === "ReactorControl"),
                        );
                        stations.forEach(s =>
                            pubsub.publish("notify", {
                            id: uuid.v4(),
                            simulatorId: s.simulatorId,
                            type: "Reactor",
                            station: s.name,
                            title: `Reactor Overheating`,
                            body: "Please cool the main reactor.",
                            color: "danger",
                            relevantCards: ["ReactorControl"],
                            }),
                        );

                        pubsub.publish("notify", {
                            id: uuid.v4(),
                            simulatorId: s.simulatorId,
                            type: "Reactor",
                            station: "Core",
                            title: `Reactor Overheating`,
                            body: "",
                            color: "danger",
                        });
                        
                        App.handleEvent(
                            {
                            simulatorId: s.simulatorId,
                            component: "HeatCore",
                            title: `Reactor Overheating`,
                            body: null,
                            color: "danger",
                            },
                            "addCoreFeed",
                        );
          }

          if (warningLevel2.length !== 0) {
            console.log(
              "Due to low Oxygen levels: Impared thinking and attention likely on deck(s):",
            );
            console.log(warningLevel2.join(", "));
          }
          if (warningLevel3.length !== 0) {
            console.log(
              "Due to low Oxygen levels: Poor Judgement likely on deck(s):",
            );
            console.log(warningLevel3.join(", "));
          }
          if (warningLevel4.length !== 0) {
            console.log(
              "Due to low Oxygen levels: Fainting, nausea, and vomiting likely on deck(s)",
            );
            console.log(warningLevel4.join(", "));
          }
          if (warningLevel5.length !== 0) {
            console.log("Due to low Oxygen levels: Death imminent on deck(s)");
            console.log(warningLevel5.join(", "));
          }
        });
    });

  setTimeout(EnvironmentWarning, 300000);
  //After testing, reset it to 300000
};*/

const throttles = {};
const triggerWarning = sys => {
  if (!throttles[sys.id]) {
    throttles[sys.id] = throttle(sys => {
      pubsub.publish("notify", {
        id: uuid.v4(),
        simulatorId: sys.simulatorId,
        type: "Life Supprt",
        station: "Core",
        title: `Life Support Problem (See Core for more Information)`,
        body: "",
        color: "danger",
      });
      App.handleEvent(
        {
          simulatorId: sys.simulatorId,
          component: "EnvironmentCore",
          title: `Life Support Problem (See Core for more Information)`,
          body: null,
          color: "danger",
        },
        "addCoreFeed",
      );
    }, 60 * 1000);
  }
  return throttles[sys.id];
};

EnvironmentProcess();
