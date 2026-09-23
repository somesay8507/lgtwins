import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section
      className="container"
      style={{ padding: "120px 0", textAlign: "center" }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 10vw, 6rem)",
          color: "var(--red-soft)",
        }}
      >
        준비 중이에요
      </h1>
      <p style={{ color: "var(--muted)", margin: "16px 0 32px" }}>
        찾는 페이지가 없거나 아직 만들고 있는 중이야. 곧 열게!
      </p>
      <Button href="/">메인으로</Button>
    </section>
  );
}
