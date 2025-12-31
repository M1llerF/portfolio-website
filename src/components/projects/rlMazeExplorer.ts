import type { ProjectPanelData } from "@/components/ProjectPanel";
import threeMazesImage from "./images/rl_maze_explorer/three_mazes_image.png";
import qlearningRewardGraph from "./images/rl_maze_explorer/qlearning_reward_graph.png";

export const rlMazeExplorerProject: ProjectPanelData = {
  id: "rl-maze-explorer",
  title: "Q-Learning Maze Explorer",
  description:
    "My first self-taught AI project: a Q-learning agent that learns to solve a maze while streaming live telemetry (rewards, exploration rate, value updates, and solve streaks). Building it taught me the hard lessons of reinforcement learning: Q-learning doesn’t generalize to arbitrary mazes, and state design matters more than “more data.”",
  imageSrc: threeMazesImage.src,
  hero: {
    type: "video",
    src: "/projects/rl_maze_explorer/qlearning_solving_maze.mp4",
    speed: 4,
  },
  showcase: [
    {
      media: {
        type: "image",
        src: threeMazesImage.src,
        alt: "Three synchronized maze runs showing best, worst, and latest attempts.",
      },
      title: "Best, Worst, Latest Runs",
      description:
        "Three synchronized snapshots capture the agent’s lowest score, strongest finish, and current attempt on the same maze, making progression obvious at a glance.\n\n" +
        "This demo intentionally trains on a single maze so improvements come down to policy learning rather than environment variation. The Tkinter interface traces exploration paths, value updates, and solve streaks in real time as epsilon-greedy Q-learning converges.",
    },
    {
      title: "What I Was Trying to Do (and What Didn’t Work)",
      description:
        "My original goal was to build an agent that could solve *any* maze. The project quickly taught me that tabular Q-learning isn’t built for that: it learns a policy tied to a specific state space and does not generalize to unseen layouts without function approximation.\n\n" +
        "That realization changed the project from “universal maze solver” into a focused experiment: make the learning loop observable, iterate on the state space, and understand why convergence improves or fails.",
    },
    {
      title: "State Representation: Less Data, Better Learning",
      description:
        "My first approach was to give the agent every piece of data I could think of — absolute coordinates, exhaustive environment details, and even an array of every position it had ever visited. That made learning slow and unstable because most of that information was irrelevant noise.\n\n" +
        "When I revisited the project later, I rebuilt the input representation to include only what mattered:\n" +
        "• Current position\n" +
        "• Distances to nearby walls\n" +
        "• Direction flags indicating the goal’s relative position\n\n" +
        "Removing history-tracking and redundant features made training faster, more stable, and much easier to reason about.",
    },
    {
      title: "Design Patterns (Useful vs. Overkill)",
      description:
        "This was some of the first code I wrote after learning design principles and patterns, so it’s a fun snapshot of me over-applying abstractions.\n\n" +
        "The patterns that genuinely helped were the ones that separated concerns:\n" +
        "• BotFactory — makes it easy to add new agent types\n" +
        "• VisualizationStrategy — keeps UI logic from leaking into the learning loop\n" +
        "• Repository layer — keeps training artifacts out of the core loop\n\n" +
        "The rest was a reminder that patterns are tools, not goals. The most valuable design lesson was keeping the bot small, the environment clear, and the learning loop easy to reason about.",
    },
    {
      media: {
        type: "image",
        src: qlearningRewardGraph.src,
        alt: "Reward graph showing episode rewards and exploration rate over time.",
      },
      title: "Rewards Over Episodes",
      description:
        "Episode rewards, exploration rate, and solve streaks stream live so changes to hyperparameters immediately show up in the telemetry dashboard. This made debugging convergence issues much easier than treating training like a black box.",
    },
  ],
  links: [
    {
      label: "GitHub",
      href: "https://github.com/M1llerF/RL_Maze_Explorer",
    },
  ],
  tags: [
    "Reinforcement Learning",
    "Q-learning",
    "Artificial Intelligence",
    "Self-Taught",
    "Python",
    "Tkinter",
    "Telemetry",
  ],
};
