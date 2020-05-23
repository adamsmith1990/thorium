import React, {Component} from "react";
import {graphql, withApollo} from "react-apollo";
import gql from "graphql-tag.macro";
import SubscriptionHelper from "helpers/subscriptionHelper";
import {Table} from "helpers/reactstrap";
import {InputField} from "../../generic/core";

const fragments = {
  deckFragment: gql`
    fragment EnvironmentDeckCoreData on Deck {
      id
      simulatorId
      number
      environment {
        atmOxygen
        atmNitrogen
        atmCarbonDioxide
        atmHumidity
        atmTemperature
        atmPressure
        atmOxygenRate
        atmNitrogenRate
        atmCarbonDioxideRate
        atmHumidityRate
        atmTemperatureRate
        atmPressureRate
        atmContamination
        percentOxygen
        percentNitrogen
        percentCarbonDioxide
      }
    }
  `,
  lifeSupportFragment: gql`
    fragment LifeSupportCoreData on LifeSupport {
      waterTank
      wasteTank
      hydrogenTank
      oxygenTank
      nitrogenTank
      waterTankRate
      wasteTankRate
      hydrogenTankRate
      oxygenTankRate
      nitrogenTankRate
      oxygenTransfer
      oxygenDirection
      nitrogenTransfer
      nitrogenDirection
      electrolysis
      electrolysisDirection
      humidifier
      humidifierDirection
      heater
      heaterDirection
      filter
      carbonDioxideScrubber
      cleanContaminant
      activeDeck
    }
  `,
};

export const DECK_CORE_SUB = gql`
  subscription DeckSubscribe($simulatorId: ID!) {
    decksUpdate(simulatorId: $simulatorId) {
      ...EnvironmentDeckCoreData
    }
  }
  ${fragments.deckFragment}
`;

export const LIFESUPPORT_CORE_SUB = gql`
  subscription DeckSubscribe($simulatorId: ID!) {
    lifeSupportUpdate(simulatorId: $simulatorId) {
      ...LifeSupportCoreData
    }
  }
  ${fragments.lifeSupportFragment}
`;

