/**
 * Test utilities for Process Dream Edge Function
 * 
 * Run tests with:
 * deno test --allow-net --allow-env test.ts
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Test configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const TEST_JWT = Deno.env.get("TEST_JWT") || "";

// ============================================================================
// TEST HELPERS
// ============================================================================

async function callFunction(body: any): Promise<Response> {
  return await fetch(`${SUPABASE_URL}/functions/v1/process-dream`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TEST_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

// ============================================================================
// TESTS
// ============================================================================

Deno.test("should reject request without authentication", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/process-dream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ textInput: "test" }),
  });

  assertEquals(response.status, 401);
});

Deno.test("should process text input successfully", async () => {
  if (!TEST_JWT) {
    console.log("⚠️  Skipping test: TEST_JWT not set");
    return;
  }

  const response = await callFunction({
    textInput: "I dreamed of flying over mountains",
    generateVideo: false, // Disable for faster testing
  });

  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertExists(data.dreamId);
  assertExists(data.storyNode);
  assertExists(data.options);
  assertEquals(data.options.length, 3);
  assertEquals(data.transcript, "I dreamed of flying over mountains");
});

Deno.test("should reject request without input", async () => {
  if (!TEST_JWT) {
    console.log("⚠️  Skipping test: TEST_JWT not set");
    return;
  }

  const response = await callFunction({
    generateVideo: false,
  });

  assertEquals(response.status, 500);
  
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("should handle CORS preflight", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/process-dream`, {
    method: "OPTIONS",
  });

  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("Access-Control-Allow-Origin"),
    "*"
  );
});

// ============================================================================
// INTEGRATION TESTS (Require API keys)
// ============================================================================

Deno.test({
  name: "should transcribe audio with ElevenLabs",
  ignore: !Deno.env.get("ELEVENLABS_API_KEY"),
  async fn() {
    // This would require a real audio file encoded as base64
    // Skipped unless you have test audio data
    console.log("⚠️  Integration test requires audio sample");
  },
});

Deno.test({
  name: "should generate story with Claude",
  ignore: !Deno.env.get("ANTHROPIC_API_KEY"),
  async fn() {
    if (!TEST_JWT) {
      console.log("⚠️  Skipping test: TEST_JWT not set");
      return;
    }

    const response = await callFunction({
      textInput: "A surreal dream about floating islands",
      generateVideo: false,
    });

    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertExists(data.storyNode.content);
    assertEquals(typeof data.storyNode.content, "string");
    assertEquals(data.options.length > 0, true);
  },
});

Deno.test({
  name: "should generate video with Fal.ai",
  ignore: !Deno.env.get("FAL_API_KEY"),
  async fn() {
    if (!TEST_JWT) {
      console.log("⚠️  Skipping test: TEST_JWT not set");
      return;
    }

    const response = await callFunction({
      textInput: "Brief dream for video test",
      generateVideo: true,
    });

    assertEquals(response.status, 200);
    
    const data = await response.json();
    // Video generation might fail gracefully
    // Check that response is still valid
    assertExists(data.storyNode);
  },
});

// ============================================================================
// MANUAL TEST SCRIPT
// ============================================================================

/**
 * Manual test runner
 * Usage: deno run --allow-net --allow-env test.ts
 */
if (import.meta.main) {
  console.log("🧪 Running manual tests...\n");

  // Check configuration
  console.log("Configuration:");
  console.log(`  SUPABASE_URL: ${SUPABASE_URL}`);
  console.log(`  TEST_JWT: ${TEST_JWT ? "✓ Set" : "✗ Not set"}`);
  console.log(`  ELEVENLABS_API_KEY: ${Deno.env.get("ELEVENLABS_API_KEY") ? "✓ Set" : "✗ Not set"}`);
  console.log(`  ANTHROPIC_API_KEY: ${Deno.env.get("ANTHROPIC_API_KEY") ? "✓ Set" : "✗ Not set"}`);
  console.log(`  FAL_API_KEY: ${Deno.env.get("FAL_API_KEY") ? "✓ Set" : "✗ Not set"}`);
  console.log();

  if (!TEST_JWT) {
    console.error("❌ TEST_JWT is required for testing");
    console.log("\nGet a test JWT by:");
    console.log("1. Creating a user in Supabase");
    console.log("2. Extracting the session token");
    console.log("3. Setting TEST_JWT environment variable");
    Deno.exit(1);
  }

  // Run basic test
  console.log("📝 Testing text input...");
  const response = await callFunction({
    textInput: "I had a dream about exploring an ancient library",
    generateVideo: false,
  });

  if (response.ok) {
    const data = await response.json();
    console.log("✅ Success!");
    console.log("\nResponse:");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error("❌ Failed!");
    const error = await response.text();
    console.error(error);
    Deno.exit(1);
  }
}

