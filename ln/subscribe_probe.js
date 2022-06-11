const { subscribeToProbeForRoute } = require("lightning");
const lnd = require("./connect");

const subscribeProbe = async (destination, tokens) => {
  try {
    const sub = subscribeToProbeForRoute({ destination, lnd, tokens });
    sub.on("probe_success", async (route) =>
      console.log(`Probe success: ${route}`)
    );
    sub.on("probing", async (route) => console.log(`Probing: ${route}`));
    sub.on("routing_failure", async (routing_failure) =>
      console.log(routing_failure)
    );
  } catch (error) {
    return false;
  }
};

module.exports = subscribeProbe;
