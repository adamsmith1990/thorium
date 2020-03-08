import App from "../app";
import {pubsub} from "../helpers/subscriptionManager";
import uuid from "uuid";

const EnvironmentProcess = () => {
  App.flights
    .filter(f => f.running === true)
    .forEach(f => {
      //Make an array of all the simulators that are in use
      f.simulators
        .map(s => App.simulators.find(sim => sim.id === s))
        .forEach(sim => {
          const simId = sim.id;
          //Get everything that can affect oxygen to C02 transfer rate
          let oxygenConsumptionRate = 0.000015;
          //*100 for testing
          let currentSimulator = App.simulators.find(a => a.id === simId);
          let currentAlert = currentSimulator.alertLevel;
          //Taking Damage

          //Size of Ship (Not used)

          //Amount of People
          let bridgeCrew = currentSimulator.ship.bridgeCrew;
          currentSimulator.ship.extraPeople = 10;
          let extraPeople = currentSimulator.ship.extraPeople;
          let crewCount = App.crew.filter(a => a.simulatorId === simId).length;
          let extraOxygenRatio =
            (bridgeCrew + crewCount + extraPeople) / (bridgeCrew + crewCount);

          oxygenConsumptionRate *= extraOxygenRatio;

          if (currentAlert == 1) {
            oxygenConsumptionRate *= 1.01;
          }
          if (currentAlert == 2) {
            oxygenConsumptionRate *= 1.006;
          }
          if (currentAlert == 3) {
            oxygenConsumptionRate *= 1.003;
          }
          if (currentAlert == 4) {
            oxygenConsumptionRate *= 1.001;
          }

          let waterTank = App.lifesupport;
          //console.log(waterTank);

          //Get the decks on the active simulators
          App.decks
            .filter(d => d.simulatorId === simId)
            .forEach(d => {
              //Here is where we make adjustment to running environments
              let oldOxygen = d.environment.oxygen;
              let oldNitrogen = d.environment.nitrogen;
              let oldTrace = d.environment.trace;
              let oldPressure = d.environment.pressure;
              let oldTemperature = d.environment.temperature;
              let oldHumidity = d.environment.humidity;
              let oldCarbonDioxide = d.environment.carbonDioxide;
              let oldWater = d.environment.water;
              let oldWaste = d.environment.waste;
              //Hydrogen

              let waterToWaste = d.environment.waterToWaste;
              let filtration = d.environment.filtration;
              let purification = d.environment.purification;
              let humidification = d.environment.humidification;
              let electrolysis = d.environment.electrolysis;
              let oxygenInjector = d.environment.oxygenInjector;
              let nitrogenInjector = d.environment.nitrogenInjector;
              let c02Scrubber = d.environment.c02Scrubber;
              let heater = d.environment.heater;

              d.environment.update({
                oxygen: Math.min(
                  Math.max(
                    Math.round(
                      (oldOxygen - oxygenConsumptionRate + oxygenInjector) *
                        1000000,
                    ) / 1000000,
                    0,
                  ),
                  0.201,
                ),
              });
              d.environment.update({nitrogen: oldNitrogen + nitrogenInjector});
              d.environment.update({trace: oldTrace});
              d.environment.update({pressure: oldPressure});
              d.environment.update({temperature: oldTemperature + heater});
              d.environment.update({humidity: oldHumidity + humidification});
              d.environment.update({
                carbonDioxide: Math.max(
                  Math.round(
                    (oldCarbonDioxide +
                      oxygenConsumptionRate -
                      oxygenInjector) *
                      1000000,
                  ) / 1000000,
                  0,
                ),
              });
              d.environment.update({water: oldWater + waterToWaste});
              d.environment.update({waste: oldWaste - waterToWaste});

              console.log(d.environment.oxygen);
            });
        });
    });
  setTimeout(EnvironmentProcess, 1000);
};

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
              let oxygenLevel = d.environment.oxygen;
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

            /*
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
                        );*/
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
};

EnvironmentProcess();
EnvironmentWarning();
