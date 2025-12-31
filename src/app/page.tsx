import { redirect } from "next/navigation";
import IntroSandboxController from "./IntroSandboxController";
export default function Home() {
  if (process.env.APP_MODE === "sandbox") {
    redirect("/sandbox");
  }

  return (
    <main>
      <IntroSandboxController />
    </main>
  );
}
