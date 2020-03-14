import App from "../app";
import {pubsub} from "../helpers/subscriptionManager";
//import * as Classes from "../classes";

/*App.on("createLifeSupport", ({life}) => {
  const lifeSupport = new Classes.LifeSupport(life);
  App.lifeSupport.push(lifeSupport);
  pubsub.publish("lifeSupportUpdate", allLifeSupports);
});*/
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
      return l.simulartoId === life.simulartoId;
    }
    return null;
  });
  lifeSupport.updateLifeSupport(life);
  pubsub.publish("lifeSupportUpdate", allLifeSupports);
});
/*App.on("removeLifeSupport", ({life}) => {

  App.lifeSupport = App.lifeSupport.filter(d => d.id !== life);
  pubsub.publish("lifeSupportUpdate", App.lifeSupport);
});*/
