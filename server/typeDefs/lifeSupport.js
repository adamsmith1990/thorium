import App from "../app";
import {gql, withFilter} from "apollo-server-express";
import {pubsub} from "../helpers/subscriptionManager";
const mutationHelper = require("../helpers/mutationHelper").default;
// We define a schema that encompasses all of the types
// necessary for the functionality in this file.
// We may want to add a life support room and the possibility for damage later
const schema = gql`
  type LifeSupport {
    id: ID
    simulatorId: ID
    waterTank: Float
    wasteTank: Float
    hydrogenTank: Float
    oxygenTank: Float
    nitrogenTank: Float
    waterTankRate: Float
    wasteTankRate: Float
    hydrogenTankRate: Float
    oxygenTankRate: Float
    nitrogenTankRate: Float
    oxygenTransfer: Float
    oxygenDirection: String
    nitrogenTransfer: Float
    nitrogenDirection: String
    electrolysis: Float
    electrolysisDirection: String
    humidifier: Float
    humidifierDirection: String
    heater: Float
    heaterDirection: String
    filter: Float
    carbonDioxideScrubber: Float
    cleanContaminant: String
    activeDeck: ID
  }

  input LifeSupportInput {
    id: ID
    simulatorId: ID
    waterTank: Float
    wasteTank: Float
    hydrogenTank: Float
    oxygenTank: Float
    nitrogenTank: Float
    waterTankRate: Float
    wasteTankRate: Float
    hydrogenTankRate: Float
    oxygenTankRate: Float
    nitrogenTankRate: Float
    oxygenTransfer: Float
    oxygenDirection: String
    nitrogenTransfer: Float
    nitrogenDirection: String
    electrolysis: Float
    electrolysisDirection: String
    humidifier: Float
    humidifierDirection: String
    heater: Float
    heaterDirection: String
    filter: Float
    carbonDioxideScrubber: Float
    cleanContaminant: String
    activeDeck: ID
  }

  extend type Query {
    lifeSupport(id: ID, simulatorId: ID): [LifeSupport]
  }
  extend type Mutation {
    updateLifeSupport(life: LifeSupportInput!): String
    updateTankValues(simulatorId: ID!, which: String!, value: Float!): String
    resetTankValues(simulatorId: ID!): String
    """
    Macro: Environment: Change Life Support Values
    """
    updateAnyLifeSupport(
      simulatorId: ID!
      which: String!
      value: String!
    ): String
  }
  extend type Subscription {
    lifeSupportUpdate(simulatorId: ID!): [LifeSupport]
  }
`;

const resolver = {
  Query: {
    lifeSupport(rootValue, {id, simulatorId}) {
      let lifeSupport = [];
      App.simulators.forEach(s => {
        lifeSupport.push(s.lifeSupport);
      });
      if (id) {
        return lifeSupport.filter(l => l.id === id);
      }
      if (simulatorId) {
        lifeSupport = lifeSupport.filter(l => l.simulatorId === simulatorId);
      }
      return lifeSupport;
    },
  },
  Mutation: mutationHelper(schema),
  Subscription: {
    lifeSupportUpdate: {
      resolve(rootValue, {id, simulatorId}) {
        let lifeSupport = rootValue;
        if (id) {
          return lifeSupport.filter(l => l.id === id);
        }
        if (simulatorId) {
          lifeSupport = lifeSupport.filter(l => l.simulatorId === simulatorId);
        }
        return lifeSupport.length && lifeSupport;
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator("lifeSupportUpdate"),
        rootValue => {
          return !!(rootValue && rootValue.length);
        },
      ),
    },
  },
};

export default {schema, resolver};
