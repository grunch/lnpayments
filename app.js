require("dotenv").config();
const { pay } = require("./ln");

(async () => {
  try {
    const payment = await pay(
      "lnbcrt100u1p32fm9ppp5h4pcc8aln3nnaz5j2twrpkz4arm6nesenlmdsnv5uhvlygasczqsdqqcqzpgxqyz5vqrzjqv5hudhvhuswwtkl2xlzg3c0dy3465uyce3f9mrvlkvrqje03ycjjqqpdqqqqqgqqyqqqqlgqqqqqqgq9qsp5aakm09u7vmpadqywt7wdldstt953at4f7rtdxfjjmljjxpmhyd6s9qyyssqfkvg3wz9lpepzqfz2j3h8d2wn2al3jxyc0taa5a9fysu2syhpj735f50wsvxc62zsn4duky0wr8cffpxxmh5292ws24jujm0gjvqfwqp94nnf0",
      "probe"
    );
    console.log("payment", payment);
  } catch (error) {
    console.log(error);
  }
})();
