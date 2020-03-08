import {gql} from "apollo-server-express";
const mutationHelper = require("../helpers/mutationHelper").default;
// We define a schema that encompasses all of the types
// necessary for the functionality in this file.
const schema = gql`
  type Environment {
    id: ID
    oxygen: Float
    nitrogen: Float
    trace: Float
    pressure: Float
    temperature: Float
    humidity: Float
    gravity: Float
    carbonDioxide: Float
    water: Float
    waste: Float
    waterToWaste: Float
    filtration: Float
    purification: Float
    humidification: Float
    electrolysis: Float
    oxygenInjector: Float
    nitrogenInjector: Float
    c02Scrubber: Float
    heater: Float
  }
  input EnvironmentInput {
    id: ID
    oxygen: Float
    nitrogen: Float
    trace: Float
    pressure: Float
    temperature: Float
    humidity: Float
    gravity: Float
    carbonDioxide: Float
    water: Float
    waste: Float
    waterToWaste: Float
    filtration: Float
    purification: Float
    humidification: Float
    electrolysis: Float
    oxygenInjector: Float
    nitrogenInjector: Float
    c02Scrubber: Float
    heater: Float
  }

  extend type Mutation {
    updateEnvironment(deckID: ID!, environment: EnvironmentInput): String
  }
`;

const resolver = {
  Mutation: mutationHelper(schema),
};

export default {schema, resolver};
