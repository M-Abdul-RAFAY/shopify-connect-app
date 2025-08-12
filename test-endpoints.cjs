const axios = require("axios");

async function testEndpoints() {
  try {
    console.log("🧪 Testing MongoDB endpoints...\n");

    // Test database health
    console.log("1. Testing database health endpoint...");
    const healthResponse = await axios.get(
      "http://localhost:3001/api/db-health"
    );
    console.log(
      "✅ Database health:",
      JSON.stringify(healthResponse.data, null, 2)
    );

    // Test regular health
    console.log("\n2. Testing regular health endpoint...");
    const regularHealthResponse = await axios.get(
      "http://localhost:3001/api/health"
    );
    console.log(
      "✅ Server health:",
      JSON.stringify(regularHealthResponse.data, null, 2)
    );

    console.log("\n🎉 All endpoints are working correctly!");
  } catch (error) {
    console.error("❌ Error testing endpoints:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testEndpoints();
