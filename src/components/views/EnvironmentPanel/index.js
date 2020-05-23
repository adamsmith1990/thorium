import React, {Component} from "react";
import {graphql, withApollo} from "react-apollo";
import {Row, Col} from "helpers/reactstrap";
import Tour from "helpers/tourHelper";
import SubscriptionHelper from "helpers/subscriptionHelper";

import gql from "graphql-tag.macro";
import "./style.scss";

const trainingSteps = [
  {
    selector: ".nothing",
    content:
      "This screen allows you to see the status of each deck on the ship, as well as evacuating decks and sealing them off with bulkhead doors.",
  },
];

const fragments = {
  deckFragment: gql`
    fragment EnvironmentPanelData on Deck {
      id
      simulatorId
      number
      environment {
        atmOxygen
        atmNitrogen
        atmCarbonDioxide
        atmHumidity
        atmTemperature
        atmContamination
        percentOxygen
        percentNitrogen
        percentCarbonDioxide
        atmPressure
      }
    }
  `,
  lifeSupportFragment: gql`
    fragment LifeSupportData on LifeSupport {
      id
      simulatorId
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

export const DECK_SUB = gql`
  subscription DeckSubscribe($simulatorId: ID!) {
    decksUpdate(simulatorId: $simulatorId) {
      ...EnvironmentPanelData
    }
  }
  ${fragments.deckFragment}
`;

export const LIFESUPPORT_SUB = gql`
  subscription DeckSubscribe($simulatorId: ID!) {
    lifeSupportUpdate(simulatorId: $simulatorId) {
      ...LifeSupportData
    }
  }
  ${fragments.lifeSupportFragment}
`;

class EnvironmentPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  updateAnyLifeSupport = (simulator, which, value) => {
    const variables = {
      simulatorId: simulator,
      which: which,
      value: value,
    };
    const mutation = gql`
      mutation updateAnyLifeSupport(
        $simulatorId: ID!
        $which: String!
        $value: String!
      ) {
        updateAnyLifeSupport(
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

  cleanContamination = (deck, contamination) => {
    if (contamination === deck.environment.atmContamination) {
      const variables = {
        deckID: deck.id,
        atmContamination: "None",
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
    }
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
    const lifeSupport = this.props.data.lifeSupport.find(
      l => l.simulatorId === simulator,
    );

    let deck;
    if (lifeSupport.activeDeck) {
      deck = decks.find(d => d.id === lifeSupport.activeDeck);
    } else {
      deck = decks.find(d => d.number === 1);
    }

    const oxygenTransfer = lifeSupport.oxygenTransfer;
    const oxygenDirection = lifeSupport.oxygenDirection;
    const nitrogenTransfer = lifeSupport.nitrogenTransfer;
    const nitrogenDirection = lifeSupport.nitrogenDirection;
    const electrolysis = lifeSupport.electrolysis;
    const electrolysisDirection = lifeSupport.electrolysisDirection;
    const humidifier = lifeSupport.humidifier;
    const humidifierDirection = lifeSupport.humidifierDirection;
    const heater = lifeSupport.heater;
    const heaterDirection = lifeSupport.heaterDirection;
    const filter = lifeSupport.filter;
    const purification = lifeSupport.purification;
    const carbonDioxideScrubber = lifeSupport.carbonDioxideScrubber;

    return (
      <Row className="environment-decks">
        <SubscriptionHelper
          subscribe={() =>
            this.props.data.subscribeToMore({
              document: DECK_SUB,
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
              document: LIFESUPPORT_SUB,
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
        <Col>
          Guages:
          <Row>
            <Col>
              Waste Tank {Math.round((lifeSupport.wasteTank / 4) * 10)}/10
            </Col>
            <Col>Water Tank {Math.round(lifeSupport.waterTank)}/10</Col>
            <Col>
              Hydrogen Tank {Math.round(lifeSupport.hydrogenTank / 2)}/10
            </Col>
            <Col>Oxygen Tank {Math.round(lifeSupport.oxygenTank)}/10</Col>
            <Col>
              Nitrogen Tank {Math.round(lifeSupport.nitrogenTank / 78) * 10}/10
            </Col>
          </Row>
          <Row>
            <Col>
              Oxygen{" "}
              {Math.round(deck.environment.percentOxygen * 100 * 100) / 100}%
            </Col>
            <Col>
              Nitrogen{" "}
              {Math.round(deck.environment.percentNitrogen * 100 * 100) / 100}%
            </Col>
            <Col>
              Carbon Dioxide{" "}
              {Math.round(deck.environment.percentCarbonDioxide * 100 * 100) /
                100}
              %
            </Col>
            <Col>
              Humidity{" "}
              {Math.round(deck.environment.atmHumidity * 100 * 100) / 100}%
            </Col>
            <Col>
              Termperature{" "}
              {Math.round(deck.environment.atmTemperature * 100) / 100}°F
            </Col>
            <Col>
              Pressure {Math.round(deck.environment.atmPressure * 100) / 100}{" "}
              ATM
            </Col>
          </Row>
          <Row>
            <button
              size="xs"
              value="OxygenTransfer0"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "0")
              }
            >
              0
            </button>
            <button
              size="xs"
              value="OxygenTransfer1"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "1")
              }
            >
              1
            </button>
            <button
              size="xs"
              value="OxygenTransfer2"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "2")
              }
            >
              2
            </button>
            <button
              size="xs"
              value="OxygenTransfer3"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "3")
              }
            >
              3
            </button>
            <button
              size="xs"
              value="OxygenTransfer4"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "4")
              }
            >
              4
            </button>
            <button
              size="xs"
              value="OxygenTransfer5"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "5")
              }
            >
              5
            </button>
            <button
              size="xs"
              value="OxygenTransfer6"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "6")
              }
            >
              6
            </button>
            <button
              size="xs"
              value="OxygenTransfer7"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "7")
              }
            >
              7
            </button>
            <button
              size="xs"
              value="OxygenTransfer8"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "8")
              }
            >
              8
            </button>
            <button
              size="xs"
              value="OxygenTransfer9"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "9")
              }
            >
              9
            </button>
            <button
              size="xs"
              value="OxygenTransfer10"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenTransfer", "10")
              }
            >
              10
            </button>
            Oxygen Transfer Rate: {oxygenTransfer}
          </Row>
          <Row>
            <button
              size="xs"
              value="OxygenTransferReverse"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "oxygenDirection",
                  "Reverse",
                )
              }
            >
              Reverse
            </button>
            <button
              size="xs"
              value="OxygenTransferOff"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "oxygenDirection", "Off")
              }
            >
              Off
            </button>
            <button
              size="xs"
              value="OxygenTransferForward"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "oxygenDirection",
                  "Forward",
                )
              }
            >
              Forward
            </button>
            Oxygen Transfer Direction: {oxygenDirection}
          </Row>
          <Row>
            <button
              size="xs"
              value="NitrogenTransfer0"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "0")
              }
            >
              0
            </button>
            <button
              size="xs"
              value="NitrogenTransfer1"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "1")
              }
            >
              1
            </button>
            <button
              size="xs"
              value="NitrogenTransfer2"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "2")
              }
            >
              2
            </button>
            <button
              size="xs"
              value="NitrogenTransfer3"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "3")
              }
            >
              3
            </button>
            <button
              size="xs"
              value="NitrogenTransfer4"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "4")
              }
            >
              4
            </button>
            <button
              size="xs"
              value="NitrogenTransfer5"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "5")
              }
            >
              5
            </button>
            <button
              size="xs"
              value="NitrogenTransfer6"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "6")
              }
            >
              6
            </button>
            <button
              size="xs"
              value="NitrogenTransfer7"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "7")
              }
            >
              7
            </button>
            <button
              size="xs"
              value="NitrogenTransfer8"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "8")
              }
            >
              8
            </button>
            <button
              size="xs"
              value="NitrogenTransfer9"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "9")
              }
            >
              9
            </button>
            <button
              size="xs"
              value="NitrogenTransfer10"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenTransfer", "10")
              }
            >
              10
            </button>
            Nitrogen Transfer Rate: {nitrogenTransfer}
          </Row>
          <Row>
            <button
              size="xs"
              value="NitrogenTransferReverse"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "nitrogenDirection",
                  "Reverse",
                )
              }
            >
              Reverse
            </button>
            <button
              size="xs"
              value="NitrogenTransferOff"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "nitrogenDirection", "Off")
              }
            >
              Off
            </button>
            <button
              size="xs"
              value="NitrogenTransferForward"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "nitrogenDirection",
                  "Forward",
                )
              }
            >
              Forward
            </button>
            Nitrogen Transfer Direction: {nitrogenDirection}
          </Row>
          <Row>
            <button
              size="xs"
              value="Electrolysis0"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "0")
              }
            >
              0
            </button>
            <button
              size="xs"
              value="Electrolysis1"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "1")
              }
            >
              1
            </button>
            <button
              size="xs"
              value="Electrolysis2"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "2")
              }
            >
              2
            </button>
            <button
              size="xs"
              value="Electrolysis3"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "3")
              }
            >
              3
            </button>
            <button
              size="xs"
              value="Electrolysis4"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "4")
              }
            >
              4
            </button>
            <button
              size="xs"
              value="Electrolysis5"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "5")
              }
            >
              5
            </button>
            <button
              size="xs"
              value="Electrolysis6"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "6")
              }
            >
              6
            </button>
            <button
              size="xs"
              value="Electrolysis7"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "7")
              }
            >
              7
            </button>
            <button
              size="xs"
              value="Electrolysis8"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "8")
              }
            >
              8
            </button>
            <button
              size="xs"
              value="Electrolysis9"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "9")
              }
            >
              9
            </button>
            <button
              size="xs"
              value="Electrolysis10"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "electrolysis", "10")
              }
            >
              10
            </button>
            Electrolysis Rate: {electrolysis}
          </Row>
          <Row>
            <button
              size="xs"
              value="ElectrolysisReverse"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "electrolysisDirection",
                  "Reverse",
                )
              }
            >
              Reverse
            </button>
            <button
              size="xs"
              value="ElectrolysisOff"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "electrolysisDirection",
                  "Off",
                )
              }
            >
              Off
            </button>
            <button
              size="xs"
              value="ElectrolysisForward"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "electrolysisDirection",
                  "Forward",
                )
              }
            >
              Forward
            </button>
            Electrolysis Direction: {electrolysisDirection}
          </Row>
          <Row>
            <button
              size="xs"
              value="Humidifier0"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "0")
              }
            >
              0
            </button>
            <button
              size="xs"
              value="Humidifier1"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "1")
              }
            >
              1
            </button>
            <button
              size="xs"
              value="Humidifier2"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "2")
              }
            >
              2
            </button>
            <button
              size="xs"
              value="Humidifier3"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "3")
              }
            >
              3
            </button>
            <button
              size="xs"
              value="Humidifier4"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "4")
              }
            >
              4
            </button>
            <button
              size="xs"
              value="Humidifier5"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "5")
              }
            >
              5
            </button>
            <button
              size="xs"
              value="Humidifier6"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "6")
              }
            >
              6
            </button>
            <button
              size="xs"
              value="Humidifier7"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "7")
              }
            >
              7
            </button>
            <button
              size="xs"
              value="Humidifier8"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "8")
              }
            >
              8
            </button>
            <button
              size="xs"
              value="Humidifier9"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "9")
              }
            >
              9
            </button>
            <button
              size="xs"
              value="Humidifier10"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "humidifier", "10")
              }
            >
              10
            </button>
            Humidifier Rate: {humidifier}
          </Row>
          <Row>
            <button
              size="xs"
              value="HumidifierReverse"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "humidifierDirection",
                  "Reverse",
                )
              }
            >
              Reverse
            </button>
            <button
              size="xs"
              value="HumidifierOff"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "humidifierDirection",
                  "Off",
                )
              }
            >
              Off
            </button>
            <button
              size="xs"
              value="HumidifierForward"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "humidifierDirection",
                  "Forward",
                )
              }
            >
              Forward
            </button>
            Humidifier Direction: {humidifierDirection}
          </Row>
          <Row>
            <button
              size="xs"
              value="Heater0"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "0")
              }
            >
              0
            </button>
            <button
              size="xs"
              value="Heater1"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "1")
              }
            >
              1
            </button>
            <button
              size="xs"
              value="Heater2"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "2")
              }
            >
              2
            </button>
            <button
              size="xs"
              value="Heater3"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "3")
              }
            >
              3
            </button>
            <button
              size="xs"
              value="Heater4"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "4")
              }
            >
              4
            </button>
            <button
              size="xs"
              value="Heater5"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "5")
              }
            >
              5
            </button>
            <button
              size="xs"
              value="Heater6"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "6")
              }
            >
              6
            </button>
            <button
              size="xs"
              value="Heater7"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "7")
              }
            >
              7
            </button>
            <button
              size="xs"
              value="Heater8"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "8")
              }
            >
              8
            </button>
            <button
              size="xs"
              value="Heater9"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "9")
              }
            >
              9
            </button>
            <button
              size="xs"
              value="Heater10"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heater", "10")
              }
            >
              10
            </button>
            Heater Rate: {heater}
          </Row>
          <Row>
            <button
              size="xs"
              value="HeaterReverse"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "heaterDirection",
                  "Reverse",
                )
              }
            >
              Reverse
            </button>
            <button
              size="xs"
              value="HeaterOff"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "heaterDirection", "Off")
              }
            >
              Off
            </button>
            <button
              size="xs"
              value="HeaterForward"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "heaterDirection",
                  "Forward",
                )
              }
            >
              Forward
            </button>
            Heater Direction: {heaterDirection}
          </Row>
          <Row>
            <button
              size="xs"
              value="Filter0"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "0")
              }
            >
              0
            </button>
            <button
              size="xs"
              value="Filter1"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "1")
              }
            >
              1
            </button>
            <button
              size="xs"
              value="Filter2"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "2")
              }
            >
              2
            </button>
            <button
              size="xs"
              value="Filter3"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "3")
              }
            >
              3
            </button>
            <button
              size="xs"
              value="Filter4"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "4")
              }
            >
              4
            </button>
            <button
              size="xs"
              value="Filter5"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "5")
              }
            >
              5
            </button>
            <button
              size="xs"
              value="Filter6"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "6")
              }
            >
              6
            </button>
            <button
              size="xs"
              value="Filter7"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "7")
              }
            >
              7
            </button>
            <button
              size="xs"
              value="Filter8"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "8")
              }
            >
              8
            </button>
            <button
              size="xs"
              value="Filter9"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "9")
              }
            >
              9
            </button>
            <button
              size="xs"
              value="Filter10"
              onClick={value =>
                this.updateAnyLifeSupport(simulator, "filter", "10")
              }
            >
              10
            </button>
            Filtration and Purification Rate: {filter}
          </Row>
          <Row>
            <button
              size="xs"
              value="Scrubber0"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "0",
                )
              }
            >
              0
            </button>
            <button
              size="xs"
              value="Scrubber1"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "1",
                )
              }
            >
              1
            </button>
            <button
              size="xs"
              value="Scrubber2"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "2",
                )
              }
            >
              2
            </button>
            <button
              size="xs"
              value="Scrubber3"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "3",
                )
              }
            >
              3
            </button>
            <button
              size="xs"
              value="Scrubber4"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "4",
                )
              }
            >
              4
            </button>
            <button
              size="xs"
              value="Scrubber5"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "5",
                )
              }
            >
              5
            </button>
            <button
              size="xs"
              value="Scrubber6"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "6",
                )
              }
            >
              6
            </button>
            <button
              size="xs"
              value="Scrubber7"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "7",
                )
              }
            >
              7
            </button>
            <button
              size="xs"
              value="Scrubber8"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "8",
                )
              }
            >
              8
            </button>
            <button
              size="xs"
              value="Scrubber9"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "9",
                )
              }
            >
              9
            </button>
            <button
              size="xs"
              value="Scrubber10"
              onClick={value =>
                this.updateAnyLifeSupport(
                  simulator,
                  "carbonDioxideScrubber",
                  "10",
                )
              }
            >
              10
            </button>
            Carbon Dioxide Scrubber Rate: {carbonDioxideScrubber}
          </Row>
          <Row>Contaminant Puzzle Completion</Row>
          <Row>
            <button
              size="xs"
              value="Acetone"
              onClick={value => this.cleanContamination(deck, "Acetone")}
            >
              Acetone
            </button>
            <button
              size="xs"
              value="CarbonMonoxide"
              onClick={value =>
                this.cleanContamination(deck, "Carbon Monoxide")
              }
            >
              Carbon Monoxide
            </button>
            <button
              size="xs"
              value="Ammonia"
              onClick={value => this.cleanContamination(deck, "Ammonia")}
            >
              Ammonia
            </button>
            <button
              size="xs"
              value="MethylAlcohol"
              onClick={value => this.cleanContamination(deck, "Methyl Alcohol")}
            >
              Methyl Alcohol
            </button>
            <button
              size="xs"
              value="Hydrogen"
              onClick={value => this.cleanContamination(deck, "Hydrogen")}
            >
              Hydrogen
            </button>
          </Row>
        </Col>
        <Tour steps={trainingSteps} client={this.props.clientObj} />
      </Row>
    );
  }
}

export const LIFESUPPORT_QUERY = gql`
  query SimulatorDecks($simulatorId: ID!) {
    decks(simulatorId: $simulatorId) {
      ...EnvironmentPanelData
    }
    lifeSupport(simulatorId: $simulatorId) {
      ...LifeSupportData
    }
  }
  ${fragments.deckFragment}
  ${fragments.lifeSupportFragment}
`;

export default graphql(LIFESUPPORT_QUERY, {
  options: ownProps => ({
    fetchPolicy: "cache-and-network",
    variables: {
      simulatorId: ownProps.simulator.id,
    },
  }),
})(withApollo(EnvironmentPanel));
