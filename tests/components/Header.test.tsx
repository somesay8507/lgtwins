import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/layout/Header";
import { NAV_ITEMS } from "@/lib/nav";

describe("Header", () => {
  it("links the logo to home", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "LG TWINS" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders every nav label", () => {
    render(<Header />);
    for (const item of NAV_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("marks pages that are not ready as disabled with a notice", () => {
    render(<Header />);
    const notReady = NAV_ITEMS.filter((i) => !i.ready).length;
    expect(screen.queryAllByText("준비 중")).toHaveLength(notReady);
  });

  it("toggles the mobile menu", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const button = screen.getByRole("button", { name: "메뉴" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(screen.getByRole("button", { name: "닫기" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
