import CSMap from "@/components/CSMap";

export default function Home() {
  return (
    <main
      // style={{
      //   width: "100vw",
      //   height: "100dvh",
      //   overflow: "hidden",
      //   display: "flex",
      //   flexDirection: "column",
      // }}
      className="flex flex-col w-screen h-screen overflow-hidden"
    >
      <CSMap />
    </main>
  );
}
