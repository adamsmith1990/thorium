import {gql} from "apollo-server-express";
const mutationHelper = require("../helpers/mutationHelper").default;
// We define a schema that encompasses all of the types
// necessary for the functionality in this file.
const schema = gql`
  type Environment {
    id: ID
    atmOxygen: Float
    atmNitrogen: Float
    atmCarbonDioxide: Float
    atmHumidity: Float
    atmTemperature: Float
    atmPressure: Float
    atmOxygenRate: Float
    atmNitrogenRate: Float
    atmCarbonDioxideRate: Float
    atmHumidityRate: Float
    atmTemperatureRate: Float
    atmPressureRate: Float
    atmContamination: String
    percentOxygen: Float
    percentNitrogen: Float
    percentCarbonDioxide: Float
  }
  input EnvironmentInput {
    id: ID
    atmOxygen: Float
    atmNitrogen: Float
    atmCarbonDioxide: Float
    atmHumidity: Float
    atmTemperature: Float
    atmPressure: Float
    atmOxygenRate: Float
    atmNitrogenRate: Float
    atmCarbonDioxideRate: Float
    atmHumidityRate: Float
    atmTemperatureRate: Float
    atmPressureRate: Float
    atmContamination: String
    percentOxygen: Float
    percentNitrogen: Float
    percentCarbonDioxide: Float
  }

  extend type Mutation {
    updateEnvironment(deckID: ID!, environment: EnvironmentInput): String
    resetEnvironmentValues(deckID: ID!): String
    """
    Macro: Environment: Change Environment Values
    """
    updateEnvironmentValues(deckID: ID!, which: String!, value: Float!): String
  }
`;

const resolver = {
  Mutation: mutationHelper(schema),
};

export default {schema, resolver};
