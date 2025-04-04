// apps/backend/src/langgraph/engagement-graph/graph.ts

import {
    typedUi,
    uiMessageReducer,
  } from "@langchain/langgraph-sdk/react-ui/server";
  import { ChatOpenAI } from "@langchain/openai";
  import { v4 as uuidv4 } from "uuid";
  import { z } from "zod";
  import type ComponentMap from "./ui.js";
  import {
    Annotation,
    MessagesAnnotation,
    StateGraph,
  } from "@langchain/langgraph";
  
  // Extend state to store UI
  const EngagementState = Annotation.Root({
    ...MessagesAnnotation.spec,
    ui: Annotation({ reducer: uiMessageReducer, default: () => [] }),
  });
  
  // Potential use cases for the carousel
  const useCases = [
    {
      title: "Community Brainstorm",
      description: "Gather new product ideas from the dev community",
    },
    {
      title: "API Challenge",
      description: "Push developers to build new features using your tool or API",
    },
    {
      title: "Product POC",
      description: "Request proof-of-concept demos for your new AI product",
    },
  ];
  
  export const graph = new StateGraph(EngagementState)
    .addNode("askEngagement", async (state, config) => {
      // typedUi to push UI elements referencing our ui.tsx components
      const ui = typedUi<typeof ComponentMap>(config);
  
      // Optionally parse user text to see if they've indicated a sponsor type
      const text = state.messages[state.messages.length - 1]?.content || "";
      const model = new ChatOpenAI({ model: "gpt-4o-mini" });
      const sponsorIntent = await model
        .withStructuredOutput(z.object({ sponsorType: z.string().optional() }))
        .invoke([{ role: "user", content: text }]);
  
      const sponsorType = sponsorIntent.sponsorType || "poc";
  
      // Create a message
      const uiMessageId = uuidv4();
      const response = {
        id: uiMessageId,
        type: "ai" as const,
        content: `Let's clarify your sponsor engagement preferences...`,
      };
  
      // Show the sponsor form with the toggles + carousel
      ui.push(
        { name: "sponsorForm", props: { sponsorType, useCases } },
        { message: response }
      );
  
      // Return updated state
      return { messages: [response], ui: ui.items };
    })
    .addEdge("__start__", "askEngagement")
    .compile();
  