import React, {Component} from "react";
import {graphql, withApollo} from "react-apollo";
import {
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  Card,
  CardBody,
} from "helpers/reactstrap";
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
  {
    selector: ".deck-list",
    content:
      "This is the list of the decks on your ship. Click a deck to access it.",
  },
  {
    selector: ".doors-button",
    content: "Use this button to open and close the bulkhead doors.",
  },
  {
    selector: ".evac-button",
    content:
      "Use this button to evacuate the deck or sound the all-clear. Make sure the bulkhead doors are open before evacuating - otherwise your crew will be stuck on the deck!",
  },
  {
    selector: ".tranzine-gas",
    content:
      "Tranzine gas can be released in specific rooms on the ship. Click the button to release or siphon the gas. Be careful - tranzine gas is a dangerous chemical and can cause medical problems to anyone who inhales it.",
  },
];

const fragments = {
  deckFragment: gql`
    fragment EnvironmentDeckData on Deck {
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
      activeDeck
    }
  `,
};

export const DECK_SUB = gql`
  subscription DeckSubscribe($simulatorId: ID!) {
    decksUpdate(simulatorId: $simulatorId) {
      ...EnvironmentDeckData
    }
  }
  ${fragments.deckFragment}
`;

export const LIFESUPPORT_SUB = gql`
  subscription LifeSubscribe($simulatorId: ID!) {
    lifeSupportUpdate(simulatorId: $simulatorId) {
      ...LifeSupportData
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

  _selectDeck(deck, simulator) {
    this.setState({
      selectedDeck: deck,
    });
    const variables = {
      simulatorId: simulator,
      activeDeck: deck,
    };
    const mutation = gql`
      mutation updateLifeSupport($simulatorId: ID!, $activeDeck: ID!) {
        updateLifeSupport(
          life: {simulatorId: $simulatorId, activeDeck: $activeDeck}
        )
      }
    `;
    this.props.client.mutate({
      mutation,
      variables,
    });
  }

  _setDeck(deck) {
    this.setState({
      selectedDeck: deck,
    });
  }

  render() {
    if (this.props.data.loading || !this.props.data.decks) return null;
    const {decks} = this.props.data;
    const simulator = this.props.simulator.id;
    let deck;
    if (this.props.data.lifeSupport[0].activeDeck) {
      deck = decks.find(
        d => d.id === this.props.data.lifeSupport[0].activeDeck,
      );
      this._setDeck.bind(this, deck.id);
    } else if (this.state.selectedDeck) {
      deck = decks.find(d => d.id === this.state.selectedDeck);
    } else {
      deck = decks.find(d => d.number === 1);
      this._selectDeck.bind(deck.id, simulator);
    }

    if (!this.state.selectedDeck) {
      this.setState({selectedDeck: this.props.data.lifeSupport[0].activeDeck});
    }

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
        <Col sm={2} className="deck-list">
          <h4>Decks</h4>
          <ListGroup defaultActiveKey={deck.id}>
            {decks &&
              decks
                .concat()
                .sort((a, b) => {
                  if (a.number < b.number) return -1;
                  if (b.number < a.number) return 1;
                  return 0;
                })
                .map(d => (
                  <ListGroupItem
                    key={d.id}
                    onClick={this._selectDeck.bind(this, d.id, d.simulatorId)}
                    className={`
                      ${this.state.selectedDeck === d.id ? "selected" : ""}
                      ${
                        d.environment.percentOxygen < 0.2 ||
                        d.environment.percentOxygen > 0.22
                          ? "warning"
                          : ""
                      }
                      ${
                        d.environment.percentCarbonDioxide > 0.001
                          ? "warning"
                          : ""
                      }
                      ${
                        d.environment.percentNitrogen < 0.78 ||
                        d.environment.percentNitrogen > 0.8
                          ? "warning"
                          : ""
                      }
                      ${
                        d.environment.atmTemperature < 65 ||
                        d.environment.atmTemperature > 80
                          ? "warning"
                          : ""
                      }
                      ${
                        d.environment.atmPressure < 0.8 ||
                        d.environment.atmPressure > 1.2
                          ? "warning"
                          : ""
                      }
                      ${
                        d.environment.atmHumidity < 0.3 ||
                        d.environment.atmHumidity > 0.7
                          ? "warning"
                          : ""
                      }
                      ${
                        d.environment.atmContamination !== "None"
                          ? "warning"
                          : ""
                      }
                    `}
                  >
                    Deck: {d.number}
                  </ListGroupItem>
                ))}
          </ListGroup>
        </Col>
        <Col>
          <Row>
            <Col>
              <h1 style={{width: 380}}>Deck #{deck && deck.number}</h1>
            </Col>
            <Col>
              <h1>Ideal Ranges</h1>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 380}}>
                <CardBody
                  className={`${
                    deck.environment.percentOxygen < 0.2 ||
                    deck.environment.percentOxygen > 0.22
                      ? "warning"
                      : ""
                  }`}
                >
                  <h2>
                    Oxygen:{" "}
                    {deck &&
                      Math.round(deck.environment.percentOxygen * 10000) / 100}
                    %
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Between 20% and 22%</h3>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 380}}>
                <CardBody
                  className={`${
                    deck.environment.percentCarbonDioxide > 0.001
                      ? "warning"
                      : ""
                  }`}
                >
                  <h2>
                    Carbon Dioxide:{" "}
                    {deck &&
                      Math.round(
                        deck.environment.percentCarbonDioxide * 10000,
                      ) / 100}
                    %
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Between 0% and 0.1%</h3>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 380}}>
                <CardBody
                  className={`${
                    deck.environment.percentNitrogen < 0.77 ||
                    deck.environment.percentNitrogen > 0.79
                      ? "warning"
                      : ""
                  }`}
                >
                  <h2>
                    Nitogen:{" "}
                    {deck &&
                      Math.round(deck.environment.percentNitrogen * 10000) /
                        100}
                    %
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Between 77% and 79%</h3>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 380}}>
                <CardBody
                  className={`${
                    deck.environment.atmTemperature < 65 ||
                    deck.environment.atmTemperature > 80
                      ? "warning"
                      : ""
                  }`}
                >
                  <h2>
                    Temperature: {deck && deck.environment.atmTemperature} °F
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Between 65° and 80°</h3>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 380}}>
                <CardBody
                  className={`${
                    deck.environment.atmPressure < 0.8 ||
                    deck.environment.atmPressure > 1.2
                      ? "warning"
                      : ""
                  }`}
                >
                  <h2>
                    Pressure:{" "}
                    {deck &&
                      Math.round(deck.environment.atmPressure * 100) / 100}{" "}
                    ATM
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Around 1 Atmopshere (14.7 PSI)</h3>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 380}}>
                <CardBody
                  className={`${
                    deck.environment.atmHumidity < 0.3 ||
                    deck.environment.atmHumidity > 0.7
                      ? "warning"
                      : ""
                  }`}
                >
                  <h2>
                    Humidity:{" "}
                    {deck && Math.round(deck.environment.atmHumidity * 100)}%
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Between 30% and 70%</h3>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 380}}>
                <CardBody
                  className={`${
                    deck.environment.atmContamination !== "None"
                      ? "warning"
                      : ""
                  }`}
                >
                  <h2>
                    Contamination: {deck && deck.environment.atmContamination}
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>None</h3>
            </Col>
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
      ...EnvironmentDeckData
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
})(withApollo(EnvironmentDecks));
