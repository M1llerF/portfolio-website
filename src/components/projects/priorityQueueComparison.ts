import type { ProjectPanelData } from "@/components/ProjectPanel";
import thumbnailPriorityQueue from "./images/priority_queue/thumbnail_priority_queue.gif";
import insertResults from "./images/priority_queue/insert_results.jpeg";
import extractResults from "./images/priority_queue/extract_results.jpeg";
import decreaseKeyResults from "./images/priority_queue/decrease_key_results.jpeg";
import mergeResults from "./images/priority_queue/merge_results.jpeg";
import memoryResults from "./images/priority_queue/memory_results.jpeg";

export const priorityQueueComparisonProject: ProjectPanelData = {
  id: "priority-queue-comparison",
  title: "Priority Queue Performance: Binary vs. Fibonacci Heaps",
  description:
    "I designed and executed a comparative research study examining how theoretical heap guarantees translate into real-world performance. Working in a team of three, we implemented Binary and Fibonacci Heaps from scratch and built a controlled benchmarking framework to measure time and memory tradeoffs across core operations and Dijkstra’s algorithm.",
  imageSrc: thumbnailPriorityQueue.src,
  showcase: [
    {
      title: "Overview",
      description:
        "This project compares two priority queue implementations that are often contrasted in theory but rarely evaluated empirically under controlled conditions:\n\n" +
        "• Binary Heaps (array-based, cache-friendly)\n" +
        "• Fibonacci Heaps (pointer-based, strong amortized bounds)\n\n" +
        "Goal: bridge asymptotic analysis with practical performance and identify when each structure actually wins.",
      gallery: [],
    },
    {
      title: "What We Built",
      description:
        "Working in a team of three, I implemented both heap structures from scratch, closely following their original theoretical definitions (Williams; Fredman & Tarjan) while adapting them for practical benchmarking.\n\n" +
        "Benchmarking scope:\n" +
        "• insert\n" +
        "• extract-min\n" +
        "• decrease-key\n" +
        "• merge\n" +
        "• peak memory usage\n" +
        "• integration as the priority queue in Dijkstra’s algorithm",
      gallery: [],
    },
    {
      title: "Methodology & Controls",
      description:
        "To ensure fair and meaningful results, we controlled for system noise and measurement artifacts:\n\n" +
        "• Minimal text-based Linux VM to reduce background overhead\n" +
        "• CPU pinning to a single core\n" +
        "• Fixed random seeds per trial for repeatability\n" +
        "• Multiple runs per input size with averaged timing\n" +
        "• Garbage collection triggered before timing and disabled during measurement\n" +
        "• tracemalloc used for peak memory measurement after inserts\n\n" +
        "Benchmarks were designed to expose worst-case and amortized behavior, not just average-case performance.",
      gallery: [],
    },
    {
      title: "Key Results",
      description:
        "The results confirmed that asymptotic complexity alone is insufficient for implementation decisions:\n\n" +
        "Fibonacci Heaps\n" +
        "• Near-constant amortized performance for insert and decrease-key\n" +
        "• Higher memory overhead and pointer-management costs\n\n" +
        "Binary Heaps\n" +
        "• Consistently faster in extract-min–heavy workloads\n" +
        "• Lower constant factors and better cache locality\n" +
        "• More memory efficient due to lean array-based representation\n\n" +
        "Takeaway: Fibonacci Heaps can win in decrease-key/merge-heavy patterns (e.g., Dijkstra-style updates), but Binary Heaps are often the better practical choice when extract-min dominates and locality matters.",
      gallery: [],
    },
    {
      title: "Benchmark Charts",
      description:
        "Charts for insert, extract-min, decrease-key, merge, and memory usage across input sizes, including overlays/fit against theoretical bounds.",
      gallery: [
        {
          type: "image",
          src: insertResults.src,
          alt: "Insertion benchmark comparing Binary vs. Fibonacci heaps across input sizes.",
        },
        {
          type: "image",
          src: extractResults.src,
          alt: "Extract-min benchmark comparing Binary vs. Fibonacci heaps across input sizes.",
        },
        {
          type: "image",
          src: decreaseKeyResults.src,
          alt: "Decrease-key benchmark comparing Binary vs. Fibonacci heaps across input sizes.",
        },
        {
          type: "image",
          src: mergeResults.src,
          alt: "Merge benchmark comparing Binary vs. Fibonacci heaps across input sizes.",
        },
        {
          type: "image",
          src: memoryResults.src,
          alt: "Memory usage benchmark comparing Binary vs. Fibonacci heaps across input sizes.",
        },
      ],
    },
  ],
  paper: {
    title: "Research Paper",
    description:
      "37-page paper detailing implementation choices, proofs of correctness, experimental design, and empirical analysis supported by benchmark visualizations and regression fits.",
    src: "/projects/priority_queue/fibonacci_vs_binary_heaps.pdf",
  },
  links: [
    {
      label: "GitHub",
      href: "https://github.com/M1llerF/priority_queue_comparison",
    },
  ],
  tags: [
    "Data Structures",
    "Algorithms",
    "Heaps",
    "Performance Benchmarking",
    "Empirical Analysis",
    "Research",
  ],
};