class EnvironmentDecks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDeck: null,
    };
  }

  /*componentDidMount() {
    const decks = this.props.decks;
    console.log(this.props.decks);
    if(decks) {
      const firstDeck = decks[0];
      this.setState({selectedDeck: firstDeck});
    }
    
    decks.concat().sort((a,b) => {
      if (a.number > b.number) return 1;
      if (a.number < b.number) return -1;
      return 0;
    });
    //const firstDeck = sortedDecks[0];
  }*/

  /*componentDidMount() {
    this.props.data.subscribeToMore({
      document: DECK_CORE_SUB,
      variables: {
        simulatorId: this.props.simulator.id,
      },
      updateQuery: (previousResult, {subscriptionData}) => {
        return Object.assign({}, previousResult, {
          decks: subscriptionData.data.decksUpdate,
        });
      },
    });
  }*/
  /*
  componentWillUnmount() {
    this.sub && this.sub();
  }*/

  _selectDeck(deck) {
    this.setState({
      selectedDeck: deck,
    });
  }

  updateTankValues = (simulatorId, which, value) => {
    const variables = {
      simulatorId: simulatorId,
      which: which,
      value: value,
    };
    const mutation = gql`
      mutation updateTankValues(
        $simulatorId: ID!
        $which: String!
        $value: Float!
      ) {
        updateTankValues(
          simulatorId: $simulatorId
          which: $which
          value: $value
        )
      }
    `;
    this.props.client.mutate({
      mutation,
      variables,
    });
  };

  updateEnvironmentValues = (deckID, which, value) => {
    const variables = {
      deckID: deckID,
      which: which,
      value: value,
    };
    const mutation = gql`
      mutation updateEnvironmentValues(
        $deckID: ID!
        $which: String!
        $value: Float!
      ) {
        updateEnvironmentValues(deckID: $deckID, which: $which, value: $value)
      }
    `;
    this.props.client.mutate({
      mutation,
      variables,
    });
  };

  resetTankValues = simulatorId => {
    const variables = {
      simulatorId: simulatorId,
    };
    const mutation = gql`
      mutation resetTankValues($simulatorId: ID!) {
        resetTankValues(simulatorId: $simulatorId)
      }
    `;
    this.props.client.mutate({
      mutation,
      variables,
    });
  };

  resetEnvironmentValues = deckID => {
    const variables = {
      deckID: deckID,
    };
    const mutation = gql`
      mutation resetEnvironmentValues($deckID: ID!) {
        resetEnvironmentValues(deckID: $deckID)
      }
    `;
    this.props.client.mutate({
      mutation,
      variables,
    });
  };

  resetAllEnvironments = () => {
    const decks = this.props.data.decks;
    decks.forEach(d => {
      this.resetEnvironmentValues(d.id);
    });
  };

  updatePressure = (deck, pressure, oxygen, carbonDioxide, Nitrogen) => {
    const oldPressure = (oxygen + carbonDioxide + Nitrogen + 1) / 100;
    const pressureRate = pressure / oldPressure;
    const newRate =
      pressureRate + (pressureRate - 1) / (oxygen + carbonDioxide + Nitrogen);
    const newPressure =
      (oxygen * newRate + carbonDioxide * newRate + Nitrogen * newRate + 1) /
      100;
    const variables = {
      deckID: deck,
      atmOxygen: oxygen * newRate,
      atmCarbonDioxide: carbonDioxide * newRate,
      atmNitrogen: Nitrogen * newRate,
      atmPressure: newPressure,
    };
    const mutation = gql`
      mutation updateEnvironment(
        $deckID: ID!
        $atmOxygen: Float!
        $atmCarbonDioxide: Float!
        $atmNitrogen: Float!
        $atmPressure: Float!
      ) {
        updateEnvironment(
          deckID: $deckID
          environment: {
            atmOxygen: $atmOxygen
            atmCarbonDioxide: $atmCarbonDioxide
            atmNitrogen: $atmNitrogen
            atmPressure: $atmPressure
          }
        )
      }
    `;
    this.props.client.mutate({
      mutation,
      variables,
    });
  };

  updateContamination = (deck, contamination) => {
    const variables = {
      deckID: deck,
      atmContamination: contamination,
    };
    const mutation = gql`
      mutation updateEnvironment($deckID: ID!, $atmContamination: String!) {
        updateEnvironment(
          deckID: $deckID
          environment: {atmContamination: $atmContamination}
        )
      }
    `;
    this.props.client.mutate({
      mutation,
      variables,
    });
  };

  render() {
    if (
      this.props.data.loading ||
      !this.props.data.decks ||
      !this.props.data.lifeSupport
    )
      return null;
    const decks = this.props.data.decks;
    const simulator = this.props.simulator.id;
    const lifeSupport = this.props.data.lifeSupport[0];

    //Set the initial state of dropdown to automatically be the first level
    const sortedDecks = decks.concat().sort((a, b) => {
      if (a.number > b.number) return 1;
      if (a.number < b.number) return -1;
      return 0;
    });
    const firstDeck = sortedDecks[0];
    if (firstDeck) {
      //this._selectDeck(this.state.selectedDeck || firstDeck.id);
      this.state.selectedDeck = this.state.selectedDeck || firstDeck.id;
      //this.setState({selectedDeck: this.state.selectedDeck || firstDeck.id});
    }

    let deck;
    if (this.state.selectedDeck) {
      deck = decks.find(d => d.id === this.state.selectedDeck);
    }

    let decksWithErrors = [];

    decks.forEach(d => {
      const percentOxygen = d.environment.percentOxygen;
      const percentCarbonDioxide = d.environment.percentCarbonDioxide;
      const percentNitrogen = d.environment.percentNitrogen;
      const atmHumidity = d.environment.atmHumidity;
      const atmTemperature = d.environment.atmTemperature;
      const atmPressure = d.environment.atmPressure;
      const atmContamination = d.environment.atmContamination;
      const errorPresent = () => {
        if (percentOxygen < 0.2 || percentOxygen > 0.22) {
          return true;
        }
        if (percentCarbonDioxide > 0.001) {
          return true;
        }
        if (percentNitrogen < 0.77 || percentNitrogen > 0.79) {
          return true;
        }
        if (atmHumidity < 0.3 || atmHumidity > 0.7) {
          return true;
        }
        if (atmTemperature < 65 || atmTemperature > 80) {
          return true;
        }
        if (atmPressure < 0.95 || atmPressure > 1.05) {
          return true;
        }
        if (atmContamination !== "None") {
          return true;
        }
        return false;
      };
      const checkError = errorPresent();
      if (checkError === true) {
        decksWithErrors.push(d.number);
      }
    });

    decksWithErrors = decksWithErrors
      .sort((a, b) => {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      })
      .map(d => d + " ");

    return (
      <div className="core-environmentDecks">
        <SubscriptionHelper
          subscribe={() =>
            this.props.data.subscribeToMore({
              document: DECK_CORE_SUB,
              variables: {
                simulatorId: this.props.simulator.id,
              },
              updateQuery: (previousResult, {subscriptionData}) => {
                return Object.assign({}, previousResult, {
                  decks: subscriptionData.data.decksUpdate,
                });
              },
            })
          }
        />
        <SubscriptionHelper
          subscribe={() =>
            this.props.data.subscribeToMore({
              document: LIFESUPPORT_CORE_SUB,
              variables: {
                simulatorId: this.props.simulator.id,
              },
              updateQuery: (previousResult, {subscriptionData}) => {
                return Object.assign({}, previousResult, {
                  lifeSupport: subscriptionData.data.lifeSupportUpdate,
                });
              },
            })
          }
        />
        <h6>Ship Life Support Resources:</h6>
        <button
          size="xs"
          value="Reset Tanks"
          onClick={value => this.resetTankValues(simulator)}
        >
          Reset All Tanks
        </button>
        <Table size="sm">
          <thead>
            <th>Tank</th>
            <th>Value</th>
            <th>Rate /Sec</th>
            <th>Max Value</th>
            <th>Reset</th>
          </thead>
          <tbody>
            <tr>
              <td>Water Tank:</td>
              <td>
                <InputField
                  prompt={`Set new water tank level`}
                  onClick={value =>
                    this.updateTankValues(simulator, "waterTank", value)
                  }
                >
                  {Math.round(lifeSupport.waterTank * 100) / 100}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new water tank rate`}
                  onClick={value =>
                    this.updateTankValues(simulator, "waterTankRate", value)
                  }
                >
                  {Math.round(lifeSupport.waterTankRate * 100) / 100}
                </InputField>
              </td>
              <td center="xs">10</td>
              <td>
                <button
                  onClick={value => {
                    this.updateTankValues(simulator, "waterTank", 10);
                    this.updateTankValues(simulator, "waterTankRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Waste Tank:</td>
              <td>
                <InputField
                  prompt={`Set new waste tank level`}
                  onClick={value =>
                    this.updateTankValues(simulator, "wasteTank", value)
                  }
                >
                  {Math.round(lifeSupport.wasteTank * 100) / 100}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new waste tank rate`}
                  onClick={value =>
                    this.updateTankValues(simulator, "wasteTankRate", value)
                  }
                >
                  {Math.round(lifeSupport.wasteTankRate * 100) / 100}
                </InputField>
              </td>
              <td center="xs">4</td>
              <td>
                <button
                  onClick={value => {
                    this.updateTankValues(simulator, "wasteTank", 0);
                    this.updateTankValues(simulator, "wasteTankRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Hydrogen Tank:</td>
              <td>
                <InputField
                  prompt={`Set new hydrogen tank level`}
                  onClick={value =>
                    this.updateTankValues(simulator, "hydrogenTank", value)
                  }
                >
                  {Math.round(lifeSupport.hydrogenTank * 100) / 100}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new hydrogen tank rate`}
                  onClick={value =>
                    this.updateTankValues(simulator, "hydrogenTankRate", value)
                  }
                >
                  {Math.round(lifeSupport.hydrogenTankRate * 100) / 100}
                </InputField>
              </td>
              <td center="xs">30</td>
              <td>
                <button
                  onClick={value => {
                    this.updateTankValues(simulator, "hydrogenTank", 20);
                    this.updateTankValues(simulator, "hydrogenTankRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Oxygen Tank:</td>
              <td>
                <InputField
                  prompt={`Set new oxygen tank level`}
                  onClick={value =>
                    this.updateTankValues(simulator, "oxygenTank", value)
                  }
                >
                  {Math.round(lifeSupport.oxygenTank * 100) / 100}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new oxygen tank rate`}
                  onClick={value =>
                    this.updateTankValues(simulator, "oxygenTankRate", value)
                  }
                >
                  {Math.round(lifeSupport.oxygenTankRate * 100) / 100}
                </InputField>
              </td>
              <td center="xs">10</td>
              <td>
                <button
                  onClick={value => {
                    this.updateTankValues(simulator, "oxygenTank", 10);
                    this.updateTankValues(simulator, "oxygenTankRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Nitrogen Tank:</td>
              <td>
                <InputField
                  prompt={`Set new nitrogen tank level`}
                  onClick={value =>
                    this.updateTankValues(simulator, "nitrogenTank", value)
                  }
                >
                  {Math.round(lifeSupport.nitrogenTank * 100) / 100}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new nitrogen tank rate`}
                  onClick={value =>
                    this.updateTankValues(simulator, "nitrogenTankRate", value)
                  }
                >
                  {Math.round(lifeSupport.nitrogenTankRate * 100) / 100}
                </InputField>
              </td>
              <td center="xs">78</td>
              <td>
                <button
                  onClick={value => {
                    this.updateTankValues(simulator, "nitrogenTank", 78);
                    this.updateTankValues(simulator, "nitrogenTankRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
          </tbody>
        </Table>
        <h6>Decks with Warnings: {decksWithErrors}</h6>
        <h6>
          Choose Deck:
          <select onChange={e => this._selectDeck(e.target.value)}>
            <optgroup>
              {decks
                .concat()
                .sort((a, b) => {
                  if (a.number > b.number) return 1;
                  if (a.number < b.number) return -1;
                  return 0;
                })
                .map(d => (
                  <option value={d.id} key={d.id}>
                    Deck {d.number}
                  </option>
                ))}
            </optgroup>
          </select>
        </h6>
        <button
          value="Reset Environment"
          onClick={value => this.resetEnvironmentValues(deck.id)}
        >
          Reset Deck {deck.number} Environment
        </button>
        <button
          value="Reset All Environments"
          onClick={value => this.resetAllEnvironments()}
        >
          Reset All Environments
        </button>
        <Table size="sm">
          <thead>
            <th>Variable</th>
            <th>Value</th>
            <th>Rate /Sec</th>
            <th>%</th>
            <th>Ideal Range</th>
            <th>Reset</th>
          </thead>
          <tbody>
            <tr>
              <td>Oxygen</td>
              <td>
                <InputField
                  prompt={`Set new oxygen for level ${deck.number}`}
                  alert={
                    deck.environment.percentOxygen < 0.2 ||
                    deck.environment.percentOxygen > 0.22
                  }
                  onClick={value =>
                    this.updateEnvironmentValues(deck.id, "atmOxygen", value)
                  }
                >
                  {Math.round(deck.environment.atmOxygen * 1000) / 1000}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new oxygen rate for level ${deck.number}`}
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmOxygenRate",
                      value,
                    )
                  }
                >
                  {Math.round(deck.environment.atmOxygenRate * 1000) / 1000}
                </InputField>
              </td>
              <td>
                {Math.round(deck.environment.percentOxygen * 10000) / 100}%
              </td>
              <td>
                20% {"<"} x {"<"} 22%
              </td>
              <td>
                <button
                  onClick={value => {
                    this.updateEnvironmentValues(deck.id, "atmOxygen", 21);
                    this.updateEnvironmentValues(deck.id, "atmOxygenRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Carbon Dioxide</td>
              <td>
                <InputField
                  prompt={`Set new carbon dioxide for level ${deck.number}`}
                  alert={deck.environment.percentCarbonDioxide > 0.001}
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmCarbonDioxide",
                      value,
                    )
                  }
                >
                  {Math.round(deck.environment.atmCarbonDioxide * 1000) / 1000}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new carbon dioxide rate for level ${deck.number}`}
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmCarbonDioxideRate",
                      value,
                    )
                  }
                >
                  {Math.round(deck.environment.atmCarbonDioxideRate * 1000) /
                    1000}
                </InputField>
              </td>
              <td>
                {Math.round(deck.environment.percentCarbonDioxide * 10000) /
                  100}
                %
              </td>
              <td>
                0% {"<"} x {"<"} 0.1%
              </td>
              <td>
                <button
                  onClick={value => {
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmCarbonDioxide",
                      0,
                    );
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmCarbonDioxideRate",
                      0,
                    );
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Nitrogen</td>
              <td>
                <InputField
                  prompt={`Set new nitrogen for level ${deck.number}`}
                  alert={
                    deck.environment.percentNitrogen < 0.77 ||
                    deck.environment.percentNitrogen > 0.79
                  }
                  onClick={value =>
                    this.updateEnvironmentValues(deck.id, "atmNitrogen", value)
                  }
                >
                  {Math.round(deck.environment.atmNitrogen * 1000) / 1000}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new nitrogen rate for level ${deck.number}`}
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmNitrogenRate",
                      value,
                    )
                  }
                >
                  {Math.round(deck.environment.atmNitrogenRate * 1000) / 1000}
                </InputField>
              </td>
              <td>
                {Math.round(deck.environment.percentNitrogen * 10000) / 100}%
              </td>
              <td>
                77% {"<"} x {"<"} 79%
              </td>
              <td>
                <button
                  onClick={value => {
                    this.updateEnvironmentValues(deck.id, "atmNitrogen", 78);
                    this.updateEnvironmentValues(deck.id, "atmNitrogenRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Humidity</td>
              <td>
                <InputField
                  prompt={`Set new humidity for level ${deck.number}`}
                  alert={
                    deck.environment.atmHumidity < 0.3 ||
                    deck.environment.atmHumidity > 0.7
                  }
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmHumidity",
                      value / 100,
                    )
                  }
                >
                  {Math.round(deck.environment.atmHumidity * 1000) / 10}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new humidity rate for level ${deck.number}`}
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmHumidityRate",
                      value,
                    )
                  }
                >
                  {Math.round(deck.environment.atmHumidityRate * 1000) / 1000}
                </InputField>
              </td>
              <td>{Math.round(deck.environment.atmHumidity * 10000) / 100}%</td>
              <td>
                30% {"<"} x {"<"} 70%
              </td>
              <td>
                <button
                  onClick={value => {
                    this.updateEnvironmentValues(deck.id, "atmHumidity", 0.45);
                    this.updateEnvironmentValues(deck.id, "atmOxygenRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Temperature</td>
              <td>
                <InputField
                  prompt={`Set new temperature for level ${deck.number}`}
                  alert={
                    deck.environment.atmTemperature < 65 ||
                    deck.environment.atmTemperature > 80
                  }
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmTemperature",
                      value,
                    )
                  }
                >
                  {Math.round(deck.environment.atmTemperature * 1000) / 1000}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new temperature rate for level ${deck.number}`}
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmTemperatureRate",
                      value,
                    )
                  }
                >
                  {Math.round(deck.environment.atmTemperatureRate * 1000) /
                    1000}
                </InputField>
              </td>
              <td>NA</td>
              <td>
                65° {"<"} x {"<"} 80°
              </td>
              <td>
                <button
                  onClick={value => {
                    this.updateEnvironmentValues(deck.id, "atmTemperature", 70);
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmTemperatureRate",
                      0,
                    );
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
            <tr>
              <td>Pressure</td>
              <td>
                <InputField
                  prompt={`Set new pressure for level ${deck.number}`}
                  alert={
                    deck.environment.atmPressure < 0.95 ||
                    deck.environment.atmPressure > 1.05
                  }
                  onClick={value =>
                    this.updatePressure(
                      deck.id,
                      value,
                      deck.environment.atmOxygen,
                      deck.environment.atmCarbonDioxide,
                      deck.environment.atmNitrogen,
                    )
                  }
                >
                  {Math.round(deck.environment.atmPressure * 1000) / 1000}
                </InputField>
              </td>
              <td>
                <InputField
                  prompt={`Set new pressure rate for level ${deck.number}`}
                  onClick={value =>
                    this.updateEnvironmentValues(
                      deck.id,
                      "atmPressureRate",
                      value,
                    )
                  }
                >
                  {Math.round(deck.environment.atmPressureRate * 1000) / 1000}
                </InputField>
              </td>
              <td>NA</td>
              <td>
                0.95 {"<"} x {"<"} 1.05
              </td>
              <td>
                <button
                  onClick={value => {
                    this.updateEnvironmentValues(deck.id, "atmPressure", 1);
                    this.updateEnvironmentValues(deck.id, "atmPressureRate", 0);
                  }}
                >
                  Reset
                </button>
              </td>
            </tr>
          </tbody>
        </Table>
        Current Contamination: {deck && deck.environment.atmContamination}{" "}
        <br />
        <button
          value="None"
          onClick={value => this.updateContamination(deck.id, "None")}
        >
          None
        </button>
        <button
          value="Acetone"
          onClick={value => this.updateContamination(deck.id, "Acetone")}
        >
          Acetone
        </button>
        <button
          value="Carbon Monoxide"
          onClick={value =>
            this.updateContamination(deck.id, "Carbon Monoxide")
          }
        >
          Carbon Monoxide
        </button>
        <button
          value="Ammonia"
          onClick={value => this.updateContamination(deck.id, "Ammonia")}
        >
          Ammonia
        </button>
        <button
          value="Methyl Alcohol"
          onClick={value => this.updateContamination(deck.id, "Methyl Alcohol")}
        >
          Methyl Alcohol
        </button>
        <button
          value="Hydrogen"
          onClick={value => this.updateContamination(deck.id, "Hydrogen")}
        >
          Hydrogen
        </button>
      </div>
    );
  }
}

export const LIFESUPPORT_CORE_QUERY = gql`
  query SimulatorDecks($simulatorId: ID!) {
    decks(simulatorId: $simulatorId) {
      ...EnvironmentDeckCoreData
    }
    lifeSupport(simulatorId: $simulatorId) {
      ...LifeSupportCoreData
    }
  }
  ${fragments.deckFragment}
  ${fragments.lifeSupportFragment}
`;

export default graphql(LIFESUPPORT_CORE_QUERY, {
  options: ownProps => ({
    fetchPolicy: "cache-and-network",
    variables: {
      simulatorId: ownProps.simulator.id,
    },
  }),
})(withApollo(EnvironmentDecks));
