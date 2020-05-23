import App from "../app";
import {pubsub} from "../helpers/subscriptionManager";

App.on("updateLifeSupport", ({life}) => {
  let allLifeSupports = [];
  App.simulators.forEach(s => {
    allLifeSupports.push(s.lifeSupport);
  });
  const lifeSupport = allLifeSupports.find(l => {
    if (life.id) {
      return l.id === life.id;
    }
    if (life.simulatorId) {
      return l.simulatorId === life.simulatorId;
    }
    return null;
  });
  lifeSupport.updateLifeSupport(life);
  pubsub.publish("lifeSupportUpdate", allLifeSupports);
});

App.on("updateTankValues", life => {
  let allLifeSupports = [];
  const which = life.which;
  const value = life.value;
  App.simulators.forEach(s => {
    allLifeSupports.push(s.lifeSupport);
  });
  const lifeSupport = allLifeSupports.find(
    l => l.simulatorId === life.simulatorId,
  );
  if (which === "waterTank") {
    lifeSupport.updateLifeSupport({waterTank: value});
  }
  if (which === "wasteTank") {
    lifeSupport.updateLifeSupport({wasteTank: value});
  }
  if (which === "hydrogenTank") {
    lifeSupport.updateLifeSupport({hydrogenTank: value});
  }
  if (which === "oxygenTank") {
    lifeSupport.updateLifeSupport({oxygenTank: value});
  }
  if (which === "nitrogenTank") {
    lifeSupport.updateLifeSupport({nitrogenTank: value});
  }
  if (which === "waterTankRate") {
    lifeSupport.updateLifeSupport({waterTankRate: value});
  }
  if (which === "wasteTankRate") {
    lifeSupport.updateLifeSupport({wasteTankRate: value});
  }
  if (which === "hydrogenTankRate") {
    lifeSupport.updateLifeSupport({hydrogenTankRate: value});
  }
  if (which === "oxygenTankRate") {
    lifeSupport.updateLifeSupport({oxygenTankRate: value});
  }
  if (which === "nitrogenTankRate") {
    lifeSupport.updateLifeSupport({nitrogenTankRate: value});
  }
  pubsub.publish("lifeSupportUpdate", allLifeSupports);
});

App.on("resetTankValues", simulator => {
  let allLifeSupports = [];
  App.simulators.forEach(s => {
    allLifeSupports.push(s.lifeSupport);
  });
  const lifeSupport = allLifeSupports.find(
    s => s.simulatorId === simulator.simulatorId,
  );
  lifeSupport.reset();
  pubsub.publish("lifeSupportUpdate", allLifeSupports);
});

App.on("updateAnyLifeSupport", life => {
  let allLifeSupports = [];
  const which = life.which;
  const value = life.value;
  const simulatorId = life.simulatorId;
  App.simulators.forEach(s => {
    allLifeSupports.push(s.lifeSupport);
  });
  const lifeSupport = allLifeSupports.find(l => l.simulatorId === simulatorId);

  if (which === "waterTank") {
    lifeSupport.updateLifeSupport({waterTank: parseFloat(value)});
  }
  if (which === "wasteTank") {
    lifeSupport.updateLifeSupport({wasteTank: parseFloat(value)});
  }
  if (which === "hydrogenTank") {
    lifeSupport.updateLifeSupport({hydrogenTank: parseFloat(value)});
  }
  if (which === "oxygenTank") {
    lifeSupport.updateLifeSupport({oxygenTank: parseFloat(value)});
  }
  if (which === "nitrogenTank") {
    lifeSupport.updateLifeSupport({nitrogenTank: parseFloat(value)});
  }
  if (which === "waterTankRate") {
    lifeSupport.updateLifeSupport({waterTankRate: parseFloat(value)});
  }
  if (which === "wasteTankRate") {
    lifeSupport.updateLifeSupport({wasteTankRate: parseFloat(value)});
  }
  if (which === "hydrogenTankRate") {
    lifeSupport.updateLifeSupport({hydrogenTankRate: parseFloat(value)});
  }
  if (which === "oxygenTankRate") {
    lifeSupport.updateLifeSupport({oxygenTankRate: parseFloat(value)});
  }
  if (which === "nitrogenTankRate") {
    lifeSupport.updateLifeSupport({nitrogenTankRate: parseFloat(value)});
  }
  if (which === "oxygenTransfer") {
    lifeSupport.updateLifeSupport({oxygenTransfer: parseFloat(value)});
  }
  if (which === "oxygenDirection") {
    lifeSupport.updateLifeSupport({oxygenDirection: value});
  }
  if (which === "nitrogenTransfer") {
    lifeSupport.updateLifeSupport({nitrogenTransfer: parseFloat(value)});
  }
  if (which === "nitrogenDirection") {
    lifeSupport.updateLifeSupport({nitrogenDirection: value});
  }
  if (which === "electrolysis") {
    lifeSupport.updateLifeSupport({electrolysis: parseFloat(value)});
  }
  if (which === "electrolysisDirection") {
    lifeSupport.updateLifeSupport({electrolysisDirection: value});
  }
  if (which === "humidifier") {
    lifeSupport.updateLifeSupport({humidifier: parseFloat(value)});
  }
  if (which === "humidifierDirection") {
    lifeSupport.updateLifeSupport({humidifierDirection: value});
  }
  if (which === "heater") {
    lifeSupport.updateLifeSupport({heater: parseFloat(value)});
  }
  if (which === "heaterDirection") {
    lifeSupport.updateLifeSupport({heaterDirection: value});
  }
  if (which === "filter") {
    lifeSupport.updateLifeSupport({filter: parseFloat(value)});
  }
  if (which === "carbonDioxideScrubber") {
    lifeSupport.updateLifeSupport({carbonDioxideScrubber: parseFloat(value)});
  }
  if (which === "cleanContaminant") {
    lifeSupport.updateLifeSupport({cleanContaminant: value});
  }
  if (which === "activeDeck") {
    lifeSupport.updateLifeSupport({activeDeck: value});
  }

  pubsub.publish("lifeSupportUpdate", allLifeSupports);
});
