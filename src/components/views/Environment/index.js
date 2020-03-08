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
    fragment DeckData on Deck {
      id
      number
      evac
      doors
      crewCount
      rooms {
        id
        name
        gas
      }
      environment {
        oxygen
        nitrogen
        carbonDioxide
        temperature
        pressure
      }
    }
  `,
};

export const DECK_SUB = gql`
  subscription DeckSubscribe($simulatorId: ID!) {
    decksUpdate(simulatorId: $simulatorId) {
      ...DeckData
    }
  }
  ${fragments.deckFragment}
`;

class SecurityDecks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDeck: null,
    };
  }
  _selectDeck(deck) {
    this.setState({
      selectedDeck: deck,
    });
  }
  /*_lowOxygen(deck) {
    this.setState({
      lowOxygen: deck
    });
  }*/

  render() {
    //if (this.props.data.loading || !this.props.data.decks) return null;
    const {decks} = this.props.data;
    let deck;
    if (this.state.selectedDeck) {
      deck = decks.find(d => d.id === this.state.selectedDeck);
    }

    return (
      <Row className="security-decks">
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

        <Col sm={2} className="deck-list">
          <h4>Decks</h4>
          <ListGroup>
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
                    onClick={this._selectDeck.bind(this, d.id)}
                    className={`${
                      this.state.selectedDeck === d.id ? "selected" : ""
                    } 
                      ${d.environment.oxygen < 0.2 ? "lowOxygen" : ""}`}
                  >
                    Deck {d.number}
                  </ListGroupItem>
                ))}
          </ListGroup>
        </Col>
        <Col classname="levels">
          <Row>
            <Col>
              <h1 style={{width: 360}}>Deck #{deck && deck.number}</h1>
            </Col>
            <Col>
              <h1>Ideal Ranges</h1>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 360}}>
                <CardBody>
                  <h2>
                    Oxygen{" "}
                    {deck && Math.round(deck.environment.oxygen * 10000) / 100}%
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Between 20% and 21%</h3>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 360}}>
                <CardBody>
                  <h2>
                    Carbon Dioxide{" "}
                    {deck &&
                      Math.round(deck.environment.carbonDioxide * 1000) / 10}
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
              <Card style={{width: 360}}>
                <CardBody>
                  <h2>
                    Nitogen{" "}
                    {deck && Math.round(deck.environment.nitrogen * 1000) / 10}%
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
              <Card style={{width: 360}}>
                <CardBody>
                  <h2>
                    Temperature{" "}
                    {deck && Math.round(deck.environment.temperature * 10) / 10}
                    °C
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Between 70% and 85%</h3>
            </Col>
          </Row>
          <Row sm={8}>
            <Col>
              <Card style={{width: 360}}>
                <CardBody>
                  <h2>
                    Pressure {deck && Math.round(deck.environment.pressure)}
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
              <Card style={{width: 360}}>
                <CardBody>
                  <h2>
                    Humidity {deck && Math.round(deck.environment.humidity)}
                  </h2>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <h3 style={{marginTop: 50}}>Between 30% and 70%</h3>
            </Col>
          </Row>
        </Col>
        <Tour steps={trainingSteps} client={this.props.clientObj} />
      </Row>
    );
  }
}

export const DECK_QUERY = gql`
  query SimulatorDecks($simulatorId: ID!) {
    decks(simulatorId: $simulatorId) {
      ...DeckData
    }
  }
  ${fragments.deckFragment}
`;

export default graphql(DECK_QUERY, {
  options: ownProps => ({
    fetchPolicy: "cache-and-network",
    variables: {
      simulatorId: ownProps.simulator.id,
    },
  }),
})(withApollo(SecurityDecks));
