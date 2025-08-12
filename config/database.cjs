const mongoose = require("mongoose");

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionPromise = null;
  }

  async connect(mongoUri = "mongodb://localhost:27017/shopify-app") {
    if (this.isConnected) {
      console.log("MongoDB already connected");
      return mongoose.connection;
    }

    if (this.connectionPromise) {
      console.log("MongoDB connection in progress, waiting...");
      return this.connectionPromise;
    }

    console.log(`Connecting to MongoDB: ${mongoUri}`);

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferCommands: false, // Disable mongoose buffering
    };

    this.connectionPromise = mongoose.connect(mongoUri, options);

    try {
      await this.connectionPromise;
      this.isConnected = true;
      console.log("MongoDB connected successfully");

      // Handle connection events
      mongoose.connection.on("connected", () => {
        console.log("Mongoose connected to MongoDB");
        this.isConnected = true;
      });

      mongoose.connection.on("error", (err) => {
        console.error("Mongoose connection error:", err);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("Mongoose disconnected from MongoDB");
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on("SIGINT", async () => {
        await this.disconnect();
        process.exit(0);
      });

      return mongoose.connection;
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      this.isConnected = false;
      this.connectionPromise = null;
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      console.log("MongoDB not connected");
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      this.connectionPromise = null;
      console.log("MongoDB disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      states: {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
      },
    };
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: "disconnected", message: "Not connected to MongoDB" };
      }

      // Simple ping to check if connection is alive
      await mongoose.connection.db.admin().ping();
      return {
        status: "healthy",
        message: "MongoDB connection is healthy",
        readyState: mongoose.connection.readyState,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: `MongoDB health check failed: ${error.message}`,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
