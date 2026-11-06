// The portfolio itself is the standalone 3D experience in public/concept (served at /concept/).
// This route only forwards visitors there, with a plain link as a fallback if scripts and meta refresh are blocked.
export default function Home() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/concept/" />
      <script dangerouslySetInnerHTML={{ __html: "location.replace('/concept/')" }} />
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#05070b", color: "#f4efe7", fontFamily: "monospace" }}>
        <a href="/concept/" style={{ color: "#ff6a1f" }}>
          Enter the model: Dheeraj Reddy Karra
        </a>
      </main>
    </>
  );
}
