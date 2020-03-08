import App from "../app";
import {pubsub} from "../helpers/subscriptionManager";
import * as Classes from "../classes";

App.on("createLifeSupport", ({life}) => {
  const lifeSupport = new Classes.LifeSupport(life);
  App.lifeSupports.push(lifeSupport);
  pubsub.publish("lifeSupportUpdate", App.lifeSupports);
});
App.on("updateLifeSupport", ({life}) => {
  const lifeSupport = App.lifeSupports.find(d => {
    if (life.id) {
      return d.id === life.id;
    }
    let tf = true;
    if (life.simulatorId) {
      tf = life.simulatorId === d.simulatorId;
    }
    return tf;
  });
  lifeSupport.updateLifeSupport(life);
  pubsub.publish("lifeSupportUpdate", App.lifeSupports);
});
App.on("removeLifeSupport", ({life}) => {
  App.lifeSupports = App.lifeSupports.filter(d => d.id !== life);
  pubsub.publish("lifeSupportUpdate", App.lifeSupports);
});
