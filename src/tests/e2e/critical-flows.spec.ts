import { test, expect } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "NetViz Studio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start Visualizing" })).toBeVisible();
});

test("TCP simulation play and pause", async ({ page }) => {
  await page.goto("/protocols/tcp");
  await page.getByRole("button", { name: "Play simulation" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Pause simulation" }).click();
  await expect(page.getByText(/Step \d+/)).toBeVisible();
});

test("TCP packet drop causes retransmission", async ({ page }) => {
  await page.goto("/protocols/tcp");
  await page.getByLabel("Drop packet index (-1=none)").fill("0");
  await page.getByRole("button", { name: "Apply & Regenerate" }).click();
  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(page.getByText("retransmission", { exact: false })).toBeVisible({ timeout: 30000 });
});

test("CIDR calculator 192.168.1.10/24", async ({ page }) => {
  await page.goto("/cidr");
  await page.getByLabel("IPv4 Address / Prefix").fill("192.168.1.10/24");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.getByText("192.168.1.0")).toBeVisible();
  await expect(page.getByText("192.168.1.255")).toBeVisible();
  await expect(page.getByText("254")).toBeVisible();
});

test("split /24 into four /26", async ({ page }) => {
  await page.goto("/cidr");
  await page.getByRole("tab", { name: "Subnet Splitter" }).click();
  await page.getByLabel("Base network").fill("192.168.1.0/24");
  await page.getByLabel("New prefix").fill("26");
  await page.getByRole("button", { name: "Split" }).click();
  await expect(page.getByText("192.168.1.0/26")).toBeVisible();
  await expect(page.getByText("192.168.1.192/26")).toBeVisible();
});

test("UDP page loads without native ACK", async ({ page }) => {
  await page.goto("/protocols/udp");
  await page.getByRole("button", { name: "Play simulation" }).click();
  await page.waitForTimeout(2000);
  const timeline = page.getByLabel("Simulation events");
  await expect(timeline).not.toContainText("acknowledgement-sent");
});
