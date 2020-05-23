import App from "../app";
import {pubsub} from "../helpers/subscriptionManager";

App.on("updateEnvironment", ({deckID, environment}) => {
  const deck = App.decks.find(d => d.id === deckID);
  const env = deck.environment;
  if (!env) return;
  env.update(environment);
  pubsub.publish("decksUpdate", App.decks);
});

App.on("updateEnvironmentValues", ({deckID, which, value}) => {
  const deck = App.decks.find(d => d.id === deckID);
  const env = deck.environment;
  if (!env) return;
  if (which === "atmOxygen") {
    env.update({atmOxygen: value});
  }
  if (which === "atmNitrogen") {
    env.update({atmNitrogen: value});
  }
  if (which === "atmCarbonDioxide") {
    env.update({atmCarbonDioxide: value});
  }
  if (which === "atmHumidity") {
    env.update({atmHumidity: value});
  }
  if (which === "atmTemperature") {
    env.update({atmTemperature: value});
  }
  if (which === "atmPressure") {
    env.update({atmPressure: value});
  }
  if (which === "atmOxygenRate") {
    env.update({atmOxygenRate: value});
  }
  if (which === "atmNitrogenRate") {
    env.update({atmNitrogenRate: value});
  }
  if (which === "atmCarbonDioxideRate") {
    env.update({atmCarbonDioxideRate: value});
  }
  if (which === "atmHumidityRate") {
    env.update({atmHumidityRate: value});
  }
  if (which === "atmTemperatureRate") {
    env.update({atmTemperatureRate: value});
  }
  if (which === "atmPressureRate") {
    env.update({atmPressureRate: value});
  }
  pubsub.publish("decksUpdate", App.decks);
});

App.on("resetEnvironmentValues", ({deckID}) => {
  const deck = App.decks.find(d => d.id === deckID);
  const env = deck.environment;
  env.reset();
  pubsub.publish("decksUpdate", App.decks);
});
