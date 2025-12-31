import type { ProjectPanelData } from "@/components/ProjectPanel";
import coreExpressionsImg from "./images/racket/core-expressions.png";
import replShowcaseImg from "./images/racket/repl-showcase.png";
import testsPassingImg from "./images/racket/tests-passing.png";

export const racketInterpreterProject: ProjectPanelData = {
  id: "racket-interpreter",
  title: "Interpreter for a Subset of Racket",
  description:
    "A custom evaluation engine that executes a subset of Racket inside a user-defined runtime. Implements lexical scoping, closures, recursion, and lists to explore how programming languages work beneath the syntax.",
  showcase: [
    {
      title: "What This Is",
      description:
        "This project is a hand-built interpreter for a subset of Racket. Instead of relying on the host language’s evaluator, expressions are parsed and evaluated inside a custom runtime with explicit environments, bindings, and evaluation rules.\n\n" +
        "The focus is on semantics: how expressions reduce, how variables resolve, and how environments evolve during execution.",
    },
    {
      title: "Core Language Features",
      description:
        "The interpreter supports core constructs running entirely inside the custom evaluator:\n\n" +
        "• Arithmetic and primitive operations\n" +
        "• Conditionals\n" +
        "• Lists and list operations\n" +
        "• Lambdas and higher-order functions\n" +
        "• Lexically scoped closures",
      media: {
        type: "image",
        src: coreExpressionsImg.src,
        alt: "Core expressions evaluated inside the custom interpreter.",
      },
    },
    {
      title: "Recursion & letrec",
      description:
        "Supporting recursion required careful environment design. The interpreter implements `letrec`, allowing functions to reference themselves and each other during evaluation.\n\n" +
        "Mutual recursion (e.g. `even?` / `odd?`) serves as a strong correctness check — any mistake in environment handling or binding resolution causes these examples to fail immediately.",
      media: {
        type: "image",
        src: replShowcaseImg.src,
        alt: "REPL session showing factorial via letrec and mutual recursion.",
      },
    },
    {
      title: "Closures & Environments",
      description:
        "Functions are implemented as closures that capture the lexical environment they were defined in. This ensures correct variable resolution even when functions are returned, nested, or passed as values.\n\n" +
        "This made higher-order functions and nested lambdas behave correctly without relying on host-language shortcuts.",
    },
    {
      title: "Correctness & Testing",
      description:
        "The interpreter is validated with a comprehensive automated test suite built using RackUnit. All language constructs are tested both in isolation and in combination.\n\n" +
        "Every test passes, providing confidence that evaluation rules, environment handling, and recursion semantics are correct.",
      media: {
        type: "image",
        src: testsPassingImg.src,
        alt: "RackUnit test results showing all tests passing.",
      },
    },
  ],
  links: [
    {
      label: "GitHub",
      href: "https://github.com/M1llerF/Racket-Interpreter",
    },
  ],
  tags: [
    "Programming Languages",
    "Interpreters",
    "Racket",
    "Lexical Scoping",
    "Closures",
    "Recursion",
    "Testing",
  ],
};
