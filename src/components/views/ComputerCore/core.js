import React, {Component} from "react";
import {Query, Mutation} from "react-apollo";
import gql from "graphql-tag.macro";
import {Button} from "helpers/reactstrap";
import "./style.scss";

const fragment = gql`
  fragment ComputerCoreCoreData on ComputerCore {
    id
    history
    users {
      id
      name
      level
      hacker
      password
    }
    files {
      id
      name
      level
      corrupted
    }
    virii {
      id
      name
    }
    terminals {
      id
      name
      status
    }
  }
`;
export const COMPUTER_CORE_CORE_QUERY = gql`
  query ComputerCore($simulatorId: ID!) {
    computerCore(simulatorId: $simulatorId) {
      ...ComputerCoreCoreData
    }
  }
  ${fragment}
`;
export const COMPUTER_CORE_CORE_SUB = gql`
  subscription ComputerCoreUpdate($simulatorId: ID!) {
    computerCoreUpdate(simulatorId: $simulatorId) {
      ...ComputerCoreCoreData
    }
  }
  ${fragment}
`;

class Core extends Component {
  state = {};
  componentDidMount() {
    this.sub = this.props.subscribe();
  }
  componentWillUnmount() {
    this.sub && this.sub();
  }
  renderDetail() {
    const {type, level, selectedObj} = this.state;
    const {users, files} = this.props;
    let mapper = [];
    if (type === "user") mapper = users;
    if (type === "file") mapper = files;
    return mapper
      .filter(m => m.level === level)
      .map(m => (
        <p
          key={m.id}
          className={`${m.hacker ? "text-danger" : ""} ${
            m.corrupted ? "text-danger" : ""
          } ${selectedObj === m.id ? "selected" : ""}`}
          onClick={() => this.setState({selectedObj: m.id})}
        >
          {m.name}
        </p>
      ));
  }
  addHacker = action => {
    return () => {
      const name = prompt("What is the hacker name? (Eg. Phillip Q. Nibley)");
      if (!name) return;
      const level = prompt("What is the hacker level? (1 - 10)");
      if (
        isNaN(parseInt(level, 10)) ||
        parseInt(level, 10) > 10 ||
        parseInt(level, 10) < 1
      )
        return;
      action({
        variables: {id: this.props.id, name, level: parseInt(level, 10)},
      });
    };
  };
  render() {
    const {type, level, selectedVirus, selectedHacker} = this.state;
    const {history, users, virii, id, terminals} = this.props;
    return (
      <div className="computerCore-core">
        <div className="user-row">
          <div className="history-block">
            <div className="history-area">
              <div style={{overflow: "auto", height: "100%"}}>
                <p>
                  <strong>History</strong>
                </p>
                <ul>
                  {history.length === 0
                    ? "No history"
                    : history
                        .filter((h, i) => i < 200)
                        .map((h, i) => <li key={`history-${i}`}>{h}</li>)}
                </ul>
              </div>
            </div>
            <div className="user-detail">{this.renderDetail()}</div>
          </div>
          <div className="side-block">
            <p>
              <strong>Users</strong>
            </p>
            <div className="levels">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <p
                    key={`user-level-${i}`}
                    className={
                      type === "user" && level === i + 1 ? "selected" : ""
                    }
                    onClick={() =>
                      this.setState({
                        type: "user",
                        level: i + 1,
                        selectedObj: null,
                      })
                    }
                  >
                    Level {i + 1}
                  </p>
                ))}
            </div>
          </div>
          <div className="side-block">
            <p>
              <strong>Files</strong>
            </p>
            <div className="levels">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <p
                    key={`user-level-${i}`}
                    className={
                      type === "file" && level === i + 1 ? "selected" : ""
                    }
                    onClick={() =>
                      this.setState({
                        type: "file",
                        level: i + 1,
                        selectedObj: null,
                      })
                    }
                  >
                    Level {i + 1}
                  </p>
                ))}
            </div>
          </div>
        </div>
        <div>
          Terminals Online:{" "}
          <strong>
            {terminals.filter(t => t.status === "F").length} /{" "}
            {terminals.length}
          </strong>
        </div>
        <div className="baddie-row">
          <div className="hacker-block">
            <p>
              <strong>Hackers</strong>
            </p>
            <div className="list-div">
              {users.filter(u => u.hacker).length > 0
                ? users
                    .filter(u => u.hacker)
                    .map(u => (
                      <p
                        key={`hacker-${u.id}`}
                        className={selectedHacker === u.id ? "selected" : ""}
                        onClick={() => this.setState({selectedHacker: u.id})}
                      >
                        {u.name} ({u.level})
                      </p>
                    ))
                : "No Hackers"}
            </div>
            <div>
              <Mutation
                mutation={gql`
                  mutation AddHacker($id: ID!, $name: String!, $level: Int!) {
                    addComputerCoreUser(
                      id: $id
                      user: {name: $name, level: $level, hacker: true}
                    ) {
                      id
                    }
                  }
                `}
              >
                {action => (
                  <Button
                    color="warning"
                    size="sm"
                    onClick={this.addHacker(action)}
                  >
                    Add Hacker
                  </Button>
                )}
              </Mutation>
              <Mutation
                mutation={gql`
                  mutation RemoveUser($id: ID!, $userId: ID!) {
                    removeComputerCoreUser(id: $id, userId: $userId)
                  }
                `}
                variables={{id: id, userId: selectedHacker}}
              >
                {action => (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => {
                      action();
                      this.setState({selectedHacker: null});
                    }}
                    disabled={!selectedHacker}
                  >
                    Remove Hacker
                  </Button>
                )}
              </Mutation>
            </div>
          </div>
          <div className="virii-block">
            <p>
              <strong>Virii</strong>
            </p>{" "}
            <div className="list-div">
              {virii.length === 0
                ? "No Virii"
                : virii.map(v => (
                    <p
                      key={v.id}
                      className={selectedVirus === v.id ? "selected" : ""}
                      onClick={() => this.setState({selectedVirus: v.id})}
                    >
                      {v.name}
                    </p>
                  ))}
            </div>
            <div>
              <Mutation
                mutation={gql`
                  mutation AddVirus($id: ID!) {
                    addViriiToComputerCore(id: $id)
                  }
                `}
                variables={{id: id}}
              >
                {action => (
                  <Button color="warning" size="sm" onClick={action}>
                    Add Virus
                  </Button>
                )}
              </Mutation>
              <Mutation
                mutation={gql`
                  mutation RemoveVirus($id: ID!, $virusId: ID!) {
                    deleteComputerCoreVirus(id: $id, virusId: $virusId)
                  }
                `}
                variables={{id: id, virusId: selectedVirus}}
              >
                {action => (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => {
                      action();
                      this.setState({selectedVirus: null});
                    }}
                    disabled={!selectedVirus}
                  >
                    Remove Virus
                  </Button>
                )}
              </Mutation>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ComputerCoreData extends Component {
  state = {};
  render() {
    return (
      <Query
        query={COMPUTER_CORE_CORE_QUERY}
        variables={{simulatorId: this.props.simulator.id}}
      >
        {({loading, data, subscribeToMore}) => {
          if (loading || !data) return null;
          const {computerCore} = data;
          if (!computerCore[0]) return <div>No Computer Core</div>;
          return (
            <Core
              {...this.props}
              {...computerCore[0]}
              subscribe={() =>
                subscribeToMore({
                  document: COMPUTER_CORE_CORE_SUB,
                  variables: {simulatorId: this.props.simulator.id},
                  updateQuery: (previousResult, {subscriptionData}) => {
                    return Object.assign({}, previousResult, {
                      computerCore: subscriptionData.data.computerCoreUpdate,
                    });
                  },
                })
              }
            />
          );
        }}
      </Query>
    );
  }
}
export default ComputerCoreData;
