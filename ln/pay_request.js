const {
  payViaPaymentRequest,
  getPayment,
  probeForRoute,
  deleteForwardingReputations,
  payViaRoutes,
} = require("lightning");
const { parsePaymentRequest } = require("invoices");
const lnd = require("./connect");
const subscribeProbe = require("./subscribe_probe");

const payRequest = async (request, amount) => {
  try {
    // We need to set a max fee amount
    const maxFee = amount * parseFloat(process.env.MAX_ROUTING_FEE);

    // Delete all routing reputations to clear pathfinding memory
    await deleteForwardingReputations({ lnd });

    const payment = await payViaPaymentRequest({
      lnd,
      request,
      max_fee: maxFee,
    });

    return payment;
  } catch (error) {
    let message = error.toString();
    if (error[2] && error[2].err && error[2].err.details)
      message = error[2].err.details;
    console.log(`payRequest catch error: ${message}`);
    return false;
  }
};

const probePay = async (invoice) => {
  try {
    console.log(invoice);
    const amount = invoice.tokens;
    // We need to set a max fee amount
    const maxFee = amount * parseFloat(process.env.MAX_ROUTING_FEE);
    const maxFeeMsats = Math.round(maxFee * 1000).toString();
    const mtokens = (amount * 1000).toString();
    const features = invoice.features.map((feature) => {
      return { bit: feature.bit };
    });

    // Delete all routing reputations to clear pathfinding memory
    await deleteForwardingReputations({ lnd });

    // await subscribeProbe(invoice.destination, invoice.tokens);
    // Probe to find a successful route
    const { route } = await probeForRoute({
      lnd,
      destination: invoice.destination,
      mtokens,
      total_mtokens: mtokens,
      cltv_delta: invoice.cltv_delta + 3,
      payment: invoice.payment,
      max_fee_mtokens: maxFeeMsats,
      features,
      probe_timeout_ms: 30000,
      routes: invoice.routes,
    });
    console.log("route", route);
    const payment = await payViaRoutes({
      lnd,
      routes: [route],
      id: invoice.id,
    });

    return payment;
  } catch (error) {
    let message = error.toString();
    if (error[2] && error[2].err && error[2].err.details)
      message = error[2].err.details;
    console.log(`probePay catch error: ${message}`);
    return false;
  }
};

const pay = async (request, type) => {
  try {
    const invoice = parsePaymentRequest({ request });
    if (!invoice) return false;
    // If the invoice is expired we return is_expired = true
    if (invoice.is_expired) return false;
    if (!invoice.tokens) return false;

    // We check if the payment is on flight we don't do anything
    const isPending = await isPendingPayment(request);
    if (isPending) return false;
    let payment;
    if (type === "probe") {
      payment = await probePay(invoice);
    } else {
      payment = await payRequest(request, invoice.tokens);
    }

    if (!payment) return;

    return payment;
  } catch (error) {
    let message = error.toString();
    if (error[2] && error[2].err && error[2].err.details)
      message = error[2].err.details;
    console.log(`pay catch error: ${message}`);
    return false;
  }
};

const isPendingPayment = async (request) => {
  try {
    const { id } = parsePaymentRequest({ request });
    // eslint-disable-next-line camelcase
    const { is_pending } = await getPayment({ lnd, id });
    // eslint-disable-next-line camelcase
    return !!is_pending;
  } catch (error) {
    let message = error.toString();
    if (error[2] && error[2].err && error[2].err.details)
      message = error[2].err.details;
    console.log(`isPendingPayment catch error: ${message}`);
    return false;
  }
};

module.exports = {
  pay,
};
