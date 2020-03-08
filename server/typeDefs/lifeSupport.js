import App from "../app";
import {gql, withFilter} from "apollo-server-express";
import {pubsub} from "../helpers/subscriptionManager";
const mutationHelper = require("../helpers/mutationHelper").default;
// We define a schema that encompasses all of the types
// necessary for the functionality in this file.
const schema = gql`
  type LifeSupport {
    id: ID
    simulatorId: ID
    waterTank: Float
    wasteTank: Float
    hydrogenTank: Float
    oxygenTank: Float
    nitrogenTank: Float
  }

  input LifeSupportInput {
    id: ID
    simulatorId: ID
    waterTank: Float
    wasteTank: Float
    hydrogenTank: Float
    oxygenTank: Float
    nitrogenTank: Float
  }

  extend type Query {
    lifeSupport(id: ID, simulatorId: ID): [LifeSupport]
  }
  extend type Mutation {
    createLifeSupport(life: LifeSupportInput!): String
    updateLifeSupport(life: LifeSupportInput!): String
    removeLifeSupport(life: ID!): String
  }
  extend type Subscription {
    lifeSupportUpdate(id: ID, simulatorId: ID): [LifeSupport]
  }
`;

const resolver = {
  Query: {
    lifeSupport(rootValue, {id, simulatorId}) {
      let lifeSupports = App.lifeSupports;
      if (id) {
        return lifeSupports.filter(l => l.id === id);
      }
      if (simulatorId) {
        lifeSupports = lifeSupports.filter(l => l.simulatorId === simulatorId);
      }
      return lifeSupports;
    },
  },
  Mutation: mutationHelper(schema),
  Subscription: {
    lifeSupportUpdate: {
      resolve(rootValue, {id, simulatorId}) {
        let lifeSupports = rootValue;
        if (id) {
          return lifeSupports.filter(l => l.id === id);
        }
        if (simulatorId) {
          lifeSupports = lifeSupports.filter(
            l => l.simulatorId === simulatorId,
          );
        }
        return lifeSupports.length && lifeSupports;
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
