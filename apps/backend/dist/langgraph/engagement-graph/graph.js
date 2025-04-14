"use strict";
// apps/backend/src/langgraph/engagement-graph/graph.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.graph = void 0;
const server_1 = require("@langchain/langgraph-sdk/react-ui/server");
const openai_1 = require("@langchain/openai");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const langgraph_1 = require("@langchain/langgraph");
// Extend state to store UI
const EngagementState = langgraph_1.Annotation.Root({
    ...langgraph_1.MessagesAnnotation.spec,
    ui: (0, langgraph_1.Annotation)({ reducer: server_1.uiMessageReducer, default: () => [] }),
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
exports.graph = new langgraph_1.StateGraph(EngagementState)
    .addNode("askEngagement", async (state, config) => {
    // typedUi to push UI elements referencing our ui.tsx components
    const ui = (0, server_1.typedUi)(config);
    // Optionally parse user text to see if they've indicated a sponsor type
    const text = state.messages[state.messages.length - 1]?.content || "";
    const model = new openai_1.ChatOpenAI({ model: "gpt-4o-mini" });
    const sponsorIntent = await model
        .withStructuredOutput(zod_1.z.object({ sponsorType: zod_1.z.string().optional() }))
        .invoke([{ role: "user", content: text }]);
    const sponsorType = sponsorIntent.sponsorType || "poc";
    // Create a message
    const uiMessageId = (0, uuid_1.v4)();
    const response = {
        id: uiMessageId,
        type: "ai",
        content: `Let's clarify your sponsor engagement preferences...`,
    };
    // Show the sponsor form with the toggles + carousel
    ui.push({ name: "sponsorForm", props: { sponsorType, useCases } }, { message: response });
    // Return updated state
    return { messages: [response], ui: ui.items };
})
    .addEdge("__start__", "askEngagement")
    .compile();
