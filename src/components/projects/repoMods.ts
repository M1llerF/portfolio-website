import type { ProjectPanelData } from "@/components/ProjectPanel";
import repoOfficialCover from "./images/repo_mods/REPO_Official_Game_Cover.png";
import repoModsStats from "./images/repo_mods/REPO_My_Mods_Screenshot_Stats.png";
import repoCartPicture from "./images/repo_mods/REPO_Cart_Picture.png";

export const repoModsProject: ProjectPanelData = {
  id: "repo-mods",
  title: "R.E.P.O. Quality-of-Life Mods",
  description:
    "A collection of BepInEx mods built to solve real gameplay usability problems in R.E.P.O. — from precise sensitivity control to visualizing object mass, impact force, and drop prediction. What began as a one-day fix turned into a deep dive into runtime injection, visualization, collision handling, and performance-conscious mod design.",
  imageSrc: repoOfficialCover.src,
  showcase: [
    {
      title: "How It Started: Sensitivity Control",
      description:
        "Over the summer, I started playing R.E.P.O. and immediately ran into a problem: the game didn’t allow precise sensitivity tuning. Because I keep my sensitivity consistent across games, I decided to learn the modding pipeline and build a small BepInEx mod that exposed the game’s true floating-point sensitivity through a config file.\n\n" +
        "That one-day fix became my entry point into the game’s modding ecosystem and led to publishing my first workshop release.",
    },
    {
      title: "Visualizing Mass & Impact",
      description:
        "As I continued playing, I kept dying because the game provides no clear feedback about an object’s mass or impact energy — both of which determine whether you can stun enemies.\n\n" +
        "To solve this, I built a grab-beam visualization mod that communicates this information instantly:\n\n" +
        "• Traffic-light colors (green / yellow / red) encode object mass\n" +
        "• Beam brightness and opacity scale with impact force\n" +
        "• Thresholds are configurable so players can tune behavior without rebuilding\n\n" +
        "Special-case overrides improve readability: grabbing another player forces a dedicated cyan beam, and rotation mode uses its own override color. Internally, the mod relies on small strategies, a lightweight context cache, and a minimal observer to keep visuals correct in multiplayer.",
    },
    {
      title: "Drop-Down Laser (Hardest Problem)",
      description:
        "The most technically challenging mod predicts where an object will land when dropped into the cart. This was the first time I had to add a new runtime object instead of modifying existing components.\n\n" +
        "My initial attempt involved creating a custom physics object, which quickly proved over-engineered and brittle. I eventually pivoted to a simpler design: spawning a runtime GameObject with a LineRenderer and point light.\n\n" +
        "The hardest issue turned out to be collision handling. Invisible cart colliders caused the laser to snap inside the cart or punch through to the floor. I solved this by explicitly filtering those cart colliders and ignoring any colliders belonging to the held object itself, allowing the beam to resolve against the tray surface reliably.",
    },
    {
      title: "Performance & Cleanup",
      description:
        "Performance impact was a primary concern throughout development:\n\n" +
        "• The controller exists only when the laser is enabled\n" +
        "• Updates only while an object is actively held\n" +
        "• Uses a capped straight-down raycast\n" +
        "• Reuses existing grab-beam materials\n" +
        "• Cleans itself up on scene transitions to prevent duplicates\n\n" +
        "In practice, the runtime cost is negligible and only paid while the feature is in use.",
      media: {
        type: "image",
        src: repoCartPicture.src,
        alt: "In-game cart view used for tuning drop trajectory feedback during co-op runs.",
      },
    },
    {
      title: "Workshop Impact & Reflection",
      description:
        "My mods now have nearly 100,000 total downloads. Seeing one of my earliest mods surpass 50,000 downloads was both exciting and nerve-wracking — it forced me to think seriously about correctness, testing, and user trust.\n\n" +
        "Ironically, the mod that took the longest to build is the least popular, while the one-day sensitivity fix remains the most used. That contrast taught me a valuable lesson: impact comes from solving real problems directly, not from complexity.",
      media: {
        type: "image",
        src: repoModsStats.src,
        alt: "Workshop performance snapshot showing download and player counts for released mods.",
      },
    },
  ],
  links: [
    {
      label: "RepoAnyAimSens",
      href: "https://github.com/M1llerF/RepoAnyAimSens",
    },
    {
      label: "GrabBeam PhysicsColor",
      href: "https://github.com/M1llerF/REPO-GrabBeam-PhysicsColorMod",
    },
    {
      label: "DropLaser Precision",
      href: "https://github.com/M1llerF/REPO-DropLaser-PrecisionMod",
    },
  ],
  tags: [
    "Game Modding",
    "BepInEx",
    "Unity",
    "Runtime Injection",
    "Visualization",
    "Performance Engineering",
    "User Experience",
  ],
};
