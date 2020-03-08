import React from "react";
import {waitForElementToBeRemoved, wait} from "@testing-library/react";
import render from "../../../helpers/testHelper";
import baseProps from "../../../stories/helpers/baseProps.js";
import Component from "./index";
import {loader} from "graphql.macro";
const TEMPLATE_SUB = loader("./templateSubscription.graphql");
const TEMPLATE_QUERY = loader("./templateQuery.graphql");

// While it is possible to use the queries API to generate
// fake mock data, it is much better to use actual mock
// data generated by Thorium. Please replace the generated
// mocks with real mock data.
it.skip("should render", async () => {
  const {container, getByText} = render(<Component {...baseProps} />, {
    mocks: [
      {
        request: {query: TEMPLATE_QUERY, variables: {simulatorId: "test"}},
        result: {data: {}},
      },
      {
        request: {query: TEMPLATE_SUB, variables: {simulatorId: "test"}},
        result: {data: {}},
      },
    ],
  });
  await waitForElementToBeRemoved(() => getByText("Loading..."));
  await wait();
  expect(container.innerHTML).toBeTruthy();
  expect(container.innerHTML).not.toBe("Error");
});
